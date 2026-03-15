import { Link } from "@inertiajs/react";

const decodeLabel = (label) =>
    String(label)
        .replace(/&laquo;/g, "\u00ab")
        .replace(/&raquo;/g, "\u00bb")
        .replace(/&amp;/g, "&")
        .replace(/<[^>]*>/g, "")
        .trim();

const Pagination = ({ links = [] }) => {
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        preserveScroll
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                    >
                        {decodeLabel(link.label)}
                    </Link>
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded border border-border px-3 py-1 text-sm text-muted-foreground"
                    >
                        {decodeLabel(link.label)}
                    </span>
                )
            )}
        </div>
    );
};

export default Pagination;
