import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

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
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"attributes.index"} />
                    <h3 className="heading">Create Attribute</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-3 mb-4">
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                    Attribute name
                                </label>
                            </legend>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="custom-input"
                                placeholder="Enter attribute name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                    Attribute values
                                </label>
                            </legend>
                            <div className="space-y-2">
                                {data.values.map((value, index) => (
                                    <div
                                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                                        key={index}
                                    >
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) =>
                                                setValueAtIndex(e.target.value, index)
                                            }
                                            placeholder="Enter value"
                                            className="custom-input border border-ring rounded-md"
                                        />
                                        {data.values.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeValueField(index)}
                                                className="delete-button"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={addValueField}
                                    className="create-button"
                                >
                                    Add value
                                </button>
                            </div>
                        </fieldset>
                    </div>

                    <div className="w-full flex justify-end">
                        <button
                            type="submit"
                            className="create-button"
                            disabled={processing}
                        >
                            {processing ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
