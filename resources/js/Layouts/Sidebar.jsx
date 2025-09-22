import { useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import Menu from "@/Components/Menu/Menu";

const Sidebar = ({ url }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`hidden lg:block relative bg-white shadow-md flex flex-col h-screen transition-all duration-300 ${
                collapsed ? "min-w-[10px] max-w-[10px]" : "min-w-[250px] max-w-[250px]"
            }`}
        >
            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-6 bg-gray-200 rounded-full p-1 shadow hover:bg-gray-300 transition"
            >
                {collapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
            </button>

            {/* Sidebar Content */}
            {!collapsed && (
                <div className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="space-y-1">
                        <Menu url={url} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
