const CreateSectionCard = ({ title, description, children, footer = null }) => {
    return (
        <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_48px_-32px_rgba(15,23,42,0.45)] sm:p-6">
            {(title || description) && (
                <div className="mb-5 flex flex-col gap-2 border-b border-border/80 pb-4">
                    {title ? (
                        <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
                            {title}
                        </h2>
                    ) : null}
                    {description ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>
            )}

            <div className="space-y-5">{children}</div>

            {footer ? (
                <div className="mt-6 border-t border-border/80 pt-4">{footer}</div>
            ) : null}
        </div>
    );
};

export default CreateSectionCard;
