import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const makeSlug = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const combinations = (groups) => {
    if (!groups.length || groups.some((group) => !group.values.length)) {
        return [];
    }

    return groups.reduce(
        (result, group) =>
            result.flatMap((items) =>
                group.values.map((value) => [...items, `${group.name}: ${value}`])
            ),
        [[]]
    );
};

export default function Edit({ product, categories = [], units = [], attributes = [] }) {
    const primaryImageRef = useRef(null);
    const additionalImagesRef = useRef(null);
    const [primaryPreview, setPrimaryPreview] = useState(product.image_url);
    const [additionalPreviews, setAdditionalPreviews] = useState(
        product.additional_images?.map((image) => image.image_url) || []
    );
    const [selectedAttributeId, setSelectedAttributeId] = useState("");
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const { data, setData, post, processing, errors } = useForm({
        _method: "put",
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        unit_id: product.unit_id || "",
        base_price: product.base_price || "",
        cost_price: product.cost_price || "",
        vat: product.vat || "",
        has_variants: Boolean(product.has_variants),
        sku: product.sku || "",
        stock: product.stock || "",
        barcode: product.barcode || "",
        is_active: Boolean(product.is_active),
        category_id: product.category_id || "",
        sub_category_id: product.sub_category_id || "",
        primary_image: null,
        additional_images: [],
        variants: product.variants?.length
            ? product.variants
            : [
                  {
                      variant_name: "Default",
                      sku: product.sku || "",
                      price: product.base_price || "",
                      cost_price: product.cost_price || "",
                      stock: product.stock || "",
                      barcode: product.barcode || "",
                      is_active: true,
                  },
              ],
    });

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) => String(category.id) === String(data.category_id)
            ),
        [categories, data.category_id]
    );
    const subCategoryOptions = selectedCategory?.sub_categories || [];
    const availableAttributes = attributes.filter(
        (attribute) =>
            !selectedAttributes.some(
                (selectedAttribute) => selectedAttribute.id === attribute.id
            )
    );

    const updateName = (name) => {
        setData({
            ...data,
            name,
            slug: makeSlug(name),
        });
    };

    const setField = (key, value) => {
        setData({
            ...data,
            [key]: value,
            ...(key === "category_id" ? { sub_category_id: "" } : {}),
        });
    };

    const syncVariants = (nextAttributes) => {
        const nextVariants = combinations(nextAttributes).map((parts) => {
            const variantName = parts.join(" / ");
            const existing = data.variants.find(
                (variant) => variant.variant_name === variantName
            );

            return (
                existing || {
                    variant_name: variantName,
                    sku: "",
                    price: data.base_price || "",
                    cost_price: data.cost_price || "",
                    stock: "",
                    barcode: "",
                    is_active: true,
                }
            );
        });

        setData({
            ...data,
            variants: nextVariants,
        });
    };

    const addAttribute = () => {
        const attribute = attributes.find(
            (item) => String(item.id) === String(selectedAttributeId)
        );

        if (!attribute) {
            return;
        }

        const nextAttributes = [...selectedAttributes, attribute];
        setSelectedAttributes(nextAttributes);
        setSelectedAttributeId("");
        syncVariants(nextAttributes);
    };

    const removeAttribute = (attributeId) => {
        const nextAttributes = selectedAttributes.filter(
            (attribute) => attribute.id !== attributeId
        );
        setSelectedAttributes(nextAttributes);
        syncVariants(nextAttributes);
    };

    const toggleVariants = (enabled) => {
        const nextData = {
            ...data,
            has_variants: enabled,
            variants: enabled ? data.variants : [],
        };

        setData(nextData);

        if (!enabled) {
            setSelectedAttributes([]);
            setSelectedAttributeId("");
        }
    };

    const updateVariant = (index, key, value) => {
        const nextVariants = [...data.variants];
        nextVariants[index] = {
            ...nextVariants[index],
            [key]: value,
        };
        setData("variants", nextVariants);
    };

    const addVariant = () => {
        setData("variants", [
            ...data.variants,
            {
                variant_name: "",
                sku: "",
                price: data.base_price || "",
                cost_price: data.cost_price || "",
                stock: "",
                barcode: "",
                is_active: true,
            },
        ]);
    };

    const deleteVariant = (index) => {
        setData(
            "variants",
            data.variants.filter((_, variantIndex) => variantIndex !== index)
        );
    };

    const handlePrimaryImage = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        setData("primary_image", file);
        setPrimaryPreview(URL.createObjectURL(file));
    };

    const removePrimaryImage = () => {
        setData("primary_image", null);
        setPrimaryPreview(null);

        if (primaryImageRef.current) {
            primaryImageRef.current.value = "";
        }
    };

    const handleAdditionalImages = (event) => {
        const files = Array.from(event.target.files || []);
        setData("additional_images", files);
        setAdditionalPreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const removeAdditionalImages = () => {
        setData("additional_images", []);
        setAdditionalPreviews([]);

        if (additionalImagesRef.current) {
            additionalImagesRef.current.value = "";
        }
    };

    const submit = (event) => {
        event.preventDefault();

        post(`/products/${product.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout title="Edit Product">
            <Head title="Edit Product" />

            <form onSubmit={submit} className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Edit Product
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/dashboard" className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300">
                            Dashboard
                        </Link>
                        <span>&gt;</span>
                        <Link href="/products" className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300">
                            Products
                        </Link>
                        <span>&gt;</span>
                        <span>Edit Product</span>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Basic Info</h2>
                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" required />
                                    <input id="name" value={data.name} onChange={(event) => updateName(event.target.value)} className="mt-1" placeholder="Enter product name" />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="slug" value="Slug" required />
                                    <input id="slug" value={data.slug} onChange={(event) => setField("slug", makeSlug(event.target.value))} className="mt-1" placeholder="product-slug" />
                                    <InputError className="mt-2" message={errors.slug} />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea id="description" value={data.description} onChange={(event) => setField("description", event.target.value)} className="mt-1" rows={4} placeholder="Write product details" />
                                    <InputError className="mt-2" message={errors.description} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="unit_id" value="Unit" />
                                    <select id="unit_id" value={data.unit_id} onChange={(event) => setField("unit_id", event.target.value)} className="mt-1">
                                        <option value="">Select unit</option>
                                        {units.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.unit_id} />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pricing</h2>
                            <div className="mt-5 grid gap-5 md:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="base_price" value="Base Price" required />
                                    <input id="base_price" type="number" min="0" step="0.01" value={data.base_price} onChange={(event) => setField("base_price", event.target.value)} className="mt-1" />
                                    <InputError className="mt-2" message={errors.base_price} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="cost_price" value="Cost Price" />
                                    <input id="cost_price" type="number" min="0" step="0.01" value={data.cost_price} onChange={(event) => setField("cost_price", event.target.value)} className="mt-1" />
                                    <InputError className="mt-2" message={errors.cost_price} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="vat" value="VAT" hint="%" />
                                    <input id="vat" type="number" min="0" max="100" step="0.01" value={data.vat} onChange={(event) => setField("vat", event.target.value)} className="mt-1" />
                                    <InputError className="mt-2" message={errors.vat} />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Variants</h2>
                                <button type="button" onClick={() => toggleVariants(!data.has_variants)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {data.has_variants ? "Variants enabled" : "This product has variants"}
                                </button>
                            </div>

                            {data.has_variants ? (
                                <div className="mt-5 space-y-5">
                                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                        <select value={selectedAttributeId} onChange={(event) => setSelectedAttributeId(event.target.value)}>
                                            <option value="">Pick Attribute</option>
                                            {availableAttributes.map((attribute) => (
                                                <option key={attribute.id} value={attribute.id}>
                                                    {attribute.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button type="button" onClick={addAttribute} className="create-button px-5 py-2">
                                            Add Attribute
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttributes.map((attribute) => (
                                            <button key={attribute.id} type="button" onClick={() => removeAttribute(attribute.id)} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                                                {attribute.name} <span className="ml-1">x</span>
                                            </button>
                                        ))}
                                        {selectedAttributes.length === 0 && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Select attributes with values to generate variants.</p>
                                        )}
                                    </div>
                                    <div>
                                        <button type="button" onClick={addVariant} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                            Add Variant
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                                    <th className="px-3 py-3">Variant Name</th>
                                                    <th className="px-3 py-3">SKU</th>
                                                    <th className="px-3 py-3">Price</th>
                                                    <th className="px-3 py-3">Cost Price</th>
                                                    <th className="px-3 py-3">Stock</th>
                                                    <th className="px-3 py-3">Barcode</th>
                                                    <th className="px-3 py-3">Status</th>
                                                    <th className="px-3 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {data.variants.map((variant, index) => (
                                                    <tr key={variant.id || index}>
                                                        {["variant_name", "sku", "price", "cost_price", "stock", "barcode"].map((key) => (
                                                            <td key={key} className="px-3 py-3">
                                                                <input value={variant[key] || ""} type={["price", "cost_price", "stock"].includes(key) ? "number" : "text"} step="0.01" min="0" onChange={(event) => updateVariant(index, key, event.target.value)} />
                                                            </td>
                                                        ))}
                                                        <td className="px-3 py-3">
                                                            <select value={variant.is_active ? "1" : "0"} onChange={(event) => updateVariant(index, "is_active", event.target.value === "1")}>
                                                                <option value="1">Active</option>
                                                                <option value="0">Inactive</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-3 text-right">
                                                            <button type="button" onClick={() => deleteVariant(index)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {data.variants.length === 0 && (
                                                    <tr>
                                                        <td colSpan={8} className="px-3 py-6 text-sm text-slate-500 dark:text-slate-400">No variants added yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 grid gap-5 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="sku" value="SKU" />
                                        <input id="sku" value={data.sku} onChange={(event) => setField("sku", event.target.value)} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="stock" value="Stock" />
                                        <input id="stock" type="number" min="0" step="0.01" value={data.stock} onChange={(event) => setField("stock", event.target.value)} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="barcode" value="Barcode" />
                                        <input id="barcode" value={data.barcode} onChange={(event) => setField("barcode", event.target.value)} className="mt-1" />
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <InputLabel value="Status" />
                            <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                                {[{ label: "Active", value: true }, { label: "Inactive", value: false }].map((status) => (
                                    <button key={status.label} type="button" onClick={() => setField("is_active", status.value)} className={"rounded-md px-4 py-2 text-sm font-semibold transition " + (data.is_active === status.value ? "bg-white text-amber-700 shadow-sm dark:bg-slate-950 dark:text-amber-300" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100")}>
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Category</h2>
                            <div className="mt-5 space-y-5">
                                <div>
                                    <InputLabel htmlFor="category_id" value="Category" />
                                    <select id="category_id" value={data.category_id} onChange={(event) => setField("category_id", event.target.value)} className="mt-1">
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="sub_category_id" value="Sub Category" />
                                    <select id="sub_category_id" value={data.sub_category_id} onChange={(event) => setField("sub_category_id", event.target.value)} className="mt-1" disabled={!data.category_id}>
                                        <option value="">Select sub category</option>
                                        {subCategoryOptions.map((subCategory) => (
                                            <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Image</h2>
                            <div className="mt-5 space-y-5">
                                <div>
                                    <InputLabel htmlFor="primary_image" value="Primary Image" />
                                    {primaryPreview ? (
                                        <img src={primaryPreview} alt="Product preview" className="mt-2 h-44 w-full rounded-xl object-cover" />
                                    ) : (
                                        <div className="mt-2 flex h-44 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800">No image selected</div>
                                    )}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <label htmlFor="primary_image" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                                            <Upload className="h-4 w-4" /> Upload
                                        </label>
                                        {primaryPreview && (
                                            <button type="button" onClick={removePrimaryImage} className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                                <X className="h-4 w-4" /> Remove
                                            </button>
                                        )}
                                    </div>
                                    <input id="primary_image" ref={primaryImageRef} type="file" accept="image/*" onChange={handlePrimaryImage} className="sr-only" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="additional_images" value="Additional Images" />
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {additionalPreviews.map((preview, index) => (
                                            <img key={preview} src={preview} alt={`Additional preview ${index + 1}`} className="h-20 rounded-lg object-cover" />
                                        ))}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <label htmlFor="additional_images" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                                            <Upload className="h-4 w-4" /> Upload multiple
                                        </label>
                                        {additionalPreviews.length > 0 && (
                                            <button type="button" onClick={removeAdditionalImages} className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                                <X className="h-4 w-4" /> Clear
                                            </button>
                                        )}
                                    </div>
                                    <input id="additional_images" ref={additionalImagesRef} type="file" accept="image/*" multiple onChange={handleAdditionalImages} className="sr-only" />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                    <Link href="/products" className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className="create-button px-5 py-2">
                        {processing ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
