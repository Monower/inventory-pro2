import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";

const Create = () => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("categories.store"));
    };
    return (
        <AuthenticatedLayout>
            <Head title={`Create Category - ${company_name}`} />
            <div className="w-full h-[50vh] flex justify-center items-center">
                <div className="bg-card text-card-foreground p-4 rounded border border-border">
                    <h1 className="text-md font-bold">Create Category</h1>

                    <form
                        onSubmit={submit}
                        className="flex flex-col items-center gap-2"
                    >
                        <input
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full"
                            placeholder="Enter category name"
                        />
                        <div className="w-full flex justify-end">
                            <button type="submit" disabled={processing} className="bg-blue-500 text-white p-1 px-2 rounded">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;
