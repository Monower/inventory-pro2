import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";


const Edit = ({category}) => {
    const { data, setData, post, processing, errors, put: update } = useForm({
        name: category.name,
    });

    const updateCategory = (e) => {
        e.preventDefault();
        update(route("categories.update", category.id));
    };

    return (
        <AuthenticatedLayout>
            <div className="w-full h-[50vh] flex justify-center items-center">
                <div className="bg-white p-4 rounded">
                    <h1 className="text-md font-bold">Update Category</h1>

                    <form
                        onSubmit={updateCategory}
                        className="flex flex-col items-center gap-2"
                    >
                        <input
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 placeholder:text-sm"
                            // placeholder="Enter category name"
                        />
                        <div className="w-full flex justify-end gap-2">
                            <button type="submit" disabled={processing} className="bg-blue-500 text-white p-1 px-2 rounded">Update</button>
                            <button disabled={processing} onClick={() => window.history.back()} type="button" className="bg-gray-500 text-white p-1 px-2 rounded">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    )
};

export default Edit;