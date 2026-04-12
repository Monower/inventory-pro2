import Pagination from "@/Components/Pagination";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SubCategoryModal from "@/Pages/Products/Categories/Partials/SubCategoryModal";
import { Head, Link, useForm } from "@inertiajs/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";

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

function RowActions({ category, editHref, onEdit, onDelete, processing }) {
    return (
        <div className="flex flex-wrap justify-end gap-2">
            {editHref ? (
                <Link
                    href={editHref}
                    className={`${actionButtonClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`}
                >
                    Edit
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={() => onEdit?.(category)}
                    className={`${actionButtonClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`}
                >
                    Edit
                </button>
            )}
            <button
                type="button"
                disabled={processing}
                onClick={() => onDelete?.(category)}
                className={`${actionButtonClass} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`}
            >
                {processing ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
}

function SubCategoriesTable({ category, onAdd, onEdit, onDelete, processing }) {
    const subCategories = category.sub_categories || [];

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Products count</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {subCategories.map((subCategory, index) => (
                            <tr key={subCategory.id}>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {subCategory.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                    {subCategory.slug}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                    {subCategory.products_count}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={subCategory.status} />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <RowActions
                                        category={subCategory}
                                        onEdit={(selectedSubCategory) =>
                                            onEdit(category, selectedSubCategory)
                                        }
                                        onDelete={onDelete}
                                        processing={processing}
                                    />
                                </td>
                            </tr>
                        ))}
                        {subCategories.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No sub categories added yet.
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={6} className="px-4 py-4">
                                <button
                                    type="button"
                                    onClick={() => onAdd(category)}
                                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                                >
                                    Add Sub Category
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Categories({ categories }) {
    const rows = categories?.data || [];
    const { delete: destroy, processing } = useForm();
    const [subCategoryModal, setSubCategoryModal] = useState({
        show: false,
        parentCategory: null,
        subCategory: null,
    });
    const [expandedRows, setExpandedRows] = useState(() =>
        rows[0]?.id ? new Set([rows[0].id]) : new Set()
    );

    const toggleExpanded = (categoryId) => {
        setExpandedRows((current) => {
            const next = new Set(current);

            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }

            return next;
        });
    };

    const deleteCategory = (category) => {
        if (confirm(`Delete ${category.name}?`)) {
            destroy(`/products/categories/${category.id}`, {
                preserveScroll: true,
            });
        }
    };

    const openAddSubCategory = (parentCategory) => {
        setSubCategoryModal({
            show: true,
            parentCategory,
            subCategory: null,
        });
    };

    const openEditSubCategory = (parentCategory, subCategory) => {
        setSubCategoryModal({
            show: true,
            parentCategory,
            subCategory,
        });
    };

    const closeSubCategoryModal = () => {
        setSubCategoryModal({
            show: false,
            parentCategory: null,
            subCategory: null,
        });
    };

    return (
        <AuthenticatedLayout title="Categories">
            <Head title="Categories" />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Categories
                    </h1>
                    <Link
                        href="/products/categories/create"
                        className="create-button px-5 py-2"
                    >
                        Add Category
                    </Link>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-4">#</th>
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Slug</th>
                                    <th className="px-5 py-4">Sub Categories count</th>
                                    <th className="px-5 py-4">Products count</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {rows.map((category, index) => {
                                    const isExpanded = expandedRows.has(category.id);

                                    return (
                                        <Fragment key={category.id}>
                                            <tr key={category.id} className="align-top">
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {index + 1}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpanded(category.id)}
                                                        className="flex items-center gap-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-100"
                                                    >
                                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                        {category.name}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {category.slug}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {category.sub_categories_count ??
                                                        category.sub_categories?.length ??
                                                        0}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {category.products_count}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={category.status} />
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <RowActions
                                                        category={category}
                                                        editHref={`/products/categories/${category.id}/edit`}
                                                        onDelete={deleteCategory}
                                                        processing={processing}
                                                    />
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${category.id}-sub-categories`}>
                                                    <td colSpan={7} className="px-5 py-4">
                                                        <SubCategoriesTable
                                                            category={category}
                                                            onAdd={openAddSubCategory}
                                                            onEdit={openEditSubCategory}
                                                            onDelete={deleteCategory}
                                                            processing={processing}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            No categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={categories?.links} />
                <SubCategoryModal
                    show={subCategoryModal.show}
                    parentCategory={subCategoryModal.parentCategory}
                    subCategory={subCategoryModal.subCategory}
                    onClose={closeSubCategoryModal}
                />
            </section>
        </AuthenticatedLayout>
    );
}
