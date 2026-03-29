import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head, usePage } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ transactions }) => {
    const { company_name, filters } = usePage().props;
    const list = transactions?.data ?? [];
    const { setData, delete: destroy } = useForm({ id: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("transaction.destroy", id));
        }
    };

    const columns = [
        { key: "si", label: "SI" },
        { key: "name", label: "Name" },
        { key: "payment_method", label: "Payment Method" },
        { key: "transaction_type", label: "Transaction Type" },
        { key: "source", label: "Source" },
        { key: "amount", label: "Amount" },
    ];

    const formattedData = list.map((t, i) => ({
        ...t,
        si: (transactions.current_page - 1) * transactions.per_page + i + 1,
        transaction_type:
            t.transaction_type === "add_money" ? "Add Money" : "Expense",
    }));

    return (
        <AuthenticatedLayout>
            <Head title={`Transactions - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Transaction Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Track money movement across the business
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review cash flow, log incoming funds, and record
                                expenses from a single transaction workspace.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible transactions
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:flex sm:gap-2">
                                <Link href="/transaction/create?type=add_money" className="create-button text-center">
                                    Add money
                                </Link>
                                <Link href="/transaction/create?type=expense" className="edit-button text-center">
                                    Add expenses
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="transactions.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search transactions..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <DataTable
                        columns={columns}
                        data={formattedData}
                        renderCell={(col, row) => {
                            if (col.key === "amount" || col.key === "si") {
                                return row[col.key];
                            }

                            return row[col.key];
                        }}
                        actions={(row) => (
                            <div className="flex justify-center items-center gap-2">
                                <Link
                                    href={route("transaction.edit", row.id)}
                                    className="edit-button"
                                >
                                    <EditIcon className="w-4 h-4 inline" />
                                </Link>

                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="delete-button"
                                >
                                    <Trash2Icon className="w-4 h-4 inline" />
                                </button>
                            </div>
                        )}
                    />
                </div>
                <Pagination links={transactions?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
