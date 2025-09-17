import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

const Edit = ({ product, categories, attributes, selectedAttributes }) => {
    // preload the product info
    const { data, setData, post, errors, put } = useForm({
        productName: product.name || "",
        description: product.description || "",
        sellingPrice: product.selling_price || "",
        buyingPrice: product.buying_price || "",
        stock: product.stock || "",
        unit: product.unit || "",
        category: product.subCategory?.category?.id || "",
        subCategory: product.subCategory?.id || "",
        productImage: null, // new file only
        // one attribute at a time UI:
        attribute_id: "",
        attribute_value_ids: [],
    });

    // state for UI attribute adding (same as create)
    const [selectedAttribute, setSelectedAttribute] = useState("");
    const [selectedValues, setSelectedValues] = useState([]);
    const [dropdownValues, setDropdownValues] = useState([]);
    const [currentDropdownValue, setCurrentDropdownValue] = useState("");

    // on attribute select
    useEffect(() => {
        if (selectedAttribute) {
            const attr = attributes.find((a) => a.id == selectedAttribute);
            // load already selected values if exist from selectedAttributes prop
            const preSelected = selectedAttributes[selectedAttribute] || [];
            setSelectedValues(preSelected);
            setDropdownValues(
                (attr?.values || []).filter((v) => !preSelected.includes(v.id))
            );
        } else {
            setDropdownValues([]);
            setSelectedValues([]);
        }
        setCurrentDropdownValue("");
        setData("attribute_id", selectedAttribute);
        setData("attribute_value_ids", []);
    }, [selectedAttribute]);

    // sync chips to form
    useEffect(() => {
        setData("attribute_value_ids", selectedValues);
    }, [selectedValues]);

    const handleAddValue = (valueId) => {
        if (!valueId) return;
        if (selectedValues.includes(valueId)) return;
        const newSelected = [...selectedValues, valueId];
        setSelectedValues(newSelected);

        if (selectedAttribute) {
            const attr = attributes.find((a) => a.id == selectedAttribute);
            const remaining = (attr?.values || []).filter(
                (v) => !newSelected.includes(v.id)
            );
            setDropdownValues(remaining);
        }
        setCurrentDropdownValue("");
    };

    const handleRemoveValue = (valueId) => {
        const newSelected = selectedValues.filter((v) => v !== valueId);
        setSelectedValues(newSelected);

        if (selectedAttribute) {
            const attr = attributes.find((a) => a.id == selectedAttribute);
            const remaining = (attr?.values || []).filter(
                (v) => !newSelected.includes(v.id)
            );
            setDropdownValues(remaining);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("products.update", product.id)); // real PUT request
    };

    console.log("Errors:", errors);
    console.log("Product:", product);
    console.log("Categories:", categories);
    

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
                            />
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
                            />
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
                            />
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
                            />
                        </fieldset>

                        {/* Category */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Category</legend>
                            <select
                                value={data.category}
                                onChange={(e) => {
                                    const selectedCat = e.target.value;
                                    setData("category", selectedCat);
                                    const firstSub =
                                        categories.find(
                                            (c) => c.id == selectedCat
                                        )?.sub_categories[0]?.id || "";
                                    setData("subCategory", firstSub);
                                }}
                                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
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
                            />
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
                                    alt="Product"
                                    className="w-24 mt-2"
                                />
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
