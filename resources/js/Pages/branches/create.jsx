import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = () => {
    const { data, setData, post, processing, errors, transform } = useForm({
        name: "",
        code: "",
        phone: "",
        email: "",
        address: "",
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        transform((payload) => ({
            ...payload,
            is_active: Boolean(payload.is_active),
        }));
        post(route("branch.store"));
    };

    return (
        <AuthenticatedLayout title="Create Branch">
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"branches.index"} />
                    <h3 className="heading">Create Branch</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 grid grid-cols-1 gap-2 lg:grid-cols-3">
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Name</label>
                                </legend>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="custom-input"
                                    placeholder="Branch name"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.name}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Code</label>
                                </legend>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData("code", e.target.value.toUpperCase())}
                                    className="custom-input"
                                    placeholder="Example: DHAKA-1"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.code}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label>Phone</label>
                                </legend>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData("phone", e.target.value)}
                                    className="custom-input"
                                    placeholder="Branch phone"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.phone}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label>Email</label>
                                </legend>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className="custom-input"
                                    placeholder="Branch email"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.email}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label>Status</label>
                                </legend>
                                <select
                                    value={data.is_active ? "1" : "0"}
                                    onChange={(e) => setData("is_active", e.target.value === "1")}
                                    className="custom-input"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </fieldset>
                            <small className="text-destructive">{errors.is_active}</small>
                        </div>
                        <div className="lg:col-span-3">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label>Address</label>
                                </legend>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                    className="custom-input resize-none"
                                    rows={3}
                                    placeholder="Branch address"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.address}</small>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="create-button">
                            {processing ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
