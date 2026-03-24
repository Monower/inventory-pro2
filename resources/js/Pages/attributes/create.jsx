import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = () => {
    const { data, setData, post, errors, processing } = useForm({
        name: "",
        values: [""],
    });

    const addValueField = () => {
        setData("values", [...data.values, ""]);
    };

    const removeValueField = (index) => {
        setData(
            "values",
            data.values.filter((_, i) => i !== index)
        );
    };

    const setValueAtIndex = (value, index) => {
        const updated = [...data.values];
        updated[index] = value;
        setData("values", updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("attributes.store"));
    };

    return (
        <AuthenticatedLayout title="Create Attribute">
            <CreatePageLayout
                title="Create Attribute"
                description="Define reusable product attributes and value options so your catalog stays structured and consistent across related items."
                backRoute="attributes.index"
                meta={[
                    { label: "Example", value: "Size, Color, Storage" },
                    { label: "Use case", value: "Catalog normalization" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Attribute Design Tips"
                        items={[
                            {
                                title: "Keep names generic",
                                description:
                                    "Use attribute names that can be reused across many products.",
                            },
                            {
                                title: "Avoid duplicate values",
                                description:
                                    "Consistent value labels make searching and filtering far more reliable.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Attribute Setup"
                        description="Start with a broad attribute name and then define the value options your products will use."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Create attribute"}
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-5">
                            <div className="max-w-2xl field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Attribute name
                                    </legend>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter attribute name"
                                    />
                                </fieldset>
                                {errors.name ? <p className="field-error">{errors.name}</p> : null}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">
                                            Attribute values
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Add the available choices users can assign to products.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addValueField}
                                        className="secondary-button"
                                    >
                                        Add value
                                    </button>
                                </div>

                                <div className="grid gap-3">
                                    {data.values.map((value, index) => (
                                        <div
                                            className="rounded-2xl border border-border bg-background/80 p-3"
                                            key={index}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) =>
                                                        setValueAtIndex(e.target.value, index)
                                                    }
                                                    placeholder="Enter value"
                                                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                                />
                                                {data.values.length > 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeValueField(index)
                                                        }
                                                        className="delete-button"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
