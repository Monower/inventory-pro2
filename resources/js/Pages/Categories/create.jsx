import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("categories.store"));
    };

    return (
        <AuthenticatedLayout title="Create Category">
            <CreatePageLayout
                title="Create Category"
                description="Group products under a clear category structure so browsing, reporting, and stock organization stay consistent as your catalog grows."
                backRoute="categories.index"
                meta={[
                    { label: "Module", value: "Catalog setup" },
                    { label: "Purpose", value: "Top-level grouping" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="What Good Categories Do"
                        items={[
                            {
                                title: "Stay broad but useful",
                                description:
                                    "Use categories for major product families, not for tiny variations.",
                            },
                            {
                                title: "Keep names customer-friendly",
                                description:
                                    "Short, recognizable labels make reports and staff workflows easier to scan.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={submit}>
                    <CreateSectionCard
                        title="Category Details"
                        description="A clean category structure makes product assignment, filtering, and future subcategory expansion much easier."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create category"}
                                </button>
                            </div>
                        }
                    >
                        <div className="max-w-2xl field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                    Category name
                                </legend>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="custom-input"
                                    placeholder="Example: Electronics"
                                />
                            </fieldset>
                            {errors.name ? (
                                <p className="field-error">{errors.name}</p>
                            ) : null}
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
