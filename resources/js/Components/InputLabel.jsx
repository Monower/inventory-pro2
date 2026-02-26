export default function InputLabel({
    value,
    className = "",
    children,
    required = false,
    hint,
    ...props
}) {
    return (
        <label {...props} className={`block text-sm font-medium text-primary ${className}`}>
            <span>{value ? value : children}</span>
            {required && <span className="ml-1 text-destructive">*</span>}
            {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
        </label>
    );
}
