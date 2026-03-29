import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Head, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import DataTable from "@/Components/DataTable/DataTable";
import { useState } from "react";
import { Trash2Icon, EditIcon } from "lucide-react"
import { dateTimeFormater } from "@/util/DateFormater";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ banks }) => {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [clientErrors, setClientErrors] = useState({});
    const { company_name, filters } = usePage().props;
    const list = banks?.data ?? [];

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        delete: destroy,
    } = useForm({
        name: "",
    });

    // ---- Modal Handlers ----
    const openCreateModal = () => {
        reset();
        setEditing(null);
        setClientErrors({});
        setOpen(true);
    };

    const openEditModal = (bank) => {
        setData("name", bank.name);
        setEditing(bank);
        setClientErrors({});
        setOpen(true);
    };

    // ---- Client Validation ----
    const validate = () => {
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = "Bank name is required.";
        else if (data.name.length < 3)
            newErrors.name = "Bank name must be at least 3 characters.";
        else if (data.name.length > 255)
            newErrors.name = "Bank name cannot exceed 255 characters.";

        setClientErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (editing) {
            put(route("banks.update", editing.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route("banks.store"), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this bank?")) {
            destroy(route("banks.destroy", id));
        }
    };

    // ---- DataTable Setup ----
    const columns = [
        { key: "si", label: "SI" },
        { key: "name", label: "Bank name" },
        { key: "created_at", label: "Created at" },
        { key: "updated_at", label: "Last updated at" },
    ];

    const tableData = list.map((bank, index) => ({
        ...bank,
        si: (banks.current_page - 1) * banks.per_page + index + 1,
        created_at: dateTimeFormater(bank.created_at),
        updated_at: dateTimeFormater(bank.updated_at),
    }));

    return (
        <AuthenticatedLayout title="Banks">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Banking Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Manage bank records from one place
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Create, edit, and maintain bank entries without
                                leaving the list view. Search and quick actions
                                stay available in one streamlined workspace.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible banks
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>

                            <button
                                onClick={openCreateModal}
                                className="create-button"
                                disabled={processing}
                            >
                                Add new
                            </button>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="banks.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search banks..."
                    className="mb-4"
                />

                {/* ---- Modal (Create / Edit) ---- */}
                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={editing ? "Edit bank" : "Add new bank"}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="delete-button"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className={`create-button ${
                                    processing
                                        && "cursor-not-allowed"
                                        
                                }`}
                            >
                                {processing
                                    ? editing
                                        ? "Updating..."
                                        : "Saving..."
                                    : editing
                                    ? "Update"
                                    : "Save"}
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                Bank name <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800 ${
                                    clientErrors.name || errors.name
                                        ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-500/20"
                                        : "border-slate-300 focus:border-amber-400 focus:ring-amber-100 dark:border-slate-600 dark:focus:border-amber-400 dark:focus:ring-amber-500/20"
                                }`}
                                disabled={processing}
                                placeholder="Enter bank name"
                            />

                            {(clientErrors.name || errors.name) && (
                                <div className="text-red-500 text-sm mt-1">
                                    {clientErrors.name || errors.name}
                                </div>
                            )}
                        </div>
                    </form>
                </Modal>

                {/* ---- Reusable Data Table ---- */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(row)}
                                    className="edit-button"
                                    disabled={processing}
                                    title="Edit"
                                >
                                    <EditIcon className="w-4 h-4 inline" />
                                </button>

                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="delete-button"
                                    disabled={processing}
                                    title="Delete"
                                >
                                    <Trash2Icon className="w-4 h-4 inline" />
                                </button>
                            </div>
                        )}
                    />
                </div>
                <Pagination links={banks?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
