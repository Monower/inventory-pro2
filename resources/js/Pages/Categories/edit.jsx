import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";


const Edit = ({category}) => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors, put: update } = useForm({
        name: category.name,
    });

    const updateCategory = (e) => {
        e.preventDefault();
        update(route("categories.update", category.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Category - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Update Category</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Refine the category name while keeping the catalog structure clear.</p>
                </div>

                <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form
                        onSubmit={updateCategory}
                        className="flex flex-col items-center gap-2"
                    >
                        <input
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full"
                            // placeholder="Enter category name"
                        />
                        <div className="w-full flex justify-end gap-2">
                            <button type="submit" disabled={processing} className="bg-blue-500 text-white p-1 px-2 rounded">Update</button>
                            <button disabled={processing} onClick={() => window.history.back()} type="button" className="bg-gray-500 text-white p-1 px-2 rounded">Cancel</button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    )
};

export default Edit;
