import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = ({ permissions }) => {
    const { data, setData, post, errors } = useForm({
        name: "",
        permissions: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("role.store"));
    };

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

    const handleCategorySelectAll = (resource, perms) => {
        const allSelected = perms.every((p) => data.permissions.includes(p.name));
        if (allSelected) {
            setData(
                "permissions",
                data.permissions.filter(
                    (name) => !perms.some((p) => p.name === name)
                )
            );
        } else {
            const namesToAdd = perms.map((p) => p.name);
            const newPermissions = Array.from(
                new Set([...data.permissions, ...namesToAdd])
            );
            setData("permissions", newPermissions);
        }
    };

    const groupedPermissions = permissions.reduce((groups, permission) => {
        const parts = permission.name.split(" ");
        const resource = parts.slice(1).join(" ");
        if (!groups[resource]) groups[resource] = [];
        groups[resource].push(permission);
        return groups;
    }, {});

    return (
        <AuthenticatedLayout title="Create Role">
            <CreatePageLayout
                title="Create Role"
                description="Create a role with a focused permission set so employees only see and perform the actions that match their responsibilities."
                backRoute="roles.index"
                meta={[
                    { label: "Module", value: "Access control" },
                    {
                        label: "Strategy",
                        value: "Least-privilege permissions",
                    },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Permission Strategy"
                        items={[
                            {
                                title: "Keep roles job-based",
                                description:
                                    "Create roles around real responsibilities like cashier, manager, or warehouse staff.",
                            },
                            {
                                title: "Avoid over-granting",
                                description:
                                    "Fewer permissions reduce mistakes and make audits much easier later.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CreateSectionCard
                        title="Role Identity"
                        description="Give the role a clear, recognizable name that maps cleanly to your team structure."
                    >
                        <div className="max-w-2xl field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                    Role name
                                </legend>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter role name"
                                />
                            </fieldset>
                            {errors.name ? <p className="field-error">{errors.name}</p> : null}
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Permissions"
                        description="Choose only the permissions this role needs. You can bulk-select by module or fine-tune action by action."
                        footer={
                            <div className="flex justify-end">
                                <button type="submit" className="create-button">
                                    Save role
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                <div
                                    key={resource}
                                    className="rounded-[20px] border border-border bg-background/70 p-4"
                                >
                                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold capitalize text-foreground">
                                                {resource}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage who can access and operate this module.
                                            </p>
                                        </div>

                                        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                                            <input
                                                type="checkbox"
                                                checked={perms.every((p) =>
                                                    data.permissions.includes(p.name)
                                                )}
                                                onChange={() =>
                                                    handleCategorySelectAll(
                                                        resource,
                                                        perms
                                                    )
                                                }
                                            />
                                            Select all
                                        </label>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {perms.map((permission) => (
                                            <label
                                                key={permission.id}
                                                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={permission.name}
                                                    checked={data.permissions.includes(
                                                        permission.name
                                                    )}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <span className="capitalize">
                                                    {permission.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {errors.permissions ? (
                                <p className="field-error">{errors.permissions}</p>
                            ) : null}
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
