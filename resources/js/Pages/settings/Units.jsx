import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Pagination from "@/Components/Pagination";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

const actionButtonClass =
    "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition";

function StatusBadge({ status }) {
    const isActive = status === "Active";

    return (
        <span
            className={
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                (isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
            }
        >
            {status}
        </span>
    );
}

function UnitModal({ mode, data, setData, errors, processing, onClose, onSubmit }) {
    const title = mode === "edit" ? "Edit Unit" : "Add Unit";
    const buttonLabel = mode === "edit" ? "Save Changes" : "Save";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </h2>

                <form onSubmit={onSubmit} className="mt-6 space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Name" required />
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(event) => setData("name", event.target.value)}
                            className="mt-1"
                            placeholder="Dozen"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="symbol" value="Short Code" />
                        <input
                            id="symbol"
                            type="text"
                            value={data.symbol}
                            onChange={(event) => setData("symbol", event.target.value)}
                            className="mt-1"
                            placeholder="dz"
                        />
                        <InputError className="mt-2" message={errors.symbol} />
                    </div>

                    <div>
                        <InputLabel value="Status" />
                        <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                            {[
                                { label: "Active", value: true },
                                { label: "Inactive", value: false },
                            ].map((status) => (
                                <button
                                    key={status.label}
                                    type="button"
                                    onClick={() => setData("is_active", status.value)}
                                    className={
                                        "rounded-md px-4 py-2 text-sm font-semibold transition " +
                                        (data.is_active === status.value
                                            ? "bg-white text-amber-700 shadow-sm dark:bg-slate-950 dark:text-amber-300"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100")
                                    }
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                        <InputError className="mt-2" message={errors.is_active} />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="create-button px-5 py-2"
                        >
                            {processing ? "Saving..." : buttonLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Units({ units }) {
    const rows = units?.data || [];
    const [modalMode, setModalMode] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        clearErrors,
        processing,
        errors,
    } = useForm({
        name: "",
        symbol: "",
        is_active: true,
    });

    const closeModal = () => {
        setModalMode(null);
        setEditingUnit(null);
        reset();
        clearErrors();
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingUnit(null);
        setConfirmingDeleteId(null);
        setModalMode("create");
    };

    const openEditModal = (unit) => {
        clearErrors();
        setEditingUnit(unit);
        setConfirmingDeleteId(null);
        setData({
            name: unit.name || "",
            symbol: unit.symbol || "",
            is_active: Boolean(unit.is_active),
        });
        setModalMode("edit");
    };

    const submitUnit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (modalMode === "edit" && editingUnit) {
            put(`/settings/units/${editingUnit.id}`, options);
            return;
        }

        post("/settings/units", options);
    };

    const deleteUnit = (unit) => {
        destroy(`/settings/units/${unit.id}`, {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeleteId(null),
        });
    };

    return (
        <AuthenticatedLayout title="Units">
            <Head title="Units" />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Units
                    </h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="create-button px-5 py-2"
                    >
                        Add Unit
                    </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-4">#</th>
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Short Code</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {rows.map((unit, index) => (
                                    <tr key={unit.id}>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {unit.name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {unit.symbol || "-"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={unit.status} />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="relative flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(unit)}
                                                    className={`${actionButtonClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => setConfirmingDeleteId(unit.id)}
                                                    className={`${actionButtonClass} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`}
                                                >
                                                    Delete
                                                </button>
                                                {confirmingDeleteId === unit.id && (
                                                    <div className="absolute right-0 top-10 z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            Are you sure you want to delete this unit?
                                                        </p>
                                                        <div className="mt-4 flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmingDeleteId(null)}
                                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={processing}
                                                                onClick={() => deleteUnit(unit)}
                                                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                                                            >
                                                                {processing ? "Deleting..." : "Delete"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            No units found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={units?.links} />
            </section>

            {modalMode && (
                <UnitModal
                    mode={modalMode}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onClose={closeModal}
                    onSubmit={submitUnit}
                />
            )}
        </AuthenticatedLayout>
    );
}
