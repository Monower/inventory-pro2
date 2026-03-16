import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

const IndexFilters = ({
    routeName,
    initialQuery = "",
    placeholder = "Search...",
    className = "",
    extraParams = {},
}) => {
    const [query, setQuery] = useState(initialQuery);
    const isFirstRender = useRef(true);
    const inputRef = useRef(null);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route(routeName),
                { ...extraParams, q: query || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [extraParams, query, routeName]);

    const clearSearch = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div className={`w-full ${className}`}>
            <label htmlFor={`${routeName}-search`} className="sr-only">
                Search
            </label>
            <div className="w-full max-w-lg rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="text-[hsl(var(--muted-foreground))]">
                        <Search className="h-4 w-4" />
                    </div>

                    <input
                        id={`${routeName}-search`}
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape" && query) {
                                clearSearch();
                            }
                        }}
                        placeholder={placeholder}
                        className="custom-input p-0"
                        autoComplete="off"
                    />

                    {query ? (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="inline-flex items-center justify-center rounded-md p-1 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                            aria-label="Clear search"
                            title="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default IndexFilters;
