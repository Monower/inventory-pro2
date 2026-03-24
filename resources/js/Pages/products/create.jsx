import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = ({ categories, attributes, productUnits = [] }) => {
    const { settings } = usePage().props;
    const currencySymbol = settings?.currency_symbol || "TK";
    const { data, setData, post, errors, processing } = useForm({
        name: "",
        description: "",
        selling_price: "",
        buying_price: "",
        stock: "",
        unit: productUnits[0] || "",
        category: categories[0]?.id || "",
        sub_category_id: categories[0]?.sub_categories[0]?.id || "",
        product_image: null,
        attribute_id: "",
        attribute_value_ids: [],
    });

    const [selectedAttribute, setSelectedAttribute] = useState("");
    const [selectedValues, setSelectedValues] = useState([]);
    const [dropdownValues, setDropdownValues] = useState([]);
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
    }, [attributes, selectedAttribute, setData]);

    useEffect(() => {
        setData("attribute_value_ids", selectedValues);
    }, [selectedValues, setData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("product_image", file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

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
        <AuthenticatedLayout title="Create Product">
            <CreatePageLayout
                title="Create Product"
                description="Build a clean product record with catalog placement, pricing, stock, media, and attribute values so the item is ready for purchasing and sales workflows."
                backRoute="products.index"
                meta={[
                    { label: "Module", value: "Product catalog" },
                    { label: "Currency", value: currencySymbol },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Product Quality Tips"
                        items={[
                            {
                                title: "Use precise naming",
                                description:
                                    "Clear product names and descriptions improve search, sales speed, and reporting accuracy.",
                            },
                            {
                                title: "Structure variants carefully",
                                description:
                                    "Attributes and values should reflect reusable product distinctions like size, color, or storage.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                    <CreateSectionCard
                        title="Core Product Details"
                        description="Start with the product identity, pricing, opening stock, and where the item belongs in your catalog."
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Product name
                                    </legend>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </fieldset>
                                {errors.name ? <p className="field-error">{errors.name}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Selling price
                                    </legend>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.selling_price}
                                        onChange={(e) =>
                                            setData("selling_price", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder={`Enter selling price in ${currencySymbol}`}
                                        required
                                    />
                                </fieldset>
                                {errors.selling_price ? (
                                    <p className="field-error">{errors.selling_price}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Buying price
                                    </legend>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.buying_price}
                                        onChange={(e) =>
                                            setData("buying_price", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder={`Enter buying price in ${currencySymbol}`}
                                        required
                                    />
                                </fieldset>
                                {errors.buying_price ? (
                                    <p className="field-error">{errors.buying_price}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Opening stock
                                    </legend>
                                    <input
                                        type="number"
                                        value={data.stock}
                                        onChange={(e) => setData("stock", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter stock quantity"
                                        required
                                    />
                                </fieldset>
                                {errors.stock ? (
                                    <p className="field-error">{errors.stock}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Unit
                                    </legend>
                                    <select
                                        value={data.unit}
                                        onChange={(e) => setData("unit", e.target.value)}
                                        className="custom-input"
                                        required
                                    >
                                        <option value="">Select unit</option>
                                        {productUnits.map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.unit ? <p className="field-error">{errors.unit}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Category
                                    </legend>
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
                                        className="custom-input"
                                        required
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.category ? (
                                    <p className="field-error">{errors.category}</p>
                                ) : null}
                            </div>

                            {data.category ? (
                                <div className="field-stack">
                                    <fieldset className="custom-fieldset">
                                        <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                            Sub category
                                        </legend>
                                        <select
                                            value={data.sub_category_id}
                                            onChange={(e) =>
                                                setData("sub_category_id", e.target.value)
                                            }
                                            className="custom-input"
                                            required
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
                                    {errors.sub_category_id ? (
                                        <p className="field-error">
                                            {errors.sub_category_id}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="field-stack md:col-span-2 xl:col-span-3">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Description
                                    </legend>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData("description", e.target.value)
                                        }
                                        className="custom-input resize-none"
                                        rows="4"
                                        placeholder="Enter product description"
                                        required
                                    />
                                </fieldset>
                                {errors.description ? (
                                    <p className="field-error">{errors.description}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Media"
                        description="Upload a clear product image so staff can identify the item quickly during sales and inventory work."
                    >
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Product image
                                    </legend>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="custom-input"
                                        required
                                    />
                                </fieldset>
                                {errors.product_image ? (
                                    <p className="field-error">{errors.product_image}</p>
                                ) : null}
                            </div>

                            {imagePreview ? (
                                <div className="relative rounded-[24px] border border-border bg-background p-3 shadow-sm">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-48 w-full rounded-[18px] object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute right-4 top-4 rounded-full bg-red-500 px-2 py-0.5 text-sm font-bold text-white"
                                        aria-label="Remove image preview"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Attributes"
                        description="Assign one reusable attribute and then choose the value options that apply to this product."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Create product"}
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="field-stack max-w-2xl">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Attribute
                                    </legend>
                                    <select
                                        value={selectedAttribute}
                                        onChange={(e) =>
                                            setSelectedAttribute(e.target.value)
                                        }
                                        className="custom-input"
                                        required
                                    >
                                        <option value="">Select attribute</option>
                                        {attributes.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            {selectedAttribute ? (
                                <>
                                    <div className="field-stack max-w-2xl">
                                        <fieldset className="custom-fieldset">
                                            <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                                Attribute values
                                            </legend>
                                            <select
                                                value={currentDropdownValue}
                                                onChange={(e) => {
                                                    setCurrentDropdownValue(
                                                        e.target.value
                                                    );
                                                    handleAddValue(e.target.value);
                                                }}
                                                className="custom-input"
                                                required={selectedValues.length === 0}
                                            >
                                                <option value="">Select value</option>
                                                {dropdownValues.map((val) => (
                                                    <option key={val.id} value={val.id}>
                                                        {val.name || val.value}
                                                    </option>
                                                ))}
                                            </select>
                                        </fieldset>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedValues.map((valId) => {
                                            const valObj = attributes
                                                .find((a) => a.id == selectedAttribute)
                                                ?.values.find((v) => v.id == valId);
                                            return (
                                                <span
                                                    key={valId}
                                                    className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"
                                                >
                                                    {valObj?.name || valObj?.value}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveValue(valId)
                                                        }
                                                        className="font-bold text-red-500"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
