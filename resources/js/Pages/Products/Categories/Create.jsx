import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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

export default function Create() {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        slug: "",
        description: "",
        image: null,
        is_active: true,
        parent_id: "",
    });

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

    const removeImage = () => {
        setData("image", null);
        setImagePreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post("/products/categories", {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout title="Add Category">
            <Head title="Add Category" />

            <section className="space-y-6">
                <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                            Add Category
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
                            <span>Add Category</span>
                        </div>
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
                                            onClick={removeImage}
                                            className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove
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
                            {processing ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
}
