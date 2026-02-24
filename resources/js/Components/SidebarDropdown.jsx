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
                    "flex w-full items-center px-4 py-3 rounded-md text-left transition-colors duration-200 " +
                    (active
                        ? "text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-700/60"
                        : "text-primary hover:bg-muted")
                }
            >
                {icon && <span className="mr-2">{icon}</span>}
                <span className="sidebar-text flex-1">{title}</span>
                <BiChevronDown
                    className={
                        "h-5 w-5 transition-transform duration-200 " +
                        (isOpen ? "rotate-180" : "")
                    }
                />
            </button>

            {isOpen && <div className="ml-10 mt-2 space-y-2">{children}</div>}
        </div>
    );
}
