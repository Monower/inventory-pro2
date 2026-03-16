import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useForm, usePage } from "@inertiajs/react";

const statusClasses = {
    requested: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-rose-100 text-rose-700",
    in_transit: "bg-violet-100 text-violet-700",
    completed: "bg-emerald-100 text-emerald-700",
};

const branchStockForProduct = (product, branchId) => {
    const inventory = product?.branch_inventories?.find(
        (item) => String(item.branch_id) === String(branchId)
    );

    return Number(inventory?.stock || 0);
};

const Show = ({
    transfer,
    canApproveFromActiveBranch = false,
    canReceiveFromActiveBranch = false,
}) => {
    const permissions = usePage().props.auth.user?.permissions || [];

    const approveForm = useForm({
        items: transfer.items.map((item) => ({
            id: item.id,
            approved_quantity: item.approved_quantity || item.requested_quantity,
        })),
    });

    const rejectForm = useForm({
        rejection_reason: "",
    });

    const dispatchForm = useForm({});
    const receiveForm = useForm({});

    const handleApprove = (event) => {
        event.preventDefault();
        approveForm.patch(route("stock-transfers.approve", transfer.id));
    };

    const handleReject = (event) => {
        event.preventDefault();
        rejectForm.patch(route("stock-transfers.reject", transfer.id));
    };

    const handleDispatch = () => {
        dispatchForm.patch(route("stock-transfers.dispatch", transfer.id));
    };

    const handleReceive = () => {
        receiveForm.patch(route("stock-transfers.receive", transfer.id));
    };

    return (
        <AuthenticatedLayout title="Stock Transfer Details">
            <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton url={"stock-transfers.index"} />
                        <div>
                            <h3 className="heading">{transfer.transfer_number}</h3>
                            <p className="text-sm text-muted-foreground">
                                {transfer.source_branch?.name} to {transfer.destination_branch?.name}
                            </p>
                        </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[transfer.status] || "bg-muted text-foreground"}`}>
                        {transfer.status.replaceAll("_", " ")}
                    </span>
                </div>

                <div className="grid gap-4 rounded-lg border border-ring bg-background p-4 shadow-md md:grid-cols-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Requested By</p>
                        <p className="font-medium">{transfer.requested_by?.name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Approved By</p>
                        <p className="font-medium">{transfer.approved_by?.name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Dispatched By</p>
                        <p className="font-medium">{transfer.dispatched_by?.name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Received By</p>
                        <p className="font-medium">{transfer.received_by?.name || "N/A"}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <h4 className="mb-3 text-lg font-semibold">Transfer Details</h4>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-muted-foreground">Source branch:</span> {transfer.source_branch?.name}</p>
                            <p><span className="text-muted-foreground">Destination branch:</span> {transfer.destination_branch?.name}</p>
                            <p><span className="text-muted-foreground">Requested at:</span> {new Date(transfer.created_at).toLocaleString()}</p>
                            <p><span className="text-muted-foreground">Approved at:</span> {transfer.approved_at ? new Date(transfer.approved_at).toLocaleString() : "N/A"}</p>
                            <p><span className="text-muted-foreground">Dispatched at:</span> {transfer.dispatched_at ? new Date(transfer.dispatched_at).toLocaleString() : "N/A"}</p>
                            <p><span className="text-muted-foreground">Received at:</span> {transfer.received_at ? new Date(transfer.received_at).toLocaleString() : "N/A"}</p>
                            <p><span className="text-muted-foreground">Notes:</span> {transfer.notes || "N/A"}</p>
                            {transfer.rejection_reason && (
                                <p><span className="text-muted-foreground">Rejection reason:</span> {transfer.rejection_reason}</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <h4 className="mb-3 text-lg font-semibold">Workflow Actions</h4>

                        {transfer.status === "requested" &&
                            permissions.includes("approve stock transfer") &&
                            canApproveFromActiveBranch && (
                                <form onSubmit={handleApprove} className="space-y-3">
                                    <div className="space-y-2">
                                        {approveForm.data.items.map((item, index) => {
                                            const originalItem = transfer.items.find(
                                                (row) => row.id === item.id
                                            );

                                            return (
                                                <div key={item.id}>
                                                    <label className="text-sm font-medium">
                                                        {originalItem?.product?.name} approved qty
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={originalItem?.requested_quantity || 1}
                                                        className="custom-input"
                                                        value={item.approved_quantity}
                                                        onChange={(e) => {
                                                            const nextItems = [...approveForm.data.items];
                                                            nextItems[index].approved_quantity = Number(e.target.value);
                                                            approveForm.setData("items", nextItems);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button type="submit" disabled={approveForm.processing} className="create-button">
                                        {approveForm.processing ? "Approving..." : "Approve Transfer"}
                                    </button>
                                </form>
                            )}

                        {transfer.status === "requested" &&
                            permissions.includes("approve stock transfer") &&
                            canApproveFromActiveBranch && (
                                <form onSubmit={handleReject} className="mt-4 space-y-3">
                                    <textarea
                                        className="custom-input resize-none"
                                        rows={3}
                                        placeholder="Rejection reason"
                                        value={rejectForm.data.rejection_reason}
                                        onChange={(e) =>
                                            rejectForm.setData("rejection_reason", e.target.value)
                                        }
                                    />
                                    <button type="submit" disabled={rejectForm.processing} className="delete-button">
                                        {rejectForm.processing ? "Rejecting..." : "Reject Transfer"}
                                    </button>
                                </form>
                            )}

                        {transfer.status === "approved" &&
                            permissions.includes("dispatch stock transfer") &&
                            canApproveFromActiveBranch && (
                                <button
                                    type="button"
                                    onClick={handleDispatch}
                                    disabled={dispatchForm.processing}
                                    className="create-button"
                                >
                                    {dispatchForm.processing ? "Dispatching..." : "Dispatch to In Transit"}
                                </button>
                            )}

                        {transfer.status === "in_transit" &&
                            permissions.includes("receive stock transfer") &&
                            canReceiveFromActiveBranch && (
                                <button
                                    type="button"
                                    onClick={handleReceive}
                                    disabled={receiveForm.processing}
                                    className="create-button"
                                >
                                    {receiveForm.processing ? "Receiving..." : "Confirm Receipt"}
                                </button>
                            )}

                        {transfer.status === "requested" && !canApproveFromActiveBranch && (
                            <p className="text-sm text-muted-foreground">
                                Switch to the source branch to approve or reject this request.
                            </p>
                        )}

                        {transfer.status === "in_transit" && !canReceiveFromActiveBranch && (
                            <p className="text-sm text-muted-foreground">
                                Switch to the destination branch to confirm receipt.
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                    <h4 className="mb-4 text-lg font-semibold">Transfer Items</h4>
                    <div className="overflow-x-auto">
                        <table className="custom-table min-w-[980px]">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Product</th>
                                    <th className="custom-th">Source Stock</th>
                                    <th className="custom-th">Destination Stock</th>
                                    <th className="custom-th">Requested</th>
                                    <th className="custom-th">Approved</th>
                                    <th className="custom-th rounded-r-md">Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfer.items.map((item) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">{item.product?.name || "N/A"}</td>
                                        <td className="custom-body-td">
                                            {branchStockForProduct(item.product, transfer.source_branch_id)}
                                        </td>
                                        <td className="custom-body-td">
                                            {branchStockForProduct(item.product, transfer.destination_branch_id)}
                                        </td>
                                        <td className="custom-body-td">{item.requested_quantity}</td>
                                        <td className="custom-body-td">{item.approved_quantity ?? "Pending"}</td>
                                        <td className="custom-body-td">{item.received_quantity ?? "Pending"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
