import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ product, categories, attributes }) => {
    const existingImagePath = product.product_image ? `/storage/app/public/${product.product_image}` : null;
    const initialAttributeVariant = product.variants?.find((variant) => variant.attribute_value?.attribute_id);
    const initialAttributeId = initialAttributeVariant?.attribute_value?.attribute_id
        ? String(initialAttributeVariant.attribute_value.attribute_id)
        : "";

    const initialAttributeStocks = (product.variants || [])
        .filter((variant) => variant.attribute_value_id)
        .map((variant) => ({
            attribute_value_id: String(variant.attribute_value_id),
            stock: String(variant.stock ?? 0),
        }));

    const simpleVariant = (product.variants || []).find((variant) => !variant.attribute_value_id);

    const { data, setData, put, errors, processing } = useForm({
        name: product.name || "",
        description: product.description || "",
        selling_price: product.selling_price || "",
        buying_price: product.buying_price || "",
        stock: simpleVariant ? String(simpleVariant.stock ?? 0) : "",
        unit: product.unit || "",
        category: product.sub_category?.category_id || categories[0]?.id || "",
        sub_category_id: product.sub_category_id || categories[0]?.sub_categories[0]?.id || "",
        product_image: null,
        attribute_id: initialAttributeId,
        attribute_stocks: initialAttributeStocks,
    });

    const [selectedAttribute, setSelectedAttribute] = useState(initialAttributeId);
    const [selectedValueIds, setSelectedValueIds] = useState(
        initialAttributeStocks.map((item) => String(item.attribute_value_id))
    );
    const [currentDropdownValue, setCurrentDropdownValue] = useState("");
    const [imagePreview, setImagePreview] = useState(existingImagePath);
    const [clientError, setClientError] = useState("");

    const selectedAttributeRecord = useMemo(
        () => attributes.find((attribute) => String(attribute.id) === String(selectedAttribute)),
        [attributes, selectedAttribute]
    );

    const dropdownValues = useMemo(() => {
        if (!selectedAttributeRecord) {
            return [];
        }

        return selectedAttributeRecord.values.filter(
            (value) => !selectedValueIds.includes(String(value.id))
        );
    }, [selectedAttributeRecord, selectedValueIds]);

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

    const handleAddValue = (valueId) => {
        if (!valueId || selectedValueIds.includes(valueId)) {
            return;
        }

        setSelectedValueIds([...selectedValueIds, valueId]);
        setData("attribute_stocks", [
            ...data.attribute_stocks,
            {
                attribute_value_id: valueId,
                stock: "",
            },
        ]);
        setCurrentDropdownValue("");
    };

    const handleRemoveValue = (valueId) => {
        setSelectedValueIds(selectedValueIds.filter((id) => id !== valueId));
        setData(
            "attribute_stocks",
            data.attribute_stocks.filter(
                (item) => String(item.attribute_value_id) !== String(valueId)
            )
        );
    };

    const handleVariantStockChange = (valueId, stock) => {
        setData(
            "attribute_stocks",
            data.attribute_stocks.map((item) =>
                String(item.attribute_value_id) === String(valueId)
                    ? { ...item, stock }
                    : item
            )
        );
    };

    const handleCategoryChange = (categoryId) => {
        setData("category", categoryId);
        const firstSubCategory =
            categories.find((category) => category.id == categoryId)?.sub_categories[0]?.id || "";
        setData("sub_category_id", firstSubCategory);
    };

    const handleAttributeChange = (attributeId) => {
        setSelectedAttribute(attributeId);
        setCurrentDropdownValue("");

        if (!attributeId) {
            setSelectedValueIds([]);
            setData("attribute_id", "");
            setData("attribute_stocks", []);
            return;
        }

        if (String(attributeId) !== String(selectedAttribute)) {
            setSelectedValueIds([]);
            setData("attribute_stocks", []);
        }

        setData("attribute_id", attributeId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedAttribute && data.attribute_stocks.length === 0) {
            setClientError("Please add at least one attribute value with stock.");
            return;
        }

        if (
            selectedAttribute &&
            data.attribute_stocks.some((item) => item.stock === "" || Number(item.stock) < 0)
        ) {
            setClientError("Please enter a valid stock quantity for every selected attribute value.");
            return;
        }

        if (!selectedAttribute && (data.stock === "" || Number(data.stock) < 0)) {
            setClientError("Please enter a valid stock quantity.");
            return;
        }

        setClientError("");
        put(route("products.update", product.id));
    };

    return (
        <AuthenticatedLayout title="Edit Product">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"products.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Edit Product</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Update the product and manage stock per attribute value when needed.</p>
                        </div>
                    </div>
                </div>

                {clientError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {clientError}
                    </p>
                )}

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
                                <legend className="text-sm mx-2">Selling Price</legend>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.selling_price}
                                    onChange={(e) => setData("selling_price", e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter selling price"
                                />
                                {errors.selling_price && <p className="text-red-500 text-xs">{errors.selling_price}</p>}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">Buying Price</legend>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.buying_price}
                                    onChange={(e) => setData("buying_price", e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter buying price"
                                />
                                {errors.buying_price && <p className="text-red-500 text-xs">{errors.buying_price}</p>}
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
                                    value={selectedAttribute}
                                    onChange={(e) => handleAttributeChange(e.target.value)}
                                    className="custom-input"
                                >
                                    <option value="">No Attribute</option>
                                    {attributes.map((attribute) => (
                                        <option key={attribute.id} value={String(attribute.id)}>
                                            {attribute.name}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            {!selectedAttribute && (
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">Stock</legend>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.stock}
                                        onChange={(e) => setData("stock", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter stock quantity"
                                    />
                                    {errors.stock && <p className="text-red-500 text-xs">{errors.stock}</p>}
                                </fieldset>
                            )}

                            {selectedAttribute && (
                                <fieldset className="custom-fieldset col-span-3">
                                    <legend className="text-sm mx-2 font-semibold">Attribute value stock</legend>

                                    <select
                                        value={currentDropdownValue}
                                        onChange={(e) => {
                                            const valueId = e.target.value;
                                            setCurrentDropdownValue(valueId);
                                            handleAddValue(valueId);
                                        }}
                                        className="custom-input"
                                    >
                                        <option value="">Select Value</option>
                                        {dropdownValues.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.name || value.value}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="mt-4 space-y-3">
                                        {data.attribute_stocks.length > 0 ? (
                                            data.attribute_stocks.map((item) => {
                                                const value = selectedAttributeRecord?.values.find(
                                                    (entry) => String(entry.id) === String(item.attribute_value_id)
                                                );

                                                return (
                                                    <div
                                                        key={item.attribute_value_id}
                                                        className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto] dark:border-slate-700 dark:bg-slate-800/50"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                                {value?.name || value?.value}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                This stock contributes to the product total.
                                                            </p>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.stock}
                                                            onChange={(e) =>
                                                                handleVariantStockChange(
                                                                    item.attribute_value_id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="custom-input"
                                                            placeholder="Stock quantity"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveValue(String(item.attribute_value_id))}
                                                            className="delete-button"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Select attribute values and enter stock for each one.
                                            </p>
                                        )}
                                    </div>
                                    {errors.attribute_stocks && (
                                        <p className="text-red-500 text-xs">{errors.attribute_stocks}</p>
                                    )}
                                </fieldset>
                            )}

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
