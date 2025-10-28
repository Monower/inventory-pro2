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


const DashboardCard = ({ heading, title, icon }) => {
    const Icon = icons[icon] || FiBox; // fallback to FiBox if not found

    return (
        <div className="w-full flex flex-col gap-2 items-center bg-card p-4 rounded-lg border shadow-sm">
            <Icon className="text-4xl text-primary" />
            <p className="text-[14px] text-primary">{ heading }</p>
            <p className="text-20 text-primary">{ title }</p>
        </div>
    );
};

export default DashboardCard;