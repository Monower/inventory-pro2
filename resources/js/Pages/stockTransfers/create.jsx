import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
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

const Create = ({
    products = [],
    sourceBranches = [],
    destinationBranches = [],
    activeBranchId = "",
}) => {
    const [rows, setRows] = useState([{ product_id: "", requested_quantity: 1 }]);

    const { data, setData, post, processing, errors } = useForm({
        source_branch_id: activeBranchId || sourceBranches[0]?.id || "",
        destination_branch_id: "",
        notes: "",
        items: rows,
    });

    useEffect(() => {
        setData("items", rows);
    }, [rows]);

    const filteredDestinations = useMemo(
        () =>
            destinationBranches.filter(
                (branch) => String(branch.id) !== String(data.source_branch_id)
            ),
        [destinationBranches, data.source_branch_id]
    );

    const updateRow = (index, key, value) => {
        const next = [...rows];
        next[index][key] = key === "requested_quantity" ? Number(value) : value;
        setRows(next);
    };

    const addRow = () => {
        setRows([...rows, { product_id: "", requested_quantity: 1 }]);
    };

    const removeRow = (index) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, rowIndex) => rowIndex !== index));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("stock-transfers.store"));
    };

    return (
        <AuthenticatedLayout title="Create Stock Transfer">
            <CreatePageLayout
                title="Create Stock Transfer"
                description="Prepare a branch-to-branch stock movement request with source, destination, notes, and requested quantities in a cleaner operational workflow."
                backRoute="stock-transfers.index"
                meta={[
                    { label: "Module", value: "Inventory movement" },
                    { label: "Items", value: `${rows.length} line item(s)` },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Transfer Best Practices"
                        items={[
                            {
                                title: "Check source stock first",
                                description:
                                    "The available quantity shown here helps prevent unrealistic transfer requests.",
                            },
                            {
                                title: "Explain unusual moves",
                                description:
                                    "Use notes for urgent replenishment, balancing, or special approval context.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CreateSectionCard
                        title="Transfer Overview"
                        description="Choose the sending and receiving branches first, then add any notes that will help with approval and fulfillment."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Source branch
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.source_branch_id}
                                        onChange={(e) =>
                                            setData("source_branch_id", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Select source branch</option>
                                        {sourceBranches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.source_branch_id ? (
                                    <p className="field-error">{errors.source_branch_id}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Destination branch
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.destination_branch_id}
                                        onChange={(e) =>
                                            setData("destination_branch_id", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Select destination branch</option>
                                        {filteredDestinations.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.destination_branch_id ? (
                                    <p className="field-error">
                                        {errors.destination_branch_id}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                    Transfer notes
                                </legend>
                                <textarea
                                    className="custom-input resize-none"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData("notes", e.target.value)}
                                    placeholder="Explain urgency, balancing reason, or handling instructions"
                                />
                            </fieldset>
                            {errors.notes ? <p className="field-error">{errors.notes}</p> : null}
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Requested Items"
                        description="Add the products to move and the requested quantities. Source stock is shown for each product to support better decisions."
                        footer={
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="secondary-button"
                                >
                                    Add item
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create request"}
                                </button>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="custom-table min-w-[760px]">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Product</th>
                                        <th className="custom-th">Source stock</th>
                                        <th className="custom-th">Requested qty</th>
                                        <th className="custom-th rounded-r-md">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => {
                                        const product = products.find(
                                            (item) =>
                                                String(item.id) === String(row.product_id)
                                        );

                                        return (
                                            <tr key={index} className="custom-body-tr">
                                                <td className="custom-body-td">
                                                    <select
                                                        className="custom-input"
                                                        value={row.product_id}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                index,
                                                                "product_id",
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    >
                                                        <option value="">
                                                            Select product
                                                        </option>
                                                        {products.map((item) => (
                                                            <option
                                                                key={item.id}
                                                                value={item.id}
                                                            >
                                                                {item.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="custom-body-td">
                                                    {branchStockForProduct(
                                                        product || {},
                                                        data.source_branch_id
                                                    )}
                                                </td>
                                                <td className="custom-body-td">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="custom-input"
                                                        value={row.requested_quantity}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                index,
                                                                "requested_quantity",
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />
                                                </td>
                                                <td className="custom-body-td">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(index)}
                                                        className="delete-button"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {errors.items ? <p className="field-error">{errors.items}</p> : null}
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
