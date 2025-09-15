import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const Index = ({ products }) => {
    const { setData, delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            setData("id", id);
            destroy(route("products.destroy", id));
        }
    };

    console.log('products: ',products);

    return (
        <AuthenticatedLayout>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Products</h1>
                <Link
                    href="/products/create"
                    className="bg-blue-500 text-white p-1 px-2 rounded"
                    disabled={processing}
                >
                    Create
                </Link>
            </div>

            <div className="bg-white p-2 rounded">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr>
                            <th>SI</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Sub-category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr
                                key={product.id}
                                className="text-center bg-gray-50"
                            >
                                <td>{index + 1}</td>
                                <td>{product.name}</td>
                                <td>{product.subCategory?.category?.name || "-"}</td>
                                <td>{product.subCategory?.name || "-"}</td>
                                <td>
                                    <Link
                                        href={`/products/edit/${product.id}`}
                                        className="bg-blue-500 text-white p-1 px-2 rounded mr-2"
                                        disabled={processing}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="bg-red-500 text-white p-1 px-2 rounded"
                                        disabled={processing}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
