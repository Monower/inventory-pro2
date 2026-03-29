import { FiBox } from "react-icons/fi";
import { FaProductHunt } from "react-icons/fa";
import { CiDollar } from "react-icons/ci";
import { LuTruck } from "react-icons/lu";
import { FaRegUserCircle } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { MdOutlineMoneyOff } from "react-icons/md";

const icons = {
    FiBox: FiBox,
    CiDollar: CiDollar,
    FaProductHunt: FaProductHunt,
    LuTruck: LuTruck,
    FaRegUserCircle: FaRegUserCircle,
    FaUserFriends: FaUserFriends,
    FaSackDollar: FaSackDollar,
    MdOutlineMoneyOff: MdOutlineMoneyOff
};

const iconThemes = {
    FiBox: "from-amber-400/20 via-orange-400/10 to-transparent text-amber-600 dark:text-amber-300",
    FaProductHunt: "from-cyan-400/20 via-sky-400/10 to-transparent text-cyan-600 dark:text-cyan-300",
    CiDollar: "from-emerald-400/20 via-green-400/10 to-transparent text-emerald-600 dark:text-emerald-300",
    LuTruck: "from-violet-400/20 via-indigo-400/10 to-transparent text-violet-600 dark:text-violet-300",
    FaRegUserCircle: "from-pink-400/20 via-rose-400/10 to-transparent text-pink-600 dark:text-pink-300",
    FaUserFriends: "from-blue-400/20 via-sky-400/10 to-transparent text-blue-600 dark:text-blue-300",
    FaSackDollar: "from-lime-400/20 via-emerald-400/10 to-transparent text-lime-600 dark:text-lime-300",
    MdOutlineMoneyOff: "from-red-400/20 via-rose-400/10 to-transparent text-red-600 dark:text-red-300",
};

const DashboardCard = ({ heading, title, icon }) => {
    const Icon = icons[icon] || FiBox; // fallback to FiBox if not found
    const theme =
        iconThemes[icon] ||
        "from-slate-400/20 via-slate-300/10 to-transparent text-slate-600 dark:text-slate-300";

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 opacity-80" />

            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        {heading}
                    </p>
                </div>

                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${theme}`}
                >
                    <Icon className="text-3xl" />
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                    Live overview
                </span>
                <span className="transition group-hover:text-slate-700 dark:group-hover:text-slate-200">
                    Updated from current data
                </span>
            </div>
        </div>
    );
};

export default DashboardCard;
