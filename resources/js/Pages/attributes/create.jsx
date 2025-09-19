import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState } from "react";

const Create = () => {
  const { data, setData, post, errors } = useForm({
    name: "",
    values: [""], // start with one empty value input
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
    <AuthenticatedLayout>
      <section className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Add New Attribute</h3>

        <form onSubmit={handleSubmit}>
          <fieldset className="mb-4">
            <label className="block mb-1 text-sm" htmlFor="name">
              Attribute Name
            </label>
            <input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter attribute name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </fieldset>

          <fieldset className="mb-4">
            <label className="block mb-1 text-sm">Attribute Values</label>
            {data.values.map((value, index) => (
              <div className="flex items-center mb-2" key={index}>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValueAtIndex(e.target.value, index)}
                  placeholder="Enter value"
                  className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {data.values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeValueField(index)}
                    className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addValueField}
              className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2"
            >
              Add Value
            </button>
          </fieldset>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
          >
            Save
          </button>
        </form>
      </section>
    </AuthenticatedLayout>
  );
};

export default Create;
