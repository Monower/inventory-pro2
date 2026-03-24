const ListPageLayout = ({
    title,
    description,
    actions = null,
    stats = [],
    children,
}) => {
    return (
        <section className="space-y-6">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-background via-background to-secondary/50 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_55%)]" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            {title}
                        </h1>
                        {description ? (
                            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
                </div>

                {stats.length ? (
                    <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-border/80 bg-background/90 px-4 py-3 shadow-sm backdrop-blur"
                            >
                                <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                    {stat.label}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-foreground">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="space-y-6">{children}</div>
        </section>
    );
};

export default ListPageLayout;
