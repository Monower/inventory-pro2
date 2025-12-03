import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { EditIcon, Trash2Icon } from "lucide-react";

const Index = ({ transactions }) => {
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

    const formattedData = transactions.map((t, i) => ({
        ...t,
        si: i + 1,
        transaction_type:
            t.transaction_type === "add_money" ? "Add Money" : "Expense",
    }));

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Transactions</h3>

                    <div className="flex gap-2">
                        <Link href="/transaction/create?type=add_money" className="create-button">
                            Add money
                        </Link>
                        <Link href="/transaction/create?type=expense" className="edit-button">
                            Add expenses
                        </Link>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={formattedData}
                    renderCell={(col, row) => {
                        // Special row coloring logic
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
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
