import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Edit = ({ product, categories }) => {

    // console.log('product: ',product);
    // console.log('categories: ', categories);

    
    const { data, setData, post, processing, errors, put } = useForm({
        productName: product.name,
        description: product.description,
        price: product.price,
        category: product.category.id,
        subCategory: product.sub_category_id,
    });


    const submit = (e) => {
        e.preventDefault();
        put(route("products.update", product.id));
    };

    // console.log('data: ',data);

    return (
        <AuthenticatedLayout>
            <div className="w-full flex justify-center items-center">
                <div className="bg-white p-4 rounded">
                    <h1 className="text-md font-bold">Update Product</h1>

                    <form onSubmit={submit}>
                        <fieldset>
                            <legend>
                                <label>Product Name</label>
                            </legend>
                            <input
                                type="text"
                                name="productName"
                                value={data.productName}
                                onChange={(e) =>
                                    setData("productName", e.target.value)
                                }
                                className="w-full"
                            />
                        </fieldset>
                        <fieldset>
                            <legend>
                                <label>Description</label>
                            </legend>
                            <textarea
                                value={data.description}
                                name="description"
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            ></textarea>
                        </fieldset>
                        <fieldset>
                            <legend>
                                <label>Price</label>
                            </legend>
                            <input
                                value={data?.price}
                                type="number"
                                name="price"
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                                className="w-full"
                                step={0.01}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>
                                <label>Category</label>
                            </legend>
                            <select
                                name="category"
                                id="category"
                                onChange={(e) =>
                                    setData("category", e.target.value)
                                }
                                className="w-full"
                                value={data.category}
                            >
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

                        {data?.category && (
                            <fieldset>
                                <legend>
                                    <label>Sub Category</label>
                                </legend>
                                <select
                                    name="subCategory"
                                    id="subCategory"
                                    onChange={(e) =>
                                        setData("subCategory", e.target.value)
                                    }
                                    className="w-full"
                                    value={data.subCategory}
                                >
                                    {categories[
                                        data.category - 1
                                    ]?.sub_categories?.map((subCategory) => (
                                        <option
                                            key={subCategory.id}
                                            value={subCategory.id}
                                        >
                                            {subCategory.name}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                        )}

                        <div className="w-full flex justify-end mt-2">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white p-1 px-2 rounded"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit;
