import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

const Create = ({ categories, attributes }) => {
  const { data, setData, post, errors } = useForm({
    name: "",
    description: "",
    selling_price: "",
    buying_price: "",
    stock: "",
    unit: "",
    category: categories[0]?.id || "",
    sub_category_id: categories[0]?.sub_categories[0]?.id || "",
    product_image: null,
    attribute_id: "",
    attribute_value_ids: [],
  });

  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedValues, setSelectedValues] = useState([]); // selected attribute values (chips)
  const [dropdownValues, setDropdownValues] = useState([]); // dropdown options for attribute values
  const [currentDropdownValue, setCurrentDropdownValue] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (selectedAttribute) {
      const attr = attributes.find((a) => a.id == selectedAttribute);
      setDropdownValues(attr?.values || []);
    } else {
      setDropdownValues([]);
    }
    setSelectedValues([]);
    setCurrentDropdownValue("");
    setData("attribute_id", selectedAttribute);
    setData("attribute_value_ids", []);
  }, [selectedAttribute]);

  useEffect(() => {
    setData("attribute_value_ids", selectedValues);
  }, [selectedValues]);

  // Handle image selection and create preview URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setData("product_image", file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Remove image and clear preview
  const removeImage = () => {
    setData("product_image", null);
    setImagePreview(null);
  };

  const handleAddValue = (valueId) => {
    if (!valueId || selectedValues.includes(valueId)) return;

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
    post(route("products.store"));
  };

  return (
    <AuthenticatedLayout>
      <section>
        <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Product Name */}
            <fieldset className="border border-gray-300 bg-white p-2">
              <legend className="text-sm mx-2">Product Name</legend>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </fieldset>

            {/* Selling Price */}
            <fieldset className="border border-gray-300 bg-white p-2">
              <legend className="text-sm mx-2">Selling Price</legend>
              <input
                type="number"
                step="0.01"
                value={data.selling_price}
                onChange={(e) => setData("selling_price", e.target.value)}
                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                placeholder="Enter selling price"
              />
              {errors.selling_price && (
                <p className="text-red-500 text-xs">{errors.selling_price}</p>
              )}
            </fieldset>

            {/* Buying Price */}
            <fieldset className="border border-gray-300 bg-white p-2">
              <legend className="text-sm mx-2">Buying Price</legend>
              <input
                type="number"
                step="0.01"
                value={data.buying_price}
                onChange={(e) => setData("buying_price", e.target.value)}
                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-sm placeholder:text-gray-400"
                placeholder="Enter buying price"
              />
              {errors.buying_price && (
                <p className="text-red-500 text-xs">{errors.buying_price}</p>
              )}
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
              {errors.stock && (
                <p className="text-red-500 text-xs">{errors.stock}</p>
              )}
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
              {errors.unit && (
                <p className="text-red-500 text-xs">{errors.unit}</p>
              )}
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
                    categories.find((c) => c.id == selectedCat)
                      ?.sub_categories[0]?.id || "";
                  setData("sub_category_id", firstSub);
                }}
                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs">{errors.category}</p>
              )}
            </fieldset>

            {/* Sub Category */}
            {data.category && (
              <fieldset className="border border-gray-300 bg-white p-2">
                <legend className="text-sm mx-2">Sub Category</legend>
                <select
                  value={data.sub_category_id}
                  onChange={(e) => setData("sub_category_id", e.target.value)}
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
                {errors.sub_category_id && (
                  <p className="text-red-500 text-xs">{errors.sub_category_id}</p>
                )}
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
              {errors.description && (
                <p className="text-red-500 text-xs">{errors.description}</p>
              )}
            </fieldset>

            {/* Product Image */}
            <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
              <legend className="text-sm mx-2">Product Image</legend>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border-none w-full focus:outline-none focus:ring-0 text-sm"
              />
              {imagePreview && (
                <div className="relative mt-2 max-w-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded"
                  />
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

            {/* Attribute & Values */}
            <fieldset className="border border-gray-300 bg-white p-2 col-span-3">
              <legend className="text-sm mx-2 font-semibold">Attribute</legend>
              <select
                value={selectedAttribute}
                onChange={(e) => setSelectedAttribute(e.target.value)}
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
                    onChange={(e) => {
                      setCurrentDropdownValue(e.target.value);
                      handleAddValue(e.target.value);
                    }}
                    className="border border-gray-300 rounded w-full text-sm"
                  >
                    <option value="">Select Value</option>
                    {dropdownValues.map((val) => (
                      <option key={val.id} value={val.id}>
                        {val.name || val.value}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap mt-2 gap-2">
                    {selectedValues.map((valId) => {
                      const valObj = attributes
                        .find((a) => a.id == selectedAttribute)
                        ?.values.find((v) => v.id == valId);
                      return (
                        <span
                          key={valId}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          {valObj?.name || valObj?.value}
                          <button
                            type="button"
                            onClick={() => handleRemoveValue(valId)}
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

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            Save
          </button>
        </form>
      </section>
    </AuthenticatedLayout>
  );
};

export default Create;
