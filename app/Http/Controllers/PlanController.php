<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::query()->orderBy('sort_order')->get();

        return Inertia::render('SuperAdmin/Plans/Index', [
            'plans' => $plans,
            'trial_notice_message' => $this->trialNoticeMessage(),
        ]);
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/Plans/Create');
    }

    public function store(Request $request)
    {
        $validated = $this->validatedData($request);
        $validated['slug'] = Str::slug($validated['name']);

        Plan::create($validated);

        return redirect()->route('super-admin.plans.index')->with('success', 'Plan created successfully.');
    }

    public function edit(Plan $plan)
    {
        return Inertia::render('SuperAdmin/Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $this->validatedData($request, $plan);
        $validated['slug'] = Str::slug($validated['name']);

        $plan->update($validated);

        return redirect()->route('super-admin.plans.index')->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        if ($plan->subscriptions()->exists()) {
            return back()->with('error', 'This plan is already assigned to one or more workspaces.');
        }

        $plan->delete();

        return redirect()->route('super-admin.plans.index')->with('success', 'Plan deleted successfully.');
    }

    public function updateTrialNotice(Request $request)
    {
        $validated = $request->validate([
            'trial_notice_message' => 'required|string|max:255',
        ]);

        $now = now();
        $updated = DB::table('settings')
            ->whereNull('tenant_id')
            ->where('name', 'trial_notice_message')
            ->update([
                'value' => $validated['trial_notice_message'],
                'updated_at' => $now,
            ]);

        if (!$updated) {
            DB::table('settings')->insert([
                'tenant_id' => null,
                'name' => 'trial_notice_message',
                'value' => $validated['trial_notice_message'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return back()->with('success', 'Trial warning message updated successfully.');
    }

    protected function trialNoticeMessage(): string
    {
        $message = Setting::withoutGlobalScopes()
            ->whereNull('tenant_id')
            ->where('name', 'trial_notice_message')
            ->value('value');

        if ($message) {
            return $message;
        }

        return Setting::withoutGlobalScopes()
            ->where('name', 'trial_notice_message')
            ->latest('updated_at')
            ->value('value') ?: config('billing.trial_notice_message');
    }

    protected function validatedData(Request $request, ?Plan $plan = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('plans', 'name')->ignore($plan?->id)],
            'description' => 'nullable|string|max:1000',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'trial_days' => 'required|integer|min:0|max:60',
            'is_active' => 'required|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);
    }
}
