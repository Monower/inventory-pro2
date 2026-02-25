import { Link, usePage, Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import { dateTimeFormater } from "@/util/DateFormater";

const Index = () => {
    const { products, company_name } = usePage().props;
    const [search, setSearch] = useState("");
    const { setData, delete: destroy } = useForm({ id: null });

    // Filter products locally (can be replaced with server-side search)
    const filteredProducts = products.data.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            setData("id", id);
            destroy(route("products.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout title="Products">
            {/* <Head title={`Products - ${company_name}`} /> */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Products</h3>
                    <Link
                        href={route("products.create")}
                        className="create-button"
                    >
                        Add Product
                    </Link>
                </div>

                <div className="table-div">
                    {filteredProducts.length > 0 ? (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        SI
                                    </th>
                                    <th className="custom-th">
                                        Image
                                    </th>
                                    <th className="custom-th">
                                        Name
                                    </th>
                                    <th className="custom-th">Selling price</th>
                                    <th className="custom-th">Stock</th>
                                    <th className="custom-th">Created at</th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product,index) => (
                                    <tr
                                        key={product.id}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">
                                            {index + 1}
                                        </td>
                                        <td>
                                            <img
                                                src={"/storage/app/public/"+product.product_image}
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="custom-body-td">
                                            {product.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {product.selling_price}
                                        </td>
                                        <td className="custom-body-td">
                                            {product.stock}
                                        </td>
                                        <td className="custom-body-td">
                                            {dateTimeFormater(product.created_at)}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
                                            <Link
                                                href={route(
                                                    "products.show",
                                                    product.id
                                                )}
                                                className="show-button"
                                            >
                                                <EyeIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <Link
                                                href={route(
                                                    "products.edit",
                                                    product.id
                                                )}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                                className="delete-button"
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <NoDataFound />
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
