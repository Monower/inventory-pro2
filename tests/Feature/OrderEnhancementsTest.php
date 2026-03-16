<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class OrderEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_order_store_applies_a_real_coupon(): void
    {
        $user = $this->createUserWithPermissions(['create order']);
        $customer = Customer::create([
            'name' => 'Test Customer',
            'phone' => '01700000000',
        ]);
        $product = Product::create([
            'name' => 'Desk Lamp',
            'selling_price' => 100,
            'buying_price' => 60,
            'stock' => 10,
        ]);
        $coupon = Coupon::create([
            'code' => 'SAVE10',
            'name' => 'Ten Percent',
            'discount_type' => 'percent',
            'discount_value' => 10,
            'minimum_order_amount' => 0,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->post(route('orders.store'), [
            'customer_id' => $customer->id,
            'cart' => [
                ['id' => $product->id, 'quantity' => 2],
            ],
            'coupon_code' => 'SAVE10',
            'discount_amount' => 0,
            'tax_rate' => 0,
            'shipping_charge' => 0,
            'payment_method' => 'cash',
            'payment_amount' => 100,
        ]);

        $response->assertRedirect(route('orders.index'));

        $order = Order::firstOrFail();

        $this->assertSame($coupon->id, $order->coupon_id);
        $this->assertEquals(20.0, (float) $order->coupon_discount_amount);
        $this->assertEquals(20.0, (float) $order->discount_amount);
        $this->assertEquals(180.0, (float) $order->total_amount);
        $this->assertEquals(80.0, (float) $order->due_amount);
        $this->assertEquals(1, $coupon->fresh()->times_used);
    }

    public function test_refund_request_only_updates_order_after_approval(): void
    {
        $user = $this->createUserWithPermissions(['refund order', 'approve refund case']);
        $customer = Customer::create([
            'name' => 'Refund Customer',
            'phone' => '01700000001',
        ]);
        $product = Product::create([
            'name' => 'Bluetooth Speaker',
            'selling_price' => 50,
            'buying_price' => 30,
            'stock' => 3,
        ]);
        $order = Order::create([
            'order_number' => 'ORD-TST-1',
            'invoice_number' => 'INV-TST-1',
            'customer_id' => $customer->id,
            'subtotal_amount' => 100,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total_amount' => 100,
            'shipping_charge' => 0,
            'paid_amount' => 100,
            'due_amount' => 0,
            'refunded_amount' => 0,
            'payment_status' => 'paid',
            'refund_status' => 'none',
            'order_status' => 'confirmed',
            'fulfillment_status' => 'pending',
            'payment_method' => 'cash',
        ]);
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 50,
        ]);

        $requestResponse = $this->actingAs($user)->post(route('orders.refunds.store', $order->id), [
            'refunded_at' => now()->format('Y-m-d H:i:s'),
            'resolution_type' => 'refund',
            'refund_method' => 'cash',
            'reason' => 'Damaged item',
            'items' => [
                [
                    'order_item_id' => $orderItem->id,
                    'quantity' => 1,
                    'restock_to_inventory' => true,
                ],
            ],
        ]);

        $requestResponse->assertRedirect(route('orders.show', $order->id));

        $refund = $order->refunds()->firstOrFail();

        $this->assertSame('requested', $refund->workflow_status);
        $this->assertEquals(0.0, (float) $order->fresh()->refunded_amount);
        $this->assertEquals(3, $product->fresh()->stock);

        $approveResponse = $this->actingAs($user)->patch(route('orders.refunds.approve', [$order->id, $refund->id]));

        $approveResponse->assertRedirect(route('orders.show', $order->id));

        $this->assertSame('processed', $refund->fresh()->workflow_status);
        $this->assertEquals(50.0, (float) $order->fresh()->refunded_amount);
        $this->assertSame('partial', $order->fresh()->refund_status);
        $this->assertEquals(4, $product->fresh()->stock);
        $this->assertDatabaseHas('stock_ledgers', [
            'product_id' => $product->id,
            'movement_type' => 'customer_return',
        ]);
    }

    public function test_stock_ledger_page_respects_permission_and_filters(): void
    {
        $user = $this->createUserWithPermissions(['view stock ledger']);
        $product = Product::create([
            'name' => 'Mouse',
            'selling_price' => 20,
            'buying_price' => 10,
            'stock' => 15,
        ]);

        StockLedger::create([
            'product_id' => $product->id,
            'movement_type' => 'sale',
            'quantity_change' => -2,
            'balance_after' => 15,
            'notes' => 'Sale ledger test',
            'causer_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->get(route('stock-ledgers.index', [
            'movement_type' => 'sale',
        ]));

        $response->assertOk();
        $response->assertSee('Sale ledger test');
    }

    private function createUserWithPermissions(array $permissionNames): User
    {
        $user = User::factory()->create();

        foreach ($permissionNames as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        $user->givePermissionTo($permissionNames);

        return $user;
    }
}
