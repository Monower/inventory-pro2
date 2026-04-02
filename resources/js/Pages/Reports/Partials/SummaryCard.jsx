const SummaryCard = ({ label, value, tone = "default" }) => {
    const toneClass =
        tone === "positive"
            ? "text-emerald-600 dark:text-emerald-400"
            : tone === "negative"
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-900 dark:text-slate-100";

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className={`mt-3 text-2xl font-semibold ${toneClass}`}>{value}</p>
        </div>
    );
};

export default SummaryCard;
