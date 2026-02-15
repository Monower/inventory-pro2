import { useState, useEffect } from "react";
import { Info, X } from 'lucide-react';

const Alert = ({ flash }) => {
    // console.log("inside flash", flash);
    const [visible, setVisible] = useState(true);

    // console.log("visible, flash?.success, flash?.error", visible, flash?.success, flash?.error);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setVisible(false);
    //     }, 3000); // auto disappear after 4 seconds

    //     return () => clearTimeout(timer); // cleanup on unmount
    // }, []);

    if (!visible || (!flash?.success && !flash?.error)) return null;

    return (
        <div
            className={`relative rounded-lg py-5 px-6 mb-4 text-base flex items-center justify-between ${
                flash?.success
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
            }`}
        >
            {/* Message */}
            <div className="flex items-center gap-2">
                <Info />
                {flash.success ?? flash.error}
            </div>

            {/* Close button */}
            <button
                onClick={() => setVisible(false)}
                className="text-lg font-bold leading-none hover:text-gray-800"
                aria-label="Close alert"
            >
                <X />
            </button>
        </div>
    );
};

export default Alert;
