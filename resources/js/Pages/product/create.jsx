import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Create = ({categories}) => {
    const { data, setData, post, processing, errors } = useForm({
        productName: "",
        description: "",
        price: "",
        category: categories[0]?.id,
        subCategory: categories[0]?.sub_categories[0]?.id,
    });

    const submit = (e) =>{
        e.preventDefault();
        post(route("products.store"));
    };

    console.log('data and categories: ',data, categories);

    return (
        <AuthenticatedLayout>
            <div className="w-full flex justify-center items-center">
                <div className="bg-white p-4 rounded">
                    <h1 className="text-md font-bold">Create Product</h1>

                    <form onSubmit={submit}>
                        <fieldset>
                            <legend>
                                <label>Product Name</label>                            
                            </legend>
                            <input type="text" name="productName" onChange={(e) => setData("productName", e.target.value)} className="w-full" />
                        </fieldset>
                        <fieldset>
                            <legend>
                                <label>Description</label>
                            </legend>
                            <textarea name="description" onChange={(e) => setData("description", e.target.value)}></textarea>
                        </fieldset>
                        <fieldset>
                            <legend>
                                <label>Price</label>
                            </legend>
                            <input type="number" name="price" onChange={(e) => setData("price", e.target.value)} className="w-full" />
                        </fieldset>
                        <fieldset>
                            <legend>
                                <label>Category</label>
                            </legend>
                            <select name="category" id="category" onChange={(e) => setData("category", e.target.value)} className="w-full">


                                {categories?.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}

                                {/* <option value="1">Category 1</option>
                                <option value="2">Category 2</option> */}
                            </select>
                        </fieldset>


                        {
                            data?.category && (
                                <fieldset>
                                    <legend>
                                        <label>
                                            Sub Category
                                        </label>
                                    </legend>
                                    <select name="subCategory" id="subCategory" onChange={(e) => setData("subCategory", e.target.value)} className="w-full">
                                        {categories[data.category - 1]?.sub_categories?.map((subCategory) => (
                                            <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                        ))}
                                    </select>
                                </fieldset>
                            )
                        }

                        {/* <fieldset>
                            <legend>
                                <label>
                                    Sub Category
                                </label>
                            </legend>
                            <select name="subCategory" id="subCategory" onChange={(e) => setData("subCategory", e.target.value)} className="w-full">
                                <option value="1">Sub Category 1</option>
                                <option value="2">Sub Category 2</option>
                            </select>
                        </fieldset> */}

                        <div className="w-full flex justify-end mt-2">
                            <button type="submit" className="bg-blue-500 text-white p-1 px-2 rounded">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    )
};


export default Create;