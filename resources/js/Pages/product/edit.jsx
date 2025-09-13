import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Edit = ({ product, categories, attributes, selectedAttributes }) => {
    const { data, setData, put, errors } = useForm({
        productName: product.name || "",
        description: product.description || "",
        sellingPrice: product.selling_price || "",
        buyingPrice: product.buying_price || "",
        stock: product.stock || "",
        unit: product.unit || "",
        category: product.sub_category?.category_id || categories[0]?.id,
        subCategory: product.sub_category_id || categories[0]?.sub_categories[0]?.id,
        attributes: selectedAttributes || [], // [{ attribute_id, attribute_value_ids: [] }]
    });

    const addAttributeField = () => {
        setData("attributes", [...data.attributes, { attribute_id: "", attribute_value_ids: [] }]);
    };

    const handleAttributeChange = (index, field, value) => {
        const updated = [...data.attributes];
        updated[index][field] = value;
        setData("attributes", updated);
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
                            <legend className="text-sm mx-2">Product Name</legend>
                            <input
                                type="text"
                                value={data.productName}
                                onChange={(e) => setData("productName", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter product name"
                            />
                            {errors.productName && <p className="text-red-500 text-xs">{errors.productName}</p>}
                        </fieldset>

                        {/* Selling Price */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Selling Price</legend>
                            <input
                                type="number"
                                step="0.01"
                                value={data.sellingPrice}
                                onChange={(e) => setData("sellingPrice", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter selling price"
                            />
                        </fieldset>

                        {/* Buying Price */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Buying Price</legend>
                            <input
                                type="number"
                                step="0.01"
                                value={data.buyingPrice}
                                onChange={(e) => setData("buyingPrice", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter buying price"
                            />
                        </fieldset>

                        {/* Stock */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Stock</legend>
                            <input
                                type="number"
                                value={data.stock}
                                onChange={(e) => setData("stock", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter stock quantity"
                            />
                        </fieldset>

                        {/* Unit */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Unit</legend>
                            <input
                                type="text"
                                value={data.unit}
                                onChange={(e) => setData("unit", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                placeholder="e.g. pcs, kg"
                            />
                        </fieldset>

                        {/* Category */}
                        <fieldset className="border border-gray-300 bg-white p-2">
                            <legend className="text-sm mx-2">Category</legend>
                            <select
                                value={data.category}
                                onChange={(e) => setData("category", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </fieldset>

                        {/* Sub Category */}
                        {data.category && (
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">Sub Category</legend>
                                <select
                                    value={data.subCategory}
                                    onChange={(e) => setData("subCategory", e.target.value)}
                                    className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                                >
                                    {categories.find((c) => c.id == data.category)?.sub_categories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </fieldset>
                        )}

                        {/* Description */}
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2">Description</legend>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                                rows="2"
                                placeholder="Enter product description"
                            />
                        </fieldset>

                        {/* Product Image */}
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2">Product Image</legend>
                            <input
                                type="file"
                                onChange={(e) => setData("productImage", e.target.files[0])}
                                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
                            />
                        </fieldset>

                        {/* Attributes */}
                        <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
                            <legend className="text-sm mx-2 font-semibold">Attributes</legend>

                            {data.attributes.map((attr, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    {/* Attribute Select */}
                                    <select
                                        value={attr.attribute_id}
                                        onChange={(e) => handleAttributeChange(index, "attribute_id", e.target.value)}
                                        className="border border-gray-300 rounded w-1/2 text-sm"
                                    >
                                        <option value="">Select Attribute</option>
                                        {attributes.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>

                                    {/* Attribute Values Multi-Select */}
                                    <select
                                        multiple
                                        value={attr.attribute_value_ids || []}
                                        onChange={(e) => {
                                            const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
                                            handleAttributeChange(index, "attribute_value_ids", selectedValues);
                                        }}
                                        className="border border-gray-300 rounded w-1/2 text-sm"
                                    >
                                        {attributes.find((a) => a.id == attr.attribute_id)?.values.map((val) => (
                                            <option key={val.id} value={val.id}>{val.value}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addAttributeField}
                                className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-sm"
                            >
                                Add Attribute
                            </button>
                        </fieldset>
                    </div>

                    <button className="bg-blue-500 text-white p-2 rounded mt-2">Update</button>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
