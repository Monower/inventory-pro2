<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $branches = Branch::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('code', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('address', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('branches/index', [
            'branches' => $branches,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('branches/create');
    }

    public function workspace(Request $request)
    {
        $user = $request->user()->loadMissing('branch');
        $accessibleBranches = $user->branch_id
            ? Branch::query()->whereKey($user->branch_id)->get()
            : Branch::query()->where('is_active', true)->orderBy('name')->get();

        $activeBranch = $accessibleBranches->firstWhere('id', $request->session()->get('active_branch_id'))
            ?? $user->branch
            ?? $accessibleBranches->first();

        return Inertia::render('branches/Workspace', [
            'assignedBranch' => $user->branch ? [
                'id' => $user->branch->id,
                'name' => $user->branch->name,
                'code' => $user->branch->code,
            ] : null,
            'activeBranch' => $activeBranch ? [
                'id' => $activeBranch->id,
                'name' => $activeBranch->name,
                'code' => $activeBranch->code,
            ] : null,
            'branchOptions' => $accessibleBranches->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'phone' => $branch->phone,
                'email' => $branch->email,
                'address' => $branch->address,
                'is_active' => (bool) $branch->is_active,
            ])->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateBranch($request);

        Branch::create([
            ...$validated,
            'code' => Str::upper($validated['code']),
        ]);

        return to_route('branches.index')->with('success', 'Branch created successfully.');
    }

    public function edit($branchId)
    {
        return Inertia::render('branches/edit', [
            'branch' => Branch::findOrFail($branchId),
        ]);
    }

    public function update(Request $request, $branchId)
    {
        $branch = Branch::findOrFail($branchId);
        $validated = $this->validateBranch($request, $branch->id);

        $branch->update([
            ...$validated,
            'code' => Str::upper($validated['code']),
        ]);

        return to_route('branches.index')->with('success', 'Branch updated successfully.');
    }

    public function destroy($branchId)
    {
        $branch = Branch::findOrFail($branchId);

        if (
            $branch->orders()->exists() ||
            $branch->purchases()->exists() ||
            $branch->outgoingTransfers()->exists() ||
            $branch->incomingTransfers()->exists()
        ) {
            return to_route('branches.index')->with('error', 'Branches with transactions cannot be deleted.');
        }

        $branch->delete();

        return to_route('branches.index')->with('success', 'Branch deleted successfully.');
    }

    public function switch(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
        ]);

        $user = $request->user()->loadMissing('branch');
        $allowedBranchIds = $user->branch_id
            ? [$user->branch_id]
            : Branch::query()->where('is_active', true)->pluck('id')->all();

        if (!in_array((int) $validated['branch_id'], $allowedBranchIds, true)) {
            return back()->with('error', 'You are not allowed to switch to that branch.');
        }

        $request->session()->put('active_branch_id', (int) $validated['branch_id']);

        return back()->with('success', 'Active branch updated successfully.');
    }

    private function validateBranch(Request $request, ?int $branchId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255|unique:branches,name,' . $branchId,
            'code' => 'required|string|max:50|unique:branches,code,' . $branchId,
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
            'is_active' => 'required|boolean',
        ]);
    }
}
