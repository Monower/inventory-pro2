import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";


const Index = ({ customers }) => {
    const { data, setData, post, processing, errors, delete: destroy } = useForm({
        id: null
    });

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            setData('id', id);
            destroy(route('customer.destroy', id));
        }
    };



    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Customer</h3>
                    <Link href="/customer/create" className="bg-blue-500 text-white p-1 px-2 rounded">Create</Link>
                </div>

                <div className="bg-white p-4 rounded">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr>
                                <th>SI</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                customers.map((customer, index) => (
                                    <tr key={index} className="text-center bg-gray-50">
                                        <td>{index + 1}</td>
                                        <td>{customer.name}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.address}</td>
                                        <td>
                                            <Link href={  route('customer.edit', customer.id)} className="bg-blue-500 text-white py-1 px-2 rounded mr-2">Edit</Link>
                                            <button onClick={() => handleDelete(customer.id)} className="bg-red-500 text-white py-1 px-2 rounded">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </section>
        </AuthenticatedLayout>
    )
};


export default Index;