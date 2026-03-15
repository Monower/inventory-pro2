import {
    CircleDollarSign,
    HandCoins,
    ReceiptText,
    TrendingUp,
    Wallet,
} from "lucide-react";

const icons = {
    revenue: TrendingUp,
    income: Wallet,
    expense: ReceiptText,
    payable: HandCoins,
    receivable: CircleDollarSign,
};

const tones = {
    revenue: "from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400",
    income: "from-sky-500/15 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-400",
    expense: "from-rose-500/15 via-rose-500/5 to-transparent text-rose-600 dark:text-rose-400",
    payable: "from-amber-500/15 via-amber-500/5 to-transparent text-amber-600 dark:text-amber-400",
    receivable: "from-violet-500/15 via-violet-500/5 to-transparent text-violet-600 dark:text-violet-400",
};

const DashboardCard = ({ value, title, icon, subtitle }) => {
    const Icon = icons[icon] || TrendingUp;
    const tone = tones[icon] || tones.revenue;

    return (
        <div className={`w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tone} bg-card p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">
                        {value}
                    </p>
                    {subtitle ? (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
