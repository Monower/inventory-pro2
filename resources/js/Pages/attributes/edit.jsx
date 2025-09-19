import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

const Edit = ({ attribute }) => {
  const { data, setData, put, errors, processing } = useForm({
    name: attribute.name || "",
    values: attribute.values.length
      ? attribute.values.map((v) => ({ id: v.id, name: v.name }))
      : [{ name: "" }],
  });

  useEffect(() => {
    setData("name", attribute.name);
    setData(
      "values",
      attribute.values.length
        ? attribute.values.map((v) => ({ id: v.id, name: v.name }))
        : [{ name: "" }]
    );
  }, [attribute]);

  const addValueField = () => {
    setData("values", [...data.values, { name: "" }]);
  };

  const removeValueField = (index) => {
    setData(
      "values",
      data.values.filter((_, i) => i !== index)
    );
  };

  const setValueAtIndex = (value, index) => {
    const updated = [...data.values];
    updated[index].name = value;
    setData("values", updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("attributes.update", attribute.id));
  };

  return (
    <AuthenticatedLayout>
      <section className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Edit Attribute</h3>

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
                  value={value.name}
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
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
          >
            Update
          </button>
        </form>
      </section>
    </AuthenticatedLayout>
  );
};

export default Edit;
