import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ role, permissions }) => {
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

    return (
        <AuthenticatedLayout>
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"roles.index"} />
                    <h3 className="text-xl font-semibold">Edit Role</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Role name */}
                    <div className="mb-4">
                        <fieldset className="border border-gray-300 bg-white p-2 rounded">
                            <legend className="text-sm mx-2">
                                <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                    Role name
                                </label>
                            </legend>
                            <input
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm p-0"
                                placeholder="Enter role name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </fieldset>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">Permissions:</h3>

                    {/* Grouped permissions */}
                    <div className="mb-4">
                        {Object.entries(groupedPermissions).map(
                            ([resource, perms]) => (
                                <fieldset
                                    key={resource}
                                    className="border border-gray-300 bg-white p-2 rounded mb-3"
                                >
                                    <legend className="text-sm font-semibold mx-2 capitalize">
                                        {resource}
                                    </legend>

                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        {/* "Select All" checkbox */}
                                        <label className="flex items-center space-x-2 font-semibold">
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
                                            />
                                            <span>Select All</span>
                                        </label>

                                        {/* Individual permission checkboxes */}
                                        {perms.map((permission) => (
                                            <label
                                                key={permission.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={permission.name}
                                                    checked={data.permissions.includes(
                                                        permission.name
                                                    )}
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                />
                                                <span className="capitalize">
                                                    {permission.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            )
                        )}
                        {errors.permissions && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.permissions}
                            </p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-1 px-2 rounded"
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
