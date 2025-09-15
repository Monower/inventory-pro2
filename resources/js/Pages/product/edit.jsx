import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Edit({ product, attributes }) {
    // inertia form state
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || "",
        selling_price: product.selling_price || "",
        buying_price: product.buying_price || "",
        stock: product.stock || "",
        unit: product.unit || "",
        description: product.description || "",
        sub_category_id: product.sub_category_id || "",
        productImage: null,
        attribute_id: "",
        attribute_value_ids: [],
    });

    // for preview of new image
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("productImage", file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleAttributeChange = (e) => {
        setData("attribute_id", e.target.value);
        setData("attribute_value_ids", []); // reset values when attribute changes
    };

    const handleValueChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
        setData("attribute_value_ids", selected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("products.update", product.id));
    };

    // find selected attribute's values
    const selectedAttr = attributes.find((attr) => attr.id == data.attribute_id);

    return (
        <AuthenticatedLayout>
            <Head title="Edit Product" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    {/* Product Name */}
                    <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                        <legend className="text-sm mx-2">Name</legend>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                    </fieldset>

                    {/* Sub Category */}
                    <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                        <legend className="text-sm mx-2">Sub Category</legend>
                        <select
                            value={data.sub_category_id}
                            onChange={(e) =>
                                setData("sub_category_id", e.target.value)
                            }
                            className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                        >
                            <option value="">Select sub category</option>
                            {/* pass subCategories as prop if you have them */}
                        </select>
                    </fieldset>

                    {/* Attributes */}
                    <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                        <legend className="text-sm mx-2">Attribute</legend>
                        <select
                            value={data.attribute_id}
                            onChange={handleAttributeChange}
                            className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                        >
                            <option value="">Select Attribute</option>
                            {attributes.map((attr) => (
                                <option key={attr.id} value={attr.id}>
                                    {attr.name}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    {/* Attribute Values */}
                    {selectedAttr && (
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2">Attribute Values</legend>
                            <select
                                multiple
                                value={data.attribute_value_ids}
                                onChange={handleValueChange}
                                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                            >
                                {selectedAttr.values.map((val) => (
                                    <option key={val.id} value={val.id}>
                                        {val.value}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                    )}

                    {/* Image */}
                    <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                        <legend className="text-sm mx-2">Product Image</legend>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                        />
                        <div className="mt-2">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="h-32 w-32 object-cover rounded"
                                />
                            ) : product.product_image ? (
                                <img
                                    src={`/storage/${product.product_image}`}
                                    alt="Current Product"
                                    className="h-32 w-32 object-cover rounded"
                                />
                            ) : null}
                        </div>
                    </fieldset>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-500 text-white p-2 px-4 rounded"
                >
                    Update Product
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
