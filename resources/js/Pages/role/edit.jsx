import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import { useDeferredValue, useState } from "react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ role, permissions }) => {
    const { company_name } = usePage().props;
    const [search, setSearch] = useState("");
    // Initialize with role data
    const { data, setData, put, errors } = useForm({
        name: role.name || "",
        permissions: role.permissions
            ? role.permissions.map((p) => p.name)
            : [], // pre-check permissions
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("role.update", role.id)); // use PUT method for update
    };

    const allPermissionNames = permissions.map((permission) => permission.name);
    const deferredSearch = useDeferredValue(search);
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const allPermissionsSelected =
        allPermissionNames.length > 0 &&
        allPermissionNames.every((name) => data.permissions.includes(name));

    // Handle individual checkbox changes
    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        if (e.target.checked) {
            setData("permissions", [...data.permissions, value]);
        } else {
            setData(
                "permissions",
                data.permissions.filter((name) => name !== value)
            );
        }
    };

    const handleToggleAllPermissions = () => {
        setData("permissions", allPermissionsSelected ? [] : allPermissionNames);
    };

    // Handle "Select All" for a category
    const handleCategorySelectAll = (resource, perms) => {
        const allSelected = perms.every((p) =>
            data.permissions.includes(p.name)
        );
        if (allSelected) {
            // Deselect all
            setData(
                "permissions",
                data.permissions.filter(
                    (name) => !perms.some((p) => p.name === name)
                )
            );
        } else {
            // Select all
            const namesToAdd = perms.map((p) => p.name);
            const newPermissions = Array.from(
                new Set([...data.permissions, ...namesToAdd])
            );
            setData("permissions", newPermissions);
        }
    };

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((groups, permission) => {
        const parts = permission.name.split(" ");
        const resource = parts.slice(1).join(" "); // e.g. "customer", "dashboard"
        if (!groups[resource]) groups[resource] = [];
        groups[resource].push(permission);
        return groups;
    }, {});
    const visibleGroupedPermissions = Object.entries(groupedPermissions)
        .map(([resource, perms]) => [
            resource,
            perms.filter((permission) =>
                permission.name.toLowerCase().includes(normalizedSearch)
            ),
        ])
        .filter(([resource, perms]) =>
            normalizedSearch
                ? resource.toLowerCase().includes(normalizedSearch) ||
                  perms.length > 0
                : perms.length > 0
        );
    const visiblePermissionCount = visibleGroupedPermissions.reduce(
        (count, [, perms]) => count + perms.length,
        0
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Role - ${company_name}`} />
            <section>
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton url={"roles.index"} />
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                Edit role
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Update the role name and adjust permission access
                                without losing the current selection.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
                            <p className="text-slate-500 dark:text-slate-400">Selected</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {data.permissions.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
                            <p className="text-slate-500 dark:text-slate-400">Available</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {permissions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Role details
                                </h4>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    Update the role label while keeping permissions
                                    organized and easy to review.
                                </p>

                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Role name
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-400 dark:focus:bg-slate-800 dark:focus:ring-amber-500/20"
                                        placeholder="Enter role name"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                                <h4 className="text-lg font-semibold">
                                    Quick summary
                                </h4>
                                <p className="mt-1 text-sm text-slate-300 dark:text-slate-400">
                                    Changes here update this role's permissions
                                    immediately after saving.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
                                        {data.permissions.length} selected
                                    </span>
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
                                        {Object.keys(groupedPermissions).length} groups
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-700 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        Permissions
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        Search permissions, toggle all, or refine
                                        access by section.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search permissions..."
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:bg-slate-800 dark:focus:ring-sky-500/20 sm:w-64"
                                    />
                                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={allPermissionsSelected}
                                            onChange={handleToggleAllPermissions}
                                            className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                        />
                                        <span>Toggle all permissions</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                    Showing {visiblePermissionCount} permissions
                                </span>
                                {normalizedSearch && (
                                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                        Filter: {deferredSearch}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {visibleGroupedPermissions.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                                        No permissions match your search.
                                    </div>
                                )}

                                {visibleGroupedPermissions.map(([resource, perms]) => (
                                    <fieldset
                                        key={resource}
                                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
                                    >
                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <legend className="text-base font-semibold capitalize text-slate-900 dark:text-slate-100">
                                                {resource}
                                            </legend>
                                            <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                                                <input
                                                    type="checkbox"
                                                    checked={perms.every((p) =>
                                                        data.permissions.includes(
                                                            p.name
                                                        )
                                                    )}
                                                    onChange={() =>
                                                        handleCategorySelectAll(
                                                            resource,
                                                            perms
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                                />
                                                <span>Select all in {resource}</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            {perms.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                                                        data.permissions.includes(
                                                            permission.name
                                                        )
                                                            ? "border-amber-300 bg-amber-50 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10"
                                                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={permission.name}
                                                        checked={data.permissions.includes(
                                                            permission.name
                                                        )}
                                                        onChange={handleCheckboxChange}
                                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900 capitalize dark:text-slate-100">
                                                            {permission.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Grants {permission.name} access
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>

                            {errors.permissions && (
                                <p className="mt-4 text-sm text-red-500">
                                    {errors.permissions}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="edit-button px-6 py-2.5"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
