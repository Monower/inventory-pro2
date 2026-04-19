import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ product, categories, attributes }) => {
    const existingImagePath = product.product_image_url || null;
    const initialAttributeId = product.attribute_id ? String(product.attribute_id) : "";

    const { data, setData, post, errors, processing } = useForm({
        name: product.name || "",
        description: product.description || "",
        unit: product.unit || "",
        category: product.sub_category?.category_id || categories[0]?.id || "",
        sub_category_id: product.sub_category_id || categories[0]?.sub_categories[0]?.id || "",
        product_image: null,
        attribute_id: initialAttributeId,
        _method: "PUT",
    });

    const [imagePreview, setImagePreview] = useState(existingImagePath);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("product_image", file);

        if (file) {
            setImagePreview(URL.createObjectURL(file));
            return;
        }

        setImagePreview(existingImagePath);
    };

    const removeImage = () => {
        setData("product_image", null);
        setImagePreview(null);
    };

    const handleCategoryChange = (categoryId) => {
        setData("category", categoryId);
        const firstSubCategory =
            categories.find((category) => category.id == categoryId)?.sub_categories[0]?.id || "";
        setData("sub_category_id", firstSubCategory);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("products.update", product.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout title="Edit Product">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"products.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Edit Product</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Update the catalog details here, then manage stock and pricing from Product prices.</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 mb-4">
                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">Product Name</legend>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter product name"
                                />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">Unit</legend>
                                <input
                                    type="text"
                                    value={data.unit}
                                    onChange={(e) => setData("unit", e.target.value)}
                                    className="custom-input"
                                    placeholder="e.g. pcs, kg"
                                />
                                {errors.unit && <p className="text-red-500 text-xs">{errors.unit}</p>}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">Category</legend>
                                <select
                                    value={data.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="custom-input"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
                            </fieldset>

                            {data.category && (
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">Sub Category</legend>
                                    <select
                                        value={data.sub_category_id}
                                        onChange={(e) => setData("sub_category_id", e.target.value)}
                                        className="custom-input"
                                    >
                                        {categories
                                            .find((category) => category.id == data.category)
                                            ?.sub_categories.map((subCategory) => (
                                                <option key={subCategory.id} value={subCategory.id}>
                                                    {subCategory.name}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.sub_category_id && (
                                        <p className="text-red-500 text-xs">{errors.sub_category_id}</p>
                                    )}
                                </fieldset>
                            )}

                            <fieldset className="custom-fieldset lg:col-span-3">
                                <legend className="text-sm mx-2 font-semibold">Attribute</legend>
                                <select
                                    value={data.attribute_id}
                                    onChange={(e) => setData("attribute_id", e.target.value)}
                                    className="custom-input"
                                >
                                    <option value="">No Attribute</option>
                                    {attributes.map((attribute) => (
                                        <option key={attribute.id} value={String(attribute.id)}>
                                            {attribute.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.attribute_id && <p className="text-red-500 text-xs">{errors.attribute_id}</p>}
                            </fieldset>

                            <fieldset className="custom-fieldset col-span-3">
                                <legend className="text-sm mx-2">Description</legend>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    className="custom-input"
                                    rows="2"
                                    placeholder="Enter product description"
                                />
                                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                            </fieldset>

                            <fieldset className="custom-fieldset col-span-3">
                                <legend className="text-sm mx-2">Product Image</legend>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                                />
                                {imagePreview && (
                                    <div className="relative mt-2 max-w-xs">
                                        <img src={imagePreview} alt="Preview" className="w-full h-auto rounded" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0.5 font-bold"
                                            aria-label="Remove image preview"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}
                                {errors.product_image && (
                                    <p className="text-red-500 text-xs">{errors.product_image}</p>
                                )}
                            </fieldset>

                            {product.variants?.length > 0 && (
                                <p className="col-span-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Pricing has already been configured for this product. Keep the existing attribute here, then use Product prices to adjust stock and pricing.
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={processing} className="create-button mt-2 float-right">
                            Update
                        </button>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
