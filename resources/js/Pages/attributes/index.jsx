import { Link, usePage, useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable/DataTable";
import React, { useState } from "react";

const Index = () => {
    const { attributes, company_name } = usePage().props;
    const { delete: destroy, processing } = useForm();
    const [search, setSearch] = useState("");

    const filteredAttributes = attributes.data.filter((attr) =>
        attr.name.toLowerCase().includes(search.toLowerCase())
    );

    // ---- Columns for DataTable ----
    const columns = [
        { key: "name", label: "Name" },
        { key: "values", label: "Values" },
    ];

    // ---- Format data for DataTable ----
    const tableData = filteredAttributes.map((attr) => ({
        ...attr,
        values: attr.values.map((v) => v.name).join(", "),
    }));

    // ---- Delete handler ----
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this attribute?")) {
            destroy(route("attributes.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Attributes - ${company_name}`} />
            <div className="p-4 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="heading">Attributes</h2>
                    <Link
                        href={route("attributes.create")}
                        className="create-button"
                    >
                        Add Attribute
                    </Link>
                </div>

                {/* Search Input (optional) */}
                {/* 
                <input
                    type="text"
                    placeholder="Search attributes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 mb-4 w-full max-w-md"
                /> 
                */}

                {/* ---- Reusable DataTable ---- */}
                <DataTable
                    columns={columns}
                    data={tableData}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <Link
                                href={route("attributes.edit", row.id)}
                                className="edit-button"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(row.id)}
                                disabled={processing}
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                    noDataMessage="No attributes found."
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;
