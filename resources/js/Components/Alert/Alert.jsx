const Alert = ({flash}) => {
    return (
        <div
            className={
                `rounded-lg py-5 px-6 mb-4 text-base ` + (flash?.success
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700")
            }
        >
            {flash.success ?? flash.error}
        </div>
    );
};

export default Alert;
