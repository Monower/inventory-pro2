import { Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";

const Index = () => {
  const { attributes } = usePage().props;
  const [search, setSearch] = useState("");

  const filteredAttributes = attributes.data.filter((attr) =>
    attr.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthenticatedLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Attributes</h2>
          <Link
            href={route("attributes.create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Attribute
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search attributes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 mb-4 w-full max-w-md"
        />

        <table className="table-auto w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-3 py-2">Name</th>
              <th className="border border-gray-300 px-3 py-2">Values</th>
              <th className="border border-gray-300 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttributes.length > 0 ? (
              filteredAttributes.map((attribute) => (
                <tr key={attribute.id}>
                  <td className="border border-gray-300 px-3 py-2">{attribute.name}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    {attribute.values.map((v) => v.name).join(", ")}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 space-x-2">
                    <Link
                      href={route("attributes.edit", attribute.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={route("attributes.destroy", attribute.id)}
                      method="delete"
                      as="button"
                      className="text-red-600 hover:underline"
                      onClick={(e) => {
                        if (!confirm("Are you sure you want to delete this attribute?")) e.preventDefault();
                      }}
                    >
                      Delete
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4">
                  No attributes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {attributes.links && (
          <div className="mt-4 flex justify-center space-x-2">
            {attributes.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || "#"}
                className={`px-3 py-1 rounded border ${
                  link.active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Index;
