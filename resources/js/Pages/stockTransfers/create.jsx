import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

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
            <section className="space-y-4">
                <div className="flex items-center gap-4">
                    <BackButton url={"stock-transfers.index"} />
                    <h3 className="heading">Create Stock Transfer</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="required-label">Source Branch</label>
                            <select
                                className="custom-input"
                                value={data.source_branch_id}
                                onChange={(e) => setData("source_branch_id", e.target.value)}
                                required
                            >
                                <option value="">Select source branch</option>
                                {sourceBranches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-destructive">{errors.source_branch_id}</small>
                        </div>

                        <div>
                            <label className="required-label">Destination Branch</label>
                            <select
                                className="custom-input"
                                value={data.destination_branch_id}
                                onChange={(e) => setData("destination_branch_id", e.target.value)}
                                required
                            >
                                <option value="">Select destination branch</option>
                                {filteredDestinations.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-destructive">{errors.destination_branch_id}</small>
                        </div>
                    </div>

                    <div>
                        <label>Transfer Notes</label>
                        <textarea
                            className="custom-input resize-none"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                        />
                        <small className="text-destructive">{errors.notes}</small>
                    </div>

                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-lg font-semibold">Items</h4>
                            <button type="button" onClick={addRow} className="create-button">
                                Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="custom-table min-w-[760px]">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Product</th>
                                        <th className="custom-th">Source Stock</th>
                                        <th className="custom-th">Requested Qty</th>
                                        <th className="custom-th rounded-r-md">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => {
                                        const product = products.find(
                                            (item) => String(item.id) === String(row.product_id)
                                        );

                                        return (
                                            <tr key={index} className="custom-body-tr">
                                                <td className="custom-body-td">
                                                    <select
                                                        className="custom-input"
                                                        value={row.product_id}
                                                        onChange={(e) =>
                                                            updateRow(index, "product_id", e.target.value)
                                                        }
                                                        required
                                                    >
                                                        <option value="">Select product</option>
                                                        {products.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="custom-body-td">
                                                    {branchStockForProduct(product || {}, data.source_branch_id)}
                                                </td>
                                                <td className="custom-body-td">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="custom-input"
                                                        value={row.requested_quantity}
                                                        onChange={(e) =>
                                                            updateRow(index, "requested_quantity", e.target.value)
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
                        <small className="text-destructive">{errors.items}</small>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="create-button">
                            {processing ? "Saving..." : "Create Request"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
