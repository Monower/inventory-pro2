import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const Index = ({ settings }) => {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        company_name: settings?.company_name || "",
        logo: null,
    });

    const [logoPreview, setLogoPreview] = useState(settings?.logo_url || null);
    const fileInputRef = useRef(null);
    const [notification, setNotification] = useState(null);

    // Success notification
    useEffect(() => {
        if (wasSuccessful) {
            setNotification({ type: "success", message: "Settings updated successfully!" });
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [wasSuccessful]);

    // Error notification
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setNotification({ type: "error", message: "Please fix the errors in the form." });
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("logo", file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        setData("logo", null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("company_name", data.company_name);
        if (data.logo) formData.append("logo", data.logo);

        post(route("settings.update"), formData, { forceFormData: true });
    };

    return (
        <AuthenticatedLayout>
            <section className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">General Settings</h3>
                </div>

                {/* Notification */}
                {notification && (
                    <div
                        className={`mb-4 p-3 rounded ${
                            notification.type === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {notification.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={(e) => setData("company_name", e.target.value)}
                            className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 placeholder:text-sm"
                            placeholder="Enter company name"
                            required
                        />
                        {errors.company_name && (
                            <p className="text-sm text-red-500 mt-1">{errors.company_name}</p>
                        )}
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Logo
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 
                                       file:mr-4 file:py-2 file:px-4 
                                       file:rounded-lg file:border-0 
                                       file:text-sm file:font-semibold 
                                       file:bg-blue-50 file:text-blue-600 
                                       hover:file:bg-blue-100"
                        />
                        {errors.logo && (
                            <p className="text-sm text-red-500 mt-1">{errors.logo}</p>
                        )}

                        {/* Preview / Current Logo */}
                        {logoPreview ? (
                            <div className="relative mt-4 w-32">
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="rounded-lg shadow-md w-full h-auto"
                                />
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : settings?.logo_url ? (
                            <div className="mt-4 w-32">
                                <img
                                    src={settings.logo_url}
                                    alt="Current Logo"
                                    className="rounded-lg shadow-md w-full h-auto"
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
