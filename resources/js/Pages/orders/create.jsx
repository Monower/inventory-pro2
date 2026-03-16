import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import Modal from "@/Components/Modal/Modal";
import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import Alert from "@/Components/Alert/Alert";
import { sanitizePhoneInput } from "@/lib/phone";

const calculateCouponDiscount = (coupon, subtotalAfterManualDiscount) => {
    if (!coupon || subtotalAfterManualDiscount <= 0) {
        return 0;
    }

    if (Number(coupon.minimum_order_amount || 0) > subtotalAfterManualDiscount) {
        return 0;
    }

    let discount =
        coupon.discount_type === "percent"
            ? subtotalAfterManualDiscount * (Number(coupon.discount_value || 0) / 100)
            : Number(coupon.discount_value || 0);

    if (coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined) {
        discount = Math.min(discount, Number(coupon.max_discount_amount || 0));
    }

    return Math.min(discount, subtotalAfterManualDiscount);
};

const branchStockForProduct = (product, branchId) => {
    if (!branchId) {
        return Number(product.stock || 0);
    }

    const inventory = product.branch_inventories?.find(
        (item) => String(item.branch_id) === String(branchId)
    );

    return Number(inventory?.stock || 0);
};

const Create = ({
    customers,
    products,
    banks,
    staffs,
    coupons = [],
    branches = [],
    activeBranchId = "",
}) => {
    const { auth, flash, settings } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const phoneDigits = Number(settings?.phone_digits || 11);
    const canCreateCustomer = permissions.includes("create customer");
    const [cart, setCart] = useState([]);
    const [clientError, setClientError] = useState("");
    const [couponSearch, setCouponSearch] = useState("");
    const [customerOptions, setCustomerOptions] = useState(customers || []);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    // useForm hook for the order
    const { data, setData, post, errors, processing } = useForm({
        customer_id: "",
        salesperson_staff_id: "",
        branch_id: activeBranchId || branches[0]?.id || "",
        branch_name: "",
        shipping_address: "",
        coupon_code: "",
        discount_amount: 0,
        tax_rate: 0,
        shipping_charge: 0,
        courier_name: "",
        tracking_number: "",
        fulfillment_status: "pending",
        payment_method: "cash",
        bank_id: "",
        mfs: "",
        payment_amount: "",
        cart: [],
    });
    const customerForm = useForm({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    const allErrors = Object.values(errors);

    useEffect(() => {
        setCustomerOptions(customers || []);
    }, [customers]);

    // Add product to cart
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // Update quantity
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity: Number(quantity) } : item
            )
        );
    };

    // Remove item
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Totals
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.selling_price * item.quantity,
        0
    );
    const manualDiscountAmount = Math.min(Number(data.discount_amount) || 0, totalPrice);
    const selectedCoupon = coupons.find(
        (coupon) => coupon.code === data.coupon_code
    );
    const couponDiscountAmount = calculateCouponDiscount(
        selectedCoupon,
        Math.max(totalPrice - manualDiscountAmount, 0)
    );
    const discountAmount = manualDiscountAmount + couponDiscountAmount;
    const taxableBase = Math.max(totalPrice - discountAmount, 0);
    const taxAmount = taxableBase * ((Number(data.tax_rate) || 0) / 100);
    const shippingCharge = Number(data.shipping_charge) || 0;
    const grandTotal = taxableBase + taxAmount + shippingCharge;
    const filteredCoupons = coupons.filter((coupon) => {
        const term = couponSearch.trim().toLowerCase();
        if (!term) {
            return true;
        }

        return (
            coupon.code.toLowerCase().includes(term) ||
            coupon.name.toLowerCase().includes(term)
        );
    });

    // Sync cart with form data whenever it changes
    useEffect(() => {
        setData(
            "cart",
            cart.map((item) => ({ id: item.id, quantity: item.quantity }))
        );
    }, [cart]);

    useEffect(() => {
        if (selectedCoupon) {
            setCouponSearch(`${selectedCoupon.code} - ${selectedCoupon.name}`);
        }
    }, [data.coupon_code]);

    useEffect(() => {
        const createdCustomer = flash?.createdCustomer;

        if (!createdCustomer?.id) {
            return;
        }

        setCustomerOptions((previous) => {
            if (previous.some((customer) => String(customer.id) === String(createdCustomer.id))) {
                return previous;
            }

            return [...previous, createdCustomer];
        });
        setData("customer_id", createdCustomer.id);
        setShowCustomerModal(false);
        customerForm.reset();
    }, [flash?.createdCustomer]);

    const openCustomerModal = () => {
        customerForm.reset();
        customerForm.clearErrors();
        setShowCustomerModal(true);
    };

    const closeCustomerModal = () => {
        customerForm.reset();
        customerForm.clearErrors();
        setShowCustomerModal(false);
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            setClientError("Cart is empty.");
            return;
        }
        setClientError("");
        post("/orders");
    };

    const handleCustomerSubmit = (event) => {
        event.preventDefault();
        customerForm.post(route("customer.quick-store"), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout title="Create Order">
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"orders.index"} />
                    <div>
                        <h3 className="heading">Create Order</h3>
                        <p className="text-gray-500">
                            Manage products, customers and checkout below.
                        </p>
                    </div>
                </div>

                {allErrors.length > 0 && (
                    <Alert
                        flash={{
                            error: (
                                <ul className="list-disc pl-5">
                                    {allErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            ),
                        }}
                    />
                )}
                {clientError && (
                    <Alert flash={{ error: clientError }} autoHideMs={3000} />
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Products & Cart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Products */}
                        <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                            <h3 className="heading">Products list</h3>
                            <p className="mb-3 text-sm text-muted-foreground">
                                Available stock is shown for the selected branch.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="custom-table">
                                    <thead className="custom-thead">
                                        <tr>
                                            <th className="custom-th rounded-l-md">
                                                Name
                                            </th>
                                            <th className="custom-th">
                                                Buying price
                                            </th>
                                            <th className="custom-th">
                                                Selling price
                                            </th>
                                            <th className="custom-th">Stock</th>
                                            <th className="custom-th rounded-r-md">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products
                                            ?.filter(
                                                (product) =>
                                                    !cart.find(
                                                        (item) =>
                                                            item.id ===
                                                            product.id
                                                    )
                                            )
                                            .map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className="custom-body-tr"
                                                >
                                                    <td className="custom-body-td">
                                                        {product.name}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.buying_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.selling_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {branchStockForProduct(product, data.branch_id)}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                addToCart(
                                                                    product
                                                                )
                                                            }
                                                            className="create-button"
                                                            disabled={
                                                                !data.branch_id ||
                                                                branchStockForProduct(
                                                                    product,
                                                                    data.branch_id
                                                                ) <= 0
                                                            }
                                                        >
                                                            Add to cart
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                            <h3 className="heading">Cart list</h3>
                            {cart.length === 0 ? (
                                <p className="text-gray-500">
                                    No items in cart
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="custom-table">
                                        <thead className="custom-thead">
                                            <tr>
                                                <th className="custom-th rounded-l-md">
                                                    Name
                                                </th>
                                                <th className="custom-th">
                                                    Selling price
                                                </th>
                                                <th className="custom-th">
                                                    Qty
                                                </th>
                                                <th className="custom-th">
                                                    Total
                                                </th>
                                                <th className="custom-th rounded-r-md">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="custom-body-tr"
                                                >
                                                    <td className="custom-body-td">
                                                        {item.name}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {item.selling_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <input
                                                            type="number"
                                                            value={
                                                                item.quantity
                                                            }
                                                            min="1"
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-16 rounded-md custom-input border border-ring"
                                                        />
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {item.selling_price *
                                                            item.quantity}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.id
                                                                )
                                                            }
                                                            className="bg-destructive text-white px-3 py-1 rounded-md hover:bg-red-700 ease-in-out duration-300"
                                                        >
                                                            Remove from cart
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Checkout */}
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                        <h3 className="heading">Checkout</h3>
                        <div className="grid gap-6">
                            {/* Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background* border border-ring shadow-md py-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-primary">Subtotal</p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {totalPrice}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-primary">
                                        Total quantity
                                    </p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {totalQuantity}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-primary">Shipping</p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {shippingCharge}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-primary">Discount</p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {discountAmount}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-primary">Tax</p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {taxAmount.toFixed(2)}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-primary">Grand total</p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {grandTotal.toFixed(2)}
                                    </h3>
                                </div>
                            </div>

                            {/* Customer */}
                            <div>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <label className="required-label">
                                        Select customer
                                    </label>
                                    {canCreateCustomer && (
                                        <button
                                            type="button"
                                            onClick={openCustomerModal}
                                            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                                        >
                                            Add new customer
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) =>
                                        setData("customer_id", e.target.value)
                                    }
                                    className="custom-input"
                                >
                                    <option value="">-- Select --</option>
                                    {customerOptions?.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.name ? `${customer.name} - ${customer.phone}` : customer.phone}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="text-red-500 text-sm">
                                        {errors.customer_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block">Salesperson</label>
                                    <select
                                        value={data.salesperson_staff_id}
                                        onChange={(e) =>
                                            setData("salesperson_staff_id", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">-- Select salesperson --</option>
                                        {staffs?.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block">Branch</label>
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) =>
                                            setData("branch_id", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">-- Select branch --</option>
                                        {branches?.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.branch_id && (
                                        <p className="text-red-500 text-sm">
                                            {errors.branch_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block">Coupon</label>
                                    <input
                                        type="text"
                                        value={couponSearch}
                                        onChange={(e) =>
                                            setCouponSearch(e.target.value)
                                        }
                                        className="custom-input mb-2"
                                        placeholder="Search coupon by code or name"
                                    />
                                    <select
                                        value={data.coupon_code}
                                        onChange={(e) => {
                                            const nextCoupon = coupons.find(
                                                (coupon) =>
                                                    coupon.code === e.target.value
                                            );
                                            setData("coupon_code", e.target.value);
                                            setCouponSearch(
                                                nextCoupon
                                                    ? `${nextCoupon.code} - ${nextCoupon.name}`
                                                    : ""
                                            );
                                        }}
                                        className="custom-input"
                                    >
                                        <option value="">-- No coupon --</option>
                                        {filteredCoupons.map((coupon) => (
                                            <option key={coupon.id} value={coupon.code}>
                                                {coupon.code} - {coupon.name}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedCoupon && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {selectedCoupon.discount_type === "percent"
                                                ? `${selectedCoupon.discount_value}% off`
                                                : `${selectedCoupon.discount_value} off`}
                                            {" • "}Minimum order {selectedCoupon.minimum_order_amount}
                                            {" • "}Coupon discount preview {couponDiscountAmount.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block">Coupon code</label>
                                    <input
                                        type="text"
                                        value={data.coupon_code}
                                        onChange={(e) =>
                                            setData("coupon_code", e.target.value.toUpperCase())
                                        }
                                        className="custom-input"
                                        placeholder="Optional coupon code"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block">Discount amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.discount_amount}
                                        onChange={(e) =>
                                            setData("discount_amount", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="0.00"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Manual discount: {manualDiscountAmount.toFixed(2)}
                                        {" • "}Coupon discount: {couponDiscountAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block">Tax rate (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.tax_rate}
                                        onChange={(e) =>
                                            setData("tax_rate", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block">Shipping charge</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.shipping_charge}
                                        onChange={(e) =>
                                            setData("shipping_charge", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block">Fulfillment status</label>
                                    <select
                                        value={data.fulfillment_status}
                                        onChange={(e) =>
                                            setData("fulfillment_status", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="packed">Packed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block">Courier</label>
                                    <input
                                        type="text"
                                        value={data.courier_name}
                                        onChange={(e) =>
                                            setData("courier_name", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Courier service"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block">Tracking no.</label>
                                    <input
                                        type="text"
                                        value={data.tracking_number}
                                        onChange={(e) =>
                                            setData("tracking_number", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Tracking number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block">Shipping address</label>
                                <textarea
                                    value={data.shipping_address}
                                    onChange={(e) =>
                                        setData("shipping_address", e.target.value)
                                    }
                                    className="custom-input resize-none"
                                    rows={3}
                                    placeholder="Delivery or shipping address"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="required-label mb-2">
                                    Payment method
                                </label>
                                <div className="flex flex-wrap gap-6">
                                    {["cash", "bank", "mobile"].map(
                                        (method) => (
                                            <label
                                                key={method}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method}
                                                    checked={
                                                        data.payment_method ===
                                                        method
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "payment_method",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {method
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        method.slice(1)}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                                {errors.payment_method && (
                                    <p className="text-red-500 text-sm">
                                        {errors.payment_method}
                                    </p>
                                )}
                            </div>

                            {/* Bank */}
                            {data?.payment_method === "bank" && (
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-1">
                                        Select bank
                                    </label>
                                    <select
                                        value={data?.bank_id}
                                        onChange={(e) =>
                                            setData("bank_id", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">
                                            -- Select bank --
                                        </option>
                                        {banks?.map((bank) => (
                                            <option
                                                key={bank.id}
                                                value={bank.id}
                                            >
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.bank_id && (
                                        <p className="text-red-500 text-sm">
                                            {errors.bank_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Mobile */}
                            {data.payment_method === "mobile" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select mobile financial service
                                    </label>
                                    <select
                                        value={data.mfs}
                                        onChange={(e) =>
                                            setData("mfs", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">
                                            -- Select MFS --
                                        </option>
                                        <option value="bkash">Bkash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="rocket">Rocket</option>
                                    </select>
                                    {errors.mfs && (
                                        <p className="text-red-500 text-sm">
                                            {errors.mfs}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Payment Amount */}
                            <div>
                                <label className="required-label mb-1">
                                    Payment amount
                                </label>
                                <input
                                    type="number"
                                    value={data.payment_amount}
                                    onChange={(e) =>
                                        setData(
                                            "payment_amount",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter amount"
                                    className="custom-input"
                                />
                                {errors.payment_amount && (
                                    <p className="text-red-500 text-sm">
                                        {errors.payment_amount}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-green-600 text-white w-full md:w-auto px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                                >
                                    {processing
                                        ? "Creating..."
                                        : "Create Order"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <Modal
                    open={showCustomerModal}
                    onOpenChange={(isOpen) => {
                        if (isOpen) {
                            openCustomerModal();
                            return;
                        }

                        closeCustomerModal();
                    }}
                    title="Add Customer"
                    description="Create a customer without leaving checkout."
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={closeCustomerModal}
                                className="rounded-md border border-ring px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCustomerSubmit}
                                disabled={customerForm.processing}
                                className="create-button"
                            >
                                {customerForm.processing ? "Saving..." : "Save customer"}
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block">Name</label>
                            <input
                                type="text"
                                value={customerForm.data.name}
                                onChange={(e) => customerForm.setData("name", e.target.value)}
                                className="custom-input"
                                placeholder="Customer name"
                            />
                            <small className="text-destructive">{customerForm.errors.name}</small>
                        </div>
                        <div>
                            <label className="required-label mb-1 block">Phone</label>
                            <input
                                type="text"
                                value={customerForm.data.phone}
                                onChange={(e) =>
                                    customerForm.setData(
                                        "phone",
                                        sanitizePhoneInput(e.target.value, phoneDigits),
                                    )
                                }
                                className="custom-input"
                                placeholder={`${phoneDigits}-digit phone number`}
                                inputMode="numeric"
                                maxLength={phoneDigits}
                            />
                            <div className="mt-1 text-right text-xs text-muted-foreground">
                                {customerForm.data.phone.length}/{phoneDigits}
                            </div>
                            <small className="text-destructive">{customerForm.errors.phone}</small>
                        </div>
                        <div>
                            <label className="mb-1 block">Email</label>
                            <input
                                type="email"
                                value={customerForm.data.email}
                                onChange={(e) => customerForm.setData("email", e.target.value)}
                                className="custom-input"
                                placeholder="Optional email"
                            />
                            <small className="text-destructive">{customerForm.errors.email}</small>
                        </div>
                        <div>
                            <label className="mb-1 block">Address</label>
                            <textarea
                                value={customerForm.data.address}
                                onChange={(e) => customerForm.setData("address", e.target.value)}
                                className="custom-input resize-none"
                                rows={3}
                                placeholder="Optional address"
                            />
                            <small className="text-destructive">{customerForm.errors.address}</small>
                        </div>
                    </form>
                </Modal>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
