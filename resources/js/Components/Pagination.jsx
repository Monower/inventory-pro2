import { Link } from "@inertiajs/react";

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
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-700"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
};

export default Pagination;
