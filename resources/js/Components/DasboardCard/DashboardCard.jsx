const DashboardCard = ({ heading, title, image }) => {
    return (
        <div className="w-[23%] flex flex-col gap-2 items-center bg-white p-4 rounded-lg">
            <img src="/images/demo_image.jpg" alt="" className="w-16 h-16 rounded-full" />
            <p className="text-[14px] text-gray-500">100</p>
            <p className="text-20 text-gray-800">সর্বমোট প্রোডাক্টের সংখ্যা</p>
        </div>
    );
};

export default DashboardCard;
