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

function ValueChip({ value, onRemove }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            {value}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-amber-700 transition hover:text-rose-600 dark:text-amber-300 dark:hover:text-rose-300"
                    aria-label={`Remove ${value}`}
                >
                    x
                </button>
            )}
        </span>
    );
}

function AttributeModal({
    mode,
    data,
    setData,
    errors,
    processing,
    onClose,
    onSubmit,
}) {
    const [valueInput, setValueInput] = useState("");
    const title = mode === "edit" ? "Edit Attribute" : "Add Attribute";
    const buttonLabel = mode === "edit" ? "Save Changes" : "Save";

    const addValue = () => {
        const nextValue = valueInput.trim();

        if (!nextValue || data.values.includes(nextValue)) {
            setValueInput("");
            return;
        }

        setData("values", [...data.values, nextValue]);
        setValueInput("");
    };

    const handleValueKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addValue();
        }
    };

    const removeValue = (value) => {
        setData(
            "values",
            data.values.filter((item) => item !== value)
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
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
                            placeholder="Size"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel value="Values" />
                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                            <div className="flex flex-wrap gap-2">
                                {data.values.map((value) => (
                                    <ValueChip
                                        key={value}
                                        value={value}
                                        onRemove={() => removeValue(value)}
                                    />
                                ))}
                                <input
                                    type="text"
                                    value={valueInput}
                                    onChange={(event) => setValueInput(event.target.value)}
                                    onKeyDown={handleValueKeyDown}
                                    className="min-w-28 flex-1 border-0 bg-transparent px-2 py-1 text-sm shadow-none focus:border-0 focus:ring-0 dark:bg-transparent"
                                    placeholder="Type value and press Enter"
                                />
                                <button
                                    type="button"
                                    onClick={addValue}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                    aria-label="Add value"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <InputError className="mt-2" message={errors.values} />
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

export default function Attributes({ attributes }) {
    const rows = attributes?.data || [];
    const [modalMode, setModalMode] = useState(null);
    const [editingAttribute, setEditingAttribute] = useState(null);
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
        values: [],
        is_active: true,
    });

    const closeModal = () => {
        setModalMode(null);
        setEditingAttribute(null);
        reset();
        clearErrors();
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingAttribute(null);
        setConfirmingDeleteId(null);
        setModalMode("create");
    };

    const openEditModal = (attribute) => {
        clearErrors();
        setEditingAttribute(attribute);
        setConfirmingDeleteId(null);
        setData({
            name: attribute.name || "",
            values: attribute.values || [],
            is_active: Boolean(attribute.is_active),
        });
        setModalMode("edit");
    };

    const submitAttribute = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (modalMode === "edit" && editingAttribute) {
            put(`/settings/attributes/${editingAttribute.id}`, options);
            return;
        }

        post("/settings/attributes", options);
    };

    const deleteAttribute = (attribute) => {
        destroy(`/settings/attributes/${attribute.id}`, {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeleteId(null),
        });
    };

    return (
        <AuthenticatedLayout title="Attributes">
            <Head title="Attributes" />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Attributes
                    </h1>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="create-button px-5 py-2"
                    >
                        Add Attribute
                    </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-4">#</th>
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Values</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {rows.map((attribute, index) => (
                                    <tr key={attribute.id}>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {attribute.name}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {(attribute.values || []).map((value) => (
                                                    <ValueChip key={value} value={value} />
                                                ))}
                                                {(attribute.values || []).length === 0 && (
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={attribute.status} />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="relative flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(attribute)}
                                                    className={`${actionButtonClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => setConfirmingDeleteId(attribute.id)}
                                                    className={`${actionButtonClass} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`}
                                                >
                                                    Delete
                                                </button>
                                                {confirmingDeleteId === attribute.id && (
                                                    <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            Are you sure? This will affect products using this attribute.
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
                                                                onClick={() => deleteAttribute(attribute)}
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
                                            No attributes found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={attributes?.links} />
            </section>

            {modalMode && (
                <AttributeModal
                    mode={modalMode}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onClose={closeModal}
                    onSubmit={submitAttribute}
                />
            )}
        </AuthenticatedLayout>
    );
}
