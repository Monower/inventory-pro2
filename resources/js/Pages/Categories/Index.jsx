import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { dateFormater } from "@/util/DateFormater";
import { Link } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";


const Index = ({categories}) => {
    const { data, setData, post, processing, errors, delete: destroy } = useForm({
        id: null,
    });

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            setData('id', id);
            destroy(route('categories.destroy', id));
        }
    }


    return (
        <AuthenticatedLayout>
            <div>
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">Categories</h1>
                    <Link href="/categories/create" className="bg-blue-500 text-white p-1 px-2 rounded">Create</Link>
                </div>

                <div className="mt-4 bg-white p-4">
                    <table className="w-full text-left border-collapse border">
                        <thead className="border-b">
                            <tr className="[&>th]:border [&>th]:py-1 [&>th]:px-2">
                                <th>Name</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="[&>td]:border [&>td]:py-1 [&>td]:px-2">
                                    <td>{category.name}</td>
                                    <td>{dateFormater(category.created_at)}</td>
                                    <td>
                                        <Link href={`/categories/edit/${category.id}`} className="mr-2 bg-blue-500 text-white p-1 px-2 rounded">Edit</Link>
                                        <button onClick={() => handleDelete(category.id)} className="bg-red-500 text-white p-1 px-2 rounded">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
