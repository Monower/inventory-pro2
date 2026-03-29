import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";

const Create = ({ categories }) => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("subcategories.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create Subcategory - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Create Subcategory</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Attach a focused subcategory to its parent category for better catalog depth.</p>
                </div>

                <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div>
                        <form onSubmit={submit}>
                            <fieldset className="flex flex-col gap-2">
                                <label>Category Name</label>
                                <select
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
                                    className="w-full"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>

                            <fieldset className="flex flex-col gap-2">
                                <label>Subcategory Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full"
                                    placeholder="Enter subcategory name"
                                />
                            </fieldset>

                            <div className="w-full flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 text-white p-1 px-2 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
