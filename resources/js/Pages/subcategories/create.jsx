import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Create = ({ categories }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
    });

    console.log(categories);

    const submit = (e) => {
        e.preventDefault();
        post(route("subcategories.store"));
    };

    return (
        <AuthenticatedLayout>
            <div className="w-full h-[50vh] flex justify-center items-center">
                <div className="bg-white p-4 rounded">
                    <h1 className="text-md font-bold">Create Subcategory</h1>

                    <div>
                        <form onSubmit={submit}>
                            <fieldset className="flex flex-col gap-2">
                                <label>Category Name</label>
                                <select
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
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
                                    className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 placeholder:text-sm"
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
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;
