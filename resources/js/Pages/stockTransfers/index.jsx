import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import IndexFilters from "@/Components/IndexFilters";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import Pagination from "@/Components/Pagination";
import { Link, router, usePage } from "@inertiajs/react";
import { EyeIcon } from "lucide-react";

const statusClasses = {
    requested: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-rose-100 text-rose-700",
    in_transit: "bg-violet-100 text-violet-700",
    completed: "bg-emerald-100 text-emerald-700",
};

const Index = ({ transfers, statuses = [], activeBranchId = null }) => {
    const { filters, auth } = usePage().props;
    const list = transfers?.data ?? [];
    const permissions = auth.user?.permissions || [];

    const updateStatus = (value) => {
        router.get(
            route("stock-transfers.index"),
            { ...filters, status: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout title="Stock Transfers">
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="heading">Stock Transfers</h3>
                        <p className="text-sm text-muted-foreground">
                            {activeBranchId
                                ? "Transfers are filtered to the active branch."
                                : "Review and process stock movement between branches."}
                        </p>
                    </div>
                    {permissions.includes("create stock transfer") && (
                        <Link href={route("stock-transfers.create")} className="create-button">
                            Create Transfer
                        </Link>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <IndexFilters
                        routeName="stock-transfers.index"
                        initialQuery={filters?.q || ""}
                        placeholder="Search transfers..."
                    />
                    <select
                        className="custom-input"
                        value={filters?.status || ""}
                        onChange={(e) => updateStatus(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="table-div">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Transfer</th>
                                    <th className="custom-th">Source</th>
                                    <th className="custom-th">Destination</th>
                                    <th className="custom-th">Requested By</th>
                                    <th className="custom-th">Status</th>
                                    <th className="custom-th">Created</th>
                                    <th className="custom-th rounded-r-md">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((transfer) => (
                                    <tr key={transfer.id} className="custom-body-tr">
                                        <td className="custom-body-td font-medium">{transfer.transfer_number}</td>
                                        <td className="custom-body-td">{transfer.source_branch?.name || "N/A"}</td>
                                        <td className="custom-body-td">{transfer.destination_branch?.name || "N/A"}</td>
                                        <td className="custom-body-td">{transfer.requested_by?.name || "N/A"}</td>
                                        <td className="custom-body-td">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[transfer.status] || "bg-muted text-foreground"}`}>
                                                {transfer.status.replaceAll("_", " ")}
                                            </span>
                                        </td>
                                        <td className="custom-body-td">
                                            {new Date(transfer.created_at).toLocaleString()}
                                        </td>
                                        <td className="custom-body-td">
                                            <Link href={route("stock-transfers.show", transfer.id)} className="edit-button">
                                                <EyeIcon className="inline h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination links={transfers?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
