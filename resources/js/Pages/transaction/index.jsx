import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const Index = ({ transactions }) => {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        delete: destroy,
    } = useForm({
        id: null,
    });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("transaction.destroy", id));
        }
    };

    console.log("transactions: ", transactions);

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Transactions</h3>
                    <div className="flex gap-2">
                        <Link
                            href="/transaction/create?type=add_money"
                            className="bg-blue-500 text-white p-1 px-2 rounded"
                        >
                            Add money
                        </Link>
                        <Link
                            href="/transaction/create?type=expense"
                            className="bg-red-500 text-white p-1 px-2 rounded"
                        >
                            Add expenses
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-4 rounded">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr>
                                <th>SI</th>
                                <th>Name</th>
                                <th>Payment method</th>
                                <th>Transaction type</th>
                                <th>source</th>
                                <th>amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr
                                    key={index}
                                    className={`text-center ${transaction?.transaction_type === "add_money" ? "bg-green-100" : "bg-red-100"}`}
                                >
                                    <td>{index + 1}</td>
                                    <td>{transaction.name}</td>
                                    <td>{transaction.payment_method}</td>
                                    <td>{transaction.transaction_type == "add_money" ? "Add money" : "Expense"}</td>
                                    <td>{transaction.source}</td>
                                    <td>{transaction.amount}</td>
                                    <td>
                                        <Link
                                            href={route(
                                                "transaction.edit",
                                                transaction.id
                                            )}
                                            className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(transaction.id)
                                            }
                                            className="bg-red-500 text-white py-1 px-2 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
