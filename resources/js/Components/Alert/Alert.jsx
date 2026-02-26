import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const Alert = ({ flash, autoHideMs = 4500 }) => {
    const [visible, setVisible] = useState(true);
    const hasSuccess = Boolean(flash?.success);
    const hasError = Boolean(flash?.error);

    useEffect(() => {
        setVisible(true);
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (!autoHideMs || (!hasSuccess && !hasError)) {
            return;
        }

        const timer = setTimeout(() => {
            setVisible(false);
        }, autoHideMs);

        return () => clearTimeout(timer);
    }, [autoHideMs, hasSuccess, hasError, flash?.success, flash?.error]);

    if (!visible || (!hasSuccess && !hasError)) return null;

    const isSuccess = hasSuccess;

    return (
        <div
            className={`relative mb-4 flex items-start justify-between rounded-lg border px-4 py-3 text-sm ${
                isSuccess
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
            }`}
            role="alert"
        >
            <div className="flex items-start gap-2 pr-8">
                {isSuccess ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>{flash.success ?? flash.error}</div>
            </div>

            <button
                type="button"
                onClick={() => setVisible(false)}
                className="absolute right-2 top-2 rounded p-1 hover:bg-black/5"
                aria-label="Close alert"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Alert;
