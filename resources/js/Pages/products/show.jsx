import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link, usePage } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const Show = ({ product }) => {
    const { company_name } = usePage().props;

    return (
        <AuthenticatedLayout title="View product">
            {/* <Head title={`View product - ${company_name}`} /> */}

            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"products.index"} />
                        <h3 className="heading">Product details: {product?.name}</h3>
                    </div>

                    <Link
                        href={route("products.edit", product.id)}
                        className="edit-button"
                    >
                        Edit product
                    </Link>
                </div>

                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            {product?.product_image ? (
                                <img
                                    src={`/storage/app/public/${product.product_image}`}
                                    alt={product?.name}
                                    className="w-full max-w-xs h-auto rounded-md border"
                                />
                            ) : (
                                <div className="w-full max-w-xs h-56 rounded-md border flex items-center justify-center text-sm text-gray-500">
                                    No image
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <p>
                                <strong>Name:</strong> {product?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Category:</strong>{" "}
                                {product?.sub_category?.category?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Sub-category:</strong>{" "}
                                {product?.sub_category?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Attribute:</strong>{" "}
                                {product?.attribute_value?.attribute?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Attribute value:</strong>{" "}
                                {product?.attribute_value?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Buying price:</strong>{" "}
                                {product?.buying_price ?? "0"}
                            </p>
                            <p>
                                <strong>Selling price:</strong>{" "}
                                {product?.selling_price ?? "0"}
                            </p>
                            <p>
                                <strong>Stock:</strong> {product?.stock ?? 0} {product?.unit || ""}
                            </p>
                            <p>
                                <strong>Description:</strong>{" "}
                                {product?.description || "N/A"}
                            </p>
                            <p>
                                <strong>Created at:</strong>{" "}
                                {dateTimeFormater(product?.created_at) || "N/A"}
                            </p>
                            <p>
                                <strong>Updated at:</strong>{" "}
                                {dateTimeFormater(product?.updated_at) || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
