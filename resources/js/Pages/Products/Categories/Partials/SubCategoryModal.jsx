import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";

const makeSlug = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export default function SubCategoryModal({
    show,
    parentCategory,
    subCategory,
    onClose,
}) {
    const isEditing = Boolean(subCategory);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            _method: isEditing ? "put" : "post",
            parent_id: parentCategory?.id || "",
            name: subCategory?.name || "",
            slug: subCategory?.slug || "",
            description: subCategory?.description || "",
            is_active: subCategory?.status ? subCategory.status === "Active" : true,
        });

    useEffect(() => {
        setData({
            _method: isEditing ? "put" : "post",
            parent_id: parentCategory?.id || "",
            name: subCategory?.name || "",
            slug: subCategory?.slug || "",
            description: subCategory?.description || "",
            is_active: subCategory?.status ? subCategory.status === "Active" : true,
        });
        clearErrors();
    }, [show, parentCategory, subCategory]);

    const closeModal = () => {
        reset();
        clearErrors();
        onClose();
    };

    const updateName = (name) => {
        setData({
            ...data,
            name,
            slug: makeSlug(name),
        });
    };

    const submit = (event) => {
        event.preventDefault();

        post(
            isEditing
                ? `/products/categories/${subCategory.id}`
                : "/products/categories",
            {
                preserveScroll: true,
                onSuccess: closeModal,
            }
        );
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="lg">
            <form onSubmit={submit} className="space-y-5 p-6">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {isEditing ? "Edit Sub Category" : "Add Sub Category"}
                    </h2>
                </div>

                <div>
                    <InputLabel value="Parent Category" />
                    <input
                        type="text"
                        value={parentCategory?.name || ""}
                        readOnly
                        className="mt-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="sub_category_name" value="Name" required />
                    <input
                        id="sub_category_name"
                        type="text"
                        value={data.name}
                        onChange={(event) => updateName(event.target.value)}
                        className="mt-1"
                        placeholder="Enter sub category name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="sub_category_slug" value="Slug" required />
                    <input
                        id="sub_category_slug"
                        type="text"
                        value={data.slug}
                        onChange={(event) =>
                            setData("slug", makeSlug(event.target.value))
                        }
                        className="mt-1"
                        placeholder="sub-category-slug"
                    />
                    <InputError className="mt-2" message={errors.slug} />
                </div>

                <div>
                    <InputLabel htmlFor="sub_category_description" value="Description" />
                    <textarea
                        id="sub_category_description"
                        value={data.description}
                        onChange={(event) =>
                            setData("description", event.target.value)
                        }
                        className="mt-1"
                        rows={4}
                        placeholder="Write a short sub category description"
                    />
                    <InputError className="mt-2" message={errors.description} />
                </div>

                <div>
                    <InputLabel value="Status" />
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

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="create-button px-5 py-2"
                    >
                        {processing ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
