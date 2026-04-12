import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SubCategoryModal from "@/Pages/Products/Categories/Partials/SubCategoryModal";
import { Head, Link, useForm } from "@inertiajs/react";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const makeSlug = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const statusClass = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    Inactive: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const actionButtonClass =
    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition";

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                statusClass[status] || statusClass.Inactive
            }`}
        >
            {status}
        </span>
    );
}

function SubCategoriesTable({ subCategories, onEdit, onDelete, processing }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-950/40">
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            <th className="px-5 py-4">#</th>
                            <th className="px-5 py-4">Name</th>
                            <th className="px-5 py-4">Slug</th>
                            <th className="px-5 py-4">Products count</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {subCategories.map((subCategory, index) => (
                            <tr key={subCategory.id}>
                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {index + 1}
                                </td>
                                <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {subCategory.name}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                    {subCategory.slug}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {subCategory.products_count}
                                </td>
                                <td className="px-5 py-4">
                                    <StatusBadge status={subCategory.status} />
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(subCategory)}
                                            className={`${actionButtonClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => onDelete(subCategory)}
                                            className={`${actionButtonClass} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`}
                                        >
                                            {processing ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {subCategories.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No sub categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Edit({ category }) {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(category.image_url);
    const [subCategoryModal, setSubCategoryModal] = useState({
        show: false,
        subCategory: null,
    });
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        _method: "put",
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        image: null,
        is_active: category.status === "Active",
    });
    const { delete: destroy, processing: deleteProcessing } = useForm();

    const updateName = (name) => {
        setData({
            ...data,
            name,
            slug: makeSlug(name),
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        setData("image", file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeSelectedImage = () => {
        setData("image", null);
        setImagePreview(category.image_url);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post(`/products/categories/${category.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const deleteSubCategory = (subCategory) => {
        if (confirm(`Delete ${subCategory.name}?`)) {
            destroy(`/products/categories/${subCategory.id}`, {
                preserveScroll: true,
            });
        }
    };

    const openAddSubCategory = () => {
        setSubCategoryModal({
            show: true,
            subCategory: null,
        });
    };

    const openEditSubCategory = (subCategory) => {
        setSubCategoryModal({
            show: true,
            subCategory,
        });
    };

    const closeSubCategoryModal = () => {
        setSubCategoryModal({
            show: false,
            subCategory: null,
        });
    };

    return (
        <AuthenticatedLayout title="Edit Category">
            <Head title="Edit Category" />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Edit Category
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Link
                            href="/dashboard"
                            className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300"
                        >
                            Dashboard
                        </Link>
                        <span>&gt;</span>
                        <Link
                            href="/products/categories"
                            className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300"
                        >
                            Categories
                        </Link>
                        <span>&gt;</span>
                        <span>Edit Category</span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                        <div className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Name" required />
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) => updateName(event.target.value)}
                                    className="mt-1"
                                    placeholder="Enter category name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="slug" value="Slug" required />
                                <input
                                    id="slug"
                                    type="text"
                                    value={data.slug}
                                    onChange={(event) => setData("slug", makeSlug(event.target.value))}
                                    className="mt-1"
                                    placeholder="category-slug"
                                />
                                <InputError className="mt-2" message={errors.slug} />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) => setData("description", event.target.value)}
                                    className="mt-1"
                                    rows={5}
                                    placeholder="Write a short category description"
                                />
                                <InputError className="mt-2" message={errors.description} />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                                    {[
                                        { label: "Active", value: true },
                                        { label: "Inactive", value: false },
                                    ].map((status) => (
                                        <button
                                            key={status.label}
                                            type="button"
                                            onClick={() => setData("is_active", status.value)}
                                            className={
                                                "rounded-md px-4 py-2 text-sm font-semibold transition " +
                                                (data.is_active === status.value
                                                    ? "bg-white text-amber-700 shadow-sm dark:bg-slate-950 dark:text-amber-300"
                                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100")
                                            }
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                                <InputError className="mt-2" message={errors.is_active} />
                            </div>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="image"
                                value="Image"
                                hint="PNG/JPG up to 2 MB"
                            />
                            <div className="mt-2 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Category preview"
                                        className="h-44 w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                        No image selected
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <label
                                        htmlFor="image"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload image
                                    </label>
                                    {data.image && (
                                        <button
                                            type="button"
                                            onClick={removeSelectedImage}
                                            className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove selected
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="image"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                                <InputError className="mt-2" message={errors.image} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/products/categories"
                            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="create-button px-5 py-2"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

                <div className="border-t border-slate-200 dark:border-slate-800" />

                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            Sub Categories
                        </h2>
                        <button
                            type="button"
                            onClick={openAddSubCategory}
                            className="create-button px-5 py-2"
                        >
                            Add Sub Category
                        </button>
                    </div>

                    <SubCategoriesTable
                        subCategories={category.sub_categories || []}
                        onEdit={openEditSubCategory}
                        onDelete={deleteSubCategory}
                        processing={deleteProcessing}
                    />
                </div>

                <SubCategoryModal
                    show={subCategoryModal.show}
                    parentCategory={category}
                    subCategory={subCategoryModal.subCategory}
                    onClose={closeSubCategoryModal}
                />
            </section>
        </AuthenticatedLayout>
    );
}
