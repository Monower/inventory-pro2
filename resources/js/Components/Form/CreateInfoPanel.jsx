const CreateInfoPanel = ({ title = "Checklist", description, items = [] }) => {
    return (
        <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_48px_-32px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="space-y-2">
                <h2 className="text-base font-semibold tracking-tight text-card-foreground">
                    {title}
                </h2>
                {description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>

            {items.length ? (
                <div className="mt-5 space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-border/80 bg-background/80 p-4"
                        >
                            <div className="text-sm font-semibold text-foreground">
                                {item.title}
                            </div>
                            {item.description ? (
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {item.description}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default CreateInfoPanel;
