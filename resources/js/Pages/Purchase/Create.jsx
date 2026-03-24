import React, { useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { formatCurrency } from "@/lib/currency";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const branchStockForProduct = (product, branchId) => {
    if (!branchId) {
        return Number(product.stock || 0);
    }

    const inventory = product.branch_inventories?.find(
        (item) => String(item.branch_id) === String(branchId)
    );

    return Number(inventory?.stock || 0);
};

export default function Create({
    products,
    branches = [],
    activeBranchId = "",
    suppliers = [],
    banks = [],
}) {
    const { settings } = usePage().props;
    const currencySymbol = settings?.currency_symbol || "TK";
    const [rows, setRows] = useState([
        { product_id: "", quantity: 1, buying_price: 0 },
    ]);

    const { data, setData, post, processing } = useForm({
        supplier_id: "",
        branch_id: activeBranchId || branches[0]?.id || "",
        purchase_date: "",
        payment_status: "paid",
        paid_amount: 0,
        payment_method: "cash",
        bank_id: "",
        mfs: "",
        items: rows,
    });

    useEffect(() => {
        setData("items", rows);
    }, [rows]);

    const totalAmount = rows.reduce(
        (sum, row) => sum + row.quantity * row.buying_price,
        0
    );

    useEffect(() => {
        if (data.payment_status === "paid") {
            setData("paid_amount", totalAmount);
        }

        if (data.payment_status === "unpaid") {
            setData("paid_amount", 0);
        }
    }, [data.payment_status, totalAmount]);

    useEffect(() => {
        if (data.payment_status === "partial" && data.paid_amount > totalAmount) {
            setData("paid_amount", totalAmount);
        }
    }, [data.paid_amount, totalAmount]);

    const addRow = () => {
        setRows([...rows, { product_id: "", quantity: 1, buying_price: 0 }]);
    };

    const removeRow = (i) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, idx) => idx !== i));
    };

    const handleChange = (i, field, value) => {
        const updated = [...rows];
        updated[i][field] =
            field === "quantity" || field === "buying_price" ? Number(value) : value;
        setRows(updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("purchases.store"));
    };

    return (
        <AuthenticatedLayout title="Create Purchase">
            <CreatePageLayout
                title="Create Purchase"
                description="Record incoming stock with supplier, branch, payment, and line-item details in one guided workflow designed for operational accuracy."
                backRoute="purchases.index"
                meta={[
                    { label: "Module", value: "Procurement" },
                    {
                        label: "Current total",
                        value: formatCurrency(totalAmount, currencySymbol),
                    },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Purchase Entry Tips"
                        items={[
                            {
                                title: "Choose the correct branch",
                                description:
                                    "Purchases update branch inventory, so the receiving branch should be accurate before saving.",
                            },
                            {
                                title: "Review quantities and prices",
                                description:
                                    "Clean input here keeps stock valuation and supplier dues trustworthy later.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={submit} className="space-y-6">
                    <CreateSectionCard
                        title="Purchase Overview"
                        description="Start with the supplier, receiving branch, and payment setup before adding individual products."
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Supplier
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.supplier_id}
                                        onChange={(e) =>
                                            setData("supplier_id", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Select supplier</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                                {supplier.phone
                                                    ? ` - ${supplier.phone}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Branch
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.branch_id}
                                        onChange={(e) => setData("branch_id", e.target.value)}
                                        required
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Purchase date
                                    </legend>
                                    <input
                                        type="date"
                                        className="custom-input"
                                        value={data.purchase_date}
                                        onChange={(e) =>
                                            setData("purchase_date", e.target.value)
                                        }
                                        required
                                    />
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Payment status
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.payment_status}
                                        onChange={(e) =>
                                            setData("payment_status", e.target.value)
                                        }
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Payment method
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.payment_method}
                                        onChange={(e) =>
                                            setData("payment_method", e.target.value)
                                        }
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                        <option value="mobile">Mobile Banking</option>
                                    </select>
                                </fieldset>
                            </div>

                            {data.payment_method === "bank" ? (
                                <div className="field-stack">
                                    <fieldset className="custom-fieldset">
                                        <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                            Bank
                                        </legend>
                                        <select
                                            className="custom-input"
                                            value={data.bank_id}
                                            onChange={(e) =>
                                                setData("bank_id", e.target.value)
                                            }
                                        >
                                            <option value="">Select bank</option>
                                            {banks.map((bank) => (
                                                <option key={bank.id} value={bank.id}>
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    </fieldset>
                                </div>
                            ) : null}

                            {data.payment_method === "mobile" ? (
                                <div className="field-stack">
                                    <fieldset className="custom-fieldset">
                                        <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                            Mobile service
                                        </legend>
                                        <select
                                            className="custom-input"
                                            value={data.mfs}
                                            onChange={(e) => setData("mfs", e.target.value)}
                                        >
                                            <option value="">Select service</option>
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                            <option value="rocket">Rocket</option>
                                        </select>
                                    </fieldset>
                                </div>
                            ) : null}
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Products"
                        description="Add all purchased items with quantity and buying price. Branch stock is shown for context before the new stock is received."
                    >
                        <div className="overflow-x-auto">
                            <table className="custom-table min-w-[880px]">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Product</th>
                                        <th className="custom-th">Current Branch Stock</th>
                                        <th className="custom-th">Quantity</th>
                                        <th className="custom-th">Buying Price</th>
                                        <th className="custom-th">Total</th>
                                        <th className="custom-th rounded-r-md text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i} className="custom-body-tr">
                                            <td className="custom-body-td">
                                                <select
                                                    className="custom-input"
                                                    value={row.product_id}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            i,
                                                            "product_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">Select</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="custom-body-td">
                                                {row.product_id
                                                    ? branchStockForProduct(
                                                          products.find(
                                                              (product) =>
                                                                  String(product.id) ===
                                                                  String(row.product_id)
                                                          ) || {},
                                                          data.branch_id
                                                      )
                                                    : 0}
                                            </td>

                                            <td className="custom-body-td">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="custom-input"
                                                    value={row.quantity}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            i,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="custom-body-td">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="custom-input"
                                                    value={row.buying_price}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            i,
                                                            "buying_price",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="custom-body-td">
                                                {formatCurrency(
                                                    row.quantity * row.buying_price,
                                                    currencySymbol
                                                )}
                                            </td>

                                            <td className="custom-body-td text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(i)}
                                                    className="delete-button"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={addRow}
                                className="secondary-button"
                            >
                                Add product row
                            </button>
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Payment Summary"
                        description="The total updates automatically as you edit the purchase lines and payment status."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Save purchase"}
                                </button>
                            </div>
                        }
                    >
                        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="rounded-[20px] border border-border bg-background/80 p-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total amount
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {formatCurrency(totalAmount, currencySymbol)}
                                </p>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Paid amount
                                    </legend>
                                    <input
                                        type="number"
                                        min="0"
                                        className="custom-input"
                                        value={data.paid_amount}
                                        onChange={(e) =>
                                            setData("paid_amount", Number(e.target.value))
                                        }
                                        disabled={data.payment_status !== "partial"}
                                    />
                                </fieldset>
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
}
