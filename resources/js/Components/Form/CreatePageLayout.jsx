import BackButton from "@/Components/BackButton/BackButton";

const CreatePageLayout = ({
    title,
    description,
    backRoute,
    badge = "Create",
    meta = [],
    aside = null,
    children,
}) => {
    return (
        <section className="space-y-6">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-background via-background to-secondary/50 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_55%)]" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <BackButton url={backRoute} />
                            <span className="inline-flex items-center rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
                                {badge}
                            </span>
                        </div>

                        <div className="max-w-3xl space-y-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {title}
                            </h1>
                            {description ? (
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {meta.length ? (
                        <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                            {meta.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-border/80 bg-background/90 px-4 py-3 shadow-sm backdrop-blur"
                                >
                                    <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                        {item.label}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-foreground">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div
                className={`grid gap-6 ${
                    aside ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1"
                }`}
            >
                <div className="space-y-6">{children}</div>
                {aside ? <div className="space-y-6">{aside}</div> : null}
            </div>
        </section>
    );
};

export default CreatePageLayout;
