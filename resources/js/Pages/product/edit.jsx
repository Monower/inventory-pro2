import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

const Edit = ({ product, categories, attributes, selectedAttributes }) => {
    const { data, setData, put, errors } = useForm({
        productName: product.name || "",
        description: product.description || "",
        sellingPrice: product.selling_price || "",
        buyingPrice: product.buying_price || "",
        stock: product.stock || "",
        unit: product.unit || "",
        category: product.subCategory?.category?.id || categories[0]?.id || "",
        subCategory:
            product.subCategory?.id ||
            categories[0]?.sub_categories[0]?.id ||
            "",
        productImage: null,
        attribute_id: "",
        attribute_value_ids: [],
    });

    console.log("selectedAttributes", selectedAttributes);

    // local UI state
    const [selectedAttribute, setSelectedAttribute] = useState("");
    const [selectedValues, setSelectedValues] = useState([]); // chips
    const [dropdownValues, setDropdownValues] = useState([]); // current dropdown options
    const [currentDropdownValue, setCurrentDropdownValue] = useState("");

    // On mount, select first attribute with values if any
    useEffect(() => {
        // Initialize selected values if any attributes already exist
        if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
            const firstAttrId = Object.keys(selectedAttributes)[0];
            setSelectedAttribute(firstAttrId);
            setSelectedValues(selectedAttributes[firstAttrId]);
        }
    }, []);

    // Update dropdown values when attribute changes
    useEffect(() => {
        if (selectedAttribute) {
            const attr = attributes.find((a) => a.id == selectedAttribute);
            // Filter out already selected values from dropdown options
            const remaining = (attr?.values || []).filter(
                (v) => !selectedValues.includes(v.id)
            );
            setDropdownValues(remaining);
            setData("attribute_id", selectedAttribute);
            setData("attribute_value_ids", selectedValues);
        } else {
            setDropdownValues([]);
            setData("attribute_id", "");
            setData("attribute_value_ids", []);
        }
        setCurrentDropdownValue("");
    }, [selectedAttribute]);

    // Keep form data in sync with chips changes
    useEffect(() => {
        setData("attribute_value_ids", selectedValues);
        // Update dropdown values when selected values change
        if (selectedAttribute) {
            const attr = attributes.find((a) => a.id == selectedAttribute);
            const remaining = (attr?.values || []).filter(
                (v) => !selectedValues.includes(v.id)
            );
            setDropdownValues(remaining);
        }
    }, [selectedValues]);

    const handleAddValue = (valueId) => {
        if (!valueId) return;
        if (selectedValues.includes(valueId)) return;

        const newSelected = [...selectedValues, valueId];
        setSelectedValues(newSelected);
        setCurrentDropdownValue("");
    };

    const handleRemoveValue = (valueId) => {
        const newSelected = selectedValues.filter((v) => v !== valueId);
        setSelectedValues(newSelected);
    };

    // Handle category change, update subcategory too
    const handleCategoryChange = (e) => {
        const selectedCat = e.target.value;
        setData("category", selectedCat);
        const firstSub =
            categories.find((c) => c.id == selectedCat)?.sub_categories[0]
                ?.id || "";
        setData("subCategory", firstSub);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("products.update", product.id));
    };

    return (
        <AuthenticatedLayout>
            <section>
                <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {/* Product Name */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">
                                Product Name
                            </legend>
                            <input
                                type="text"
                                value={data.productName}
                                onChange={(e) =>
                                    setData("productName", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter product name"
                            />
                            {errors.productName && (
                                <p className="text-red-500 text-xs">
                                    {errors.productName}
                                </p>
                            )}
                        </fieldset>

                        {/* Selling Price */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">
                                Selling Price
                            </legend>
                            <input
                                type="number"
                                step="0.01"
                                value={data.sellingPrice}
                                onChange={(e) =>
                                    setData("sellingPrice", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter selling price"
                            />
                            {errors.sellingPrice && (
                                <p className="text-red-500 text-xs">
                                    {errors.sellingPrice}
                                </p>
                            )}
                        </fieldset>

                        {/* Buying Price */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">
                                Buying Price
                            </legend>
                            <input
                                type="number"
                                step="0.01"
                                value={data.buyingPrice}
                                onChange={(e) =>
                                    setData("buyingPrice", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter buying price"
                            />
                            {errors.buyingPrice && (
                                <p className="text-red-500 text-xs">
                                    {errors.buyingPrice}
                                </p>
                            )}
                        </fieldset>

                        {/* Stock */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Stock</legend>
                            <input
                                type="number"
                                value={data.stock}
                                onChange={(e) =>
                                    setData("stock", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter stock quantity"
                            />
                            {errors.stock && (
                                <p className="text-red-500 text-xs">
                                    {errors.stock}
                                </p>
                            )}
                        </fieldset>

                        {/* Unit */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Unit</legend>
                            <input
                                type="text"
                                value={data.unit}
                                onChange={(e) =>
                                    setData("unit", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="e.g. pcs, kg"
                            />
                            {errors.unit && (
                                <p className="text-red-500 text-xs">
                                    {errors.unit}
                                </p>
                            )}
                        </fieldset>

                        {/* Category */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Category</legend>
                            <select
                                value={data.category}
                                onChange={handleCategoryChange}
                                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-xs">
                                    {errors.category}
                                </p>
                            )}
                        </fieldset>

                        {/* Sub Category */}
                        {data.category && (
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    Sub Category
                                </legend>
                                <select
                                    value={data.subCategory}
                                    onChange={(e) =>
                                        setData("subCategory", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                                >
                                    {categories
                                        .find((c) => c.id == data.category)
                                        ?.sub_categories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                </select>
                                {errors.subCategory && (
                                    <p className="text-red-500 text-xs">
                                        {errors.subCategory}
                                    </p>
                                )}
                            </fieldset>
                        )}

                        {/* Description */}
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2">
                                Description
                            </legend>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                rows="2"
                                placeholder="Enter product description"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs">
                                    {errors.description}
                                </p>
                            )}
                        </fieldset>

                        {/* Product Image */}
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2">
                                Product Image
                            </legend>
                            <input
                                type="file"
                                onChange={(e) =>
                                    setData("productImage", e.target.files[0])
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                            />
                            {product.product_image && (
                                <img
                                    src={`/storage/${product.product_image}`}
                                    alt={product.name}
                                    className="mt-2 max-h-40"
                                />
                            )}
                            {errors.productImage && (
                                <p className="text-red-500 text-xs">
                                    {errors.productImage}
                                </p>
                            )}
                        </fieldset>

                        {/* Attribute & Values */}
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2 font-semibold">
                                Attribute
                            </legend>

                            <select
                                value={selectedAttribute}
                                onChange={(e) =>
                                    setSelectedAttribute(e.target.value)
                                }
                                className="border border-gray-300 rounded w-full text-sm mb-2"
                            >
                                <option value="">Select Attribute</option>
                                {attributes.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>

                            {selectedAttribute && (
                                <>
                                    <select
                                        value={currentDropdownValue}
                                        onChange={(e) =>
                                            handleAddValue(e.target.value)
                                        }
                                        className="border border-gray-300 rounded w-full text-sm"
                                    >
                                        <option value="">Select Value</option>
                                        {dropdownValues.map((val) => (
                                            <option key={val.id} value={val.id}>
                                                {val.value}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex flex-wrap mt-2 gap-2">
                                        {selectedValues.map((valId) => {
                                            const valObj = attributes
                                                .find(
                                                    (a) =>
                                                        a.id ==
                                                        selectedAttribute
                                                )
                                                ?.values.find(
                                                    (v) => v.id == valId
                                                );
                                            return (
                                                <span
                                                    key={valId}
                                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                                                >
                                                    {valObj?.value}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveValue(
                                                                valId
                                                            )
                                                        }
                                                        className="ml-1 text-red-500 font-bold"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </fieldset>
                    </div>

                    <button className="bg-blue-500 text-white p-2 rounded mt-2">
                        Update
                    </button>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
