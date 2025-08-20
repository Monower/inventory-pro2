import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";

const Index = () => {
    return (
        <AuthenticatedLayout>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Products</h1>
                <Link
                    href="/products/create"
                    className="bg-blue-500 text-white p-1 px-2 rounded"
                >
                    Create
                </Link>
            </div>

            <div className="bg-white p-2 rounded">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>SI</th>
                            <th>name</th>
                            <th>Category</th>
                            <th>Sub-category</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
