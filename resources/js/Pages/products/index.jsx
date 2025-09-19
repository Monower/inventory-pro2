import { Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";

const Index = () => {
  const { products } = usePage().props;
  const [search, setSearch] = useState("");

  // Filter products locally (can be replaced with server-side search)
  const filteredProducts = products.data.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthenticatedLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4 max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold">Products</h2>
          <Link
            href={route("products.create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Product
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 mb-4 w-full max-w-md mx-auto block"
        />

        <div className="overflow-x-auto max-w-5xl mx-auto">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Selling Price</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Stock</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Unit</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Sub Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Attribute Value</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 px-3 py-2">{product.name}</td>
                    <td className="border border-gray-300 px-3 py-2">{product.selling_price}</td>
                    <td className="border border-gray-300 px-3 py-2">{product.stock}</td>
                    <td className="border border-gray-300 px-3 py-2">{product.unit}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      {product.sub_category?.name || "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {product.attribute_value?.name || "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 space-x-2">
                      <Link
                        href={route("products.edit", product.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={route("products.destroy", product.id)}
                        method="delete"
                        as="button"
                        className="text-red-600 hover:underline"
                        onClick={(e) => {
                          if (!confirm("Are you sure you want to delete this product?")) e.preventDefault();
                        }}
                      >
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {products.links && (
          <div className="mt-4 max-w-5xl mx-auto flex justify-center space-x-2">
            {products.links.map((link, index) => (
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
