<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\BranchProductInventory;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderRefund;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Staff;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class DashboardNotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_dashboard_exposes_branch_scoped_notification_sections(): void
    {
        $mainBranch = Branch::query()->where('code', 'MAIN')->firstOrFail();
        $otherBranch = Branch::create([
            'name' => 'Outlet Branch',
            'code' => 'OUTLET',
            'is_active' => true,
        ]);

        $staff = Staff::factory()->create([
            'branch_id' => $mainBranch->id,
        ]);

        Permission::findOrCreate('view dashboard', 'web');
        $staff->givePermissionTo('view dashboard');

        $customer = Customer::create([
            'name' => 'Due Customer',
            'email' => 'customer@example.com',
            'phone' => '01700000011',
            'address' => 'Dhaka',
        ]);

        $refundCustomer = Customer::create([
            'name' => 'Refund Customer',
            'email' => 'refund@example.com',
            'phone' => '01700000012',
            'address' => 'Dhaka',
        ]);

        $supplier = Supplier::create([
            'name' => 'Due Supplier',
            'is_active' => true,
        ]);

        $lowStockProduct = Product::create([
            'name' => 'Low Stock Product',
            'selling_price' => 120,
            'buying_price' => 80,
            'stock' => 2,
            'unit' => 'pcs',
        ]);

        BranchProductInventory::query()->where('branch_id', $mainBranch->id)->delete();
        BranchProductInventory::create([
            'branch_id' => $mainBranch->id,
            'product_id' => $lowStockProduct->id,
            'stock' => 2,
        ]);

        BranchProductInventory::create([
            'branch_id' => $otherBranch->id,
            'product_id' => $lowStockProduct->id,
            'stock' => 0,
        ]);

        $overdueDueOrder = Order::create([
            'order_number' => 'ORD-DUE-001',
            'invoice_number' => 'INV-DUE-001',
            'customer_id' => $customer->id,
            'branch_id' => $mainBranch->id,
            'branch_name' => $mainBranch->name,
            'subtotal_amount' => 200,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total_amount' => 200,
            'shipping_charge' => 0,
            'paid_amount' => 50,
            'due_amount' => 150,
            'refunded_amount' => 0,
            'payment_status' => 'partial',
            'refund_status' => 'none',
            'order_status' => 'confirmed',
            'fulfillment_status' => 'delivered',
            'payment_method' => 'cash',
            'created_at' => now()->subDays(10),
            'updated_at' => now()->subDays(10),
        ]);

        $pendingDeliveryOrder = Order::create([
            'order_number' => 'ORD-DEL-001',
            'invoice_number' => 'INV-DEL-001',
            'customer_id' => $customer->id,
            'branch_id' => $mainBranch->id,
            'branch_name' => $mainBranch->name,
            'subtotal_amount' => 180,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total_amount' => 180,
            'shipping_charge' => 0,
            'paid_amount' => 180,
            'due_amount' => 0,
            'refunded_amount' => 0,
            'payment_status' => 'paid',
            'refund_status' => 'none',
            'order_status' => 'processing',
            'fulfillment_status' => 'packed',
            'payment_method' => 'cash',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        $refundOrder = Order::create([
            'order_number' => 'ORD-RFD-001',
            'invoice_number' => 'INV-RFD-001',
            'customer_id' => $refundCustomer->id,
            'branch_id' => $mainBranch->id,
            'branch_name' => $mainBranch->name,
            'subtotal_amount' => 140,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total_amount' => 140,
            'shipping_charge' => 0,
            'paid_amount' => 140,
            'due_amount' => 0,
            'refunded_amount' => 0,
            'payment_status' => 'paid',
            'refund_status' => 'none',
            'order_status' => 'confirmed',
            'fulfillment_status' => 'pending',
            'payment_method' => 'cash',
        ]);

        OrderRefund::create([
            'order_id' => $refundOrder->id,
            'refund_number' => 'RFD-001',
            'refunded_at' => now()->subDay(),
            'refund_method' => 'cash',
            'resolution_type' => 'refund',
            'total_amount' => 40,
            'workflow_status' => 'requested',
        ]);

        Purchase::create([
            'invoice_no' => 'PUR-001',
            'purchase_date' => now()->subDays(12)->toDateString(),
            'supplier_name' => $supplier->name,
            'supplier_id' => $supplier->id,
            'branch_id' => $mainBranch->id,
            'total_amount' => 300,
            'payment_status' => 'partial',
            'paid_amount' => 100,
            'due_amount' => 200,
        ]);

        Purchase::create([
            'invoice_no' => 'PUR-002',
            'purchase_date' => now()->subDays(20)->toDateString(),
            'supplier_name' => $supplier->name,
            'supplier_id' => $supplier->id,
            'branch_id' => $otherBranch->id,
            'total_amount' => 300,
            'payment_status' => 'partial',
            'paid_amount' => 0,
            'due_amount' => 300,
        ]);

        $response = $this->actingAs($staff)->get(route('dashboard'));

        $response->assertOk();

        $page = $response->viewData('page');
        $notifications = $page['props']['notifications'] ?? [];
        $sections = collect($notifications['sections'] ?? [])->keyBy('key');

        $this->assertSame(5, $notifications['summary']['total'] ?? null);
        $this->assertSame(1, $notifications['summary']['critical'] ?? null);
        $this->assertSame(3, $notifications['summary']['warning'] ?? null);
        $this->assertSame(1, $notifications['summary']['info'] ?? null);

        $this->assertSame(1, $sections->get('low_stock')['count'] ?? null);
        $this->assertSame('Low Stock Product', $sections->get('low_stock')['items'][0]['title'] ?? null);

        $this->assertSame(1, $sections->get('pending_refund_approvals')['count'] ?? null);
        $this->assertSame('RFD-001', $sections->get('pending_refund_approvals')['items'][0]['title'] ?? null);

        $this->assertSame(1, $sections->get('overdue_customer_dues')['count'] ?? null);
        $this->assertSame('Due Customer', $sections->get('overdue_customer_dues')['items'][0]['title'] ?? null);

        $this->assertSame(1, $sections->get('overdue_supplier_dues')['count'] ?? null);
        $this->assertSame('Due Supplier', $sections->get('overdue_supplier_dues')['items'][0]['title'] ?? null);

        $this->assertSame(2, $sections->get('pending_deliveries')['count'] ?? null);
        $this->assertContains(
            $pendingDeliveryOrder->order_number,
            collect($sections->get('pending_deliveries')['items'] ?? [])->pluck('title')->all()
        );

        $this->assertSame('orders.show', $sections->get('overdue_customer_dues')['items'][0]['route'] ?? null);
    }
}
