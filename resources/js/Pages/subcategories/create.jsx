import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = ({ categories }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("subcategories.store"));
    };

    return (
        <AuthenticatedLayout title="Create Subcategory">
            <CreatePageLayout
                title="Create Subcategory"
                description="Add a more specific product grouping beneath an existing category to improve catalog navigation and reporting detail."
                backRoute="subcategories.index"
                meta={[
                    { label: "Depends on", value: "Existing category" },
                    { label: "Use case", value: "Catalog refinement" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Structure Tips"
                        items={[
                            {
                                title: "Keep hierarchy simple",
                                description:
                                    "Subcategories should clarify browsing, not create unnecessary depth.",
                            },
                            {
                                title: "Name with intent",
                                description:
                                    "Choose labels that help staff quickly understand where a product belongs.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={submit}>
                    <CreateSectionCard
                        title="Subcategory Details"
                        description="Connect the new subcategory to its parent category and choose a name that fits your product structure."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create subcategory"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Parent category
                                    </legend>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData("category_id", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">Select category</option>
                                        {categories?.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.category_id ? (
                                    <p className="field-error">{errors.category_id}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Subcategory name
                                    </legend>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="custom-input"
                                        placeholder="Example: Smartphones"
                                    />
                                </fieldset>
                                {errors.name ? (
                                    <p className="field-error">{errors.name}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
