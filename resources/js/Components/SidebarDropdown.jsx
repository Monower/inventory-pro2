import { useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

export default function SidebarDropdown({
    title,
    icon,
    children,
    active = false,
    defaultOpen = false,
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        setIsOpen(defaultOpen);
    }, [defaultOpen]);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div>
            <button
                onClick={toggleDropdown}
                className={
                    "flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 " +
                    (active
                        ? "border border-amber-200 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                        : "border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900")
                }
            >
                {icon && <span className="mr-3">{icon}</span>}
                <span className="sidebar-text flex-1">{title}</span>
                <BiChevronDown
                    className={
                        "h-5 w-5 transition-transform duration-200 " +
                        (isOpen ? "rotate-180" : "")
                    }
                />
            </button>

            {isOpen && (
                <div className="ml-6 mt-2 border-l border-slate-200 pl-4 dark:border-slate-800">
                    <div className="space-y-2">{children}</div>
                </div>
            )}
        </div>
    );
}
