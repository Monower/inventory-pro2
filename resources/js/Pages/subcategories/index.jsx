import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import { dateFormater } from "@/util/DateFormater";
import { useForm } from "@inertiajs/react";

const Index = ({subcategories}) => {

    const { data, setData, post, processing, errors, delete: destroy } = useForm({
        id: null,
    });

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this subcategory?')) {
            setData('id', id);
            destroy(route('subcategories.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout>
            <div>
                <div className="flex justify-between items-center">
                    <h3>Subcategories</h3>
                    <Link href="/sub-categories/create" className="bg-blue-500 text-white p-1 px-2 rounded">Create</Link>
                </div>

                <div className="mt-4 bg-white p-4">
                    <table className="w-full text-left border-collapse border">
                        <thead className="border-b">
                            <tr className="[&>th]:border [&>th]:py-1 [&>th]:px-2">
                                <th>Name</th>
                                <th>Category Name</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories?.map((subcategory) => (
                                <tr key={subcategory.id} className="[&>td]:border [&>td]:py-1 [&>td]:px-2">
                                    <td>{subcategory.name}</td>
                                    <td>{subcategory.category.name}</td>
                                    <td>{dateFormater(subcategory.created_at)}</td>
                                    <td>
                                        <Link href={`/sub-categories/edit/${subcategory.id}`} className="bg-blue-500 text-white p-1 px-2 rounded mr-2">Edit</Link>
                                        <button onClick={() => handleDelete(subcategory.id)} className="bg-red-500 text-white p-1 px-2 rounded">Delete</button>
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