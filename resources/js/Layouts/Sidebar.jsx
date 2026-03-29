import Menu from "@/Components/Menu/Menu";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const Sidebar = ({ url, collapsed = false, onToggle }) => {
    return (
        <aside
            className={`sticky top-20 hidden h-[calc(100vh-5rem)] shrink-0 px-4 pb-4 transition-all duration-300 lg:block ${
                collapsed ? "w-[96px]" : "w-[290px]"
            }`}
        >
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                    <div
                        className={`flex items-center ${
                            collapsed ? "justify-center" : "justify-between"
                        }`}
                    >
                        {!collapsed && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                                    Navigation
                                </p>
                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Control Center
                                </p>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onToggle}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? (
                                <PanelLeftOpen size={18} />
                            ) : (
                                <PanelLeftClose size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {!collapsed ? (
                    <div className="flex-1 overflow-y-auto px-3 py-4">
                        <Menu url={url} />
                    </div>
                ) : (
                    <div className="flex flex-1 items-start justify-center px-3 py-4">
                        <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
                            Menu
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
