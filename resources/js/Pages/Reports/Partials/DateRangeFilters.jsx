import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";

const DateRangeFilters = ({
    routeName,
    filters,
    extra = {},
    buttonLabel = "Apply",
}) => {
    const [form, setForm] = useState({
        from_date: filters?.from_date || "",
        to_date: filters?.to_date || "",
    });

    useEffect(() => {
        setForm({
            from_date: filters?.from_date || "",
            to_date: filters?.to_date || "",
        });
    }, [filters?.from_date, filters?.to_date]);

    const submit = (event) => {
        event.preventDefault();

        router.get(
            route(routeName),
            {
                ...extra,
                from_date: form.from_date || undefined,
                to_date: form.to_date || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:flex-row lg:items-end"
        >
            <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                    From date
                </label>
                <input
                    type="date"
                    value={form.from_date}
                    onChange={(event) =>
                        setForm((current) => ({
                            ...current,
                            from_date: event.target.value,
                        }))
                    }
                    className="custom-input"
                />
            </div>
            <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                    To date
                </label>
                <input
                    type="date"
                    value={form.to_date}
                    onChange={(event) =>
                        setForm((current) => ({
                            ...current,
                            to_date: event.target.value,
                        }))
                    }
                    className="custom-input"
                />
            </div>
            <button type="submit" className="create-button lg:min-w-32">
                {buttonLabel}
            </button>
        </form>
    );
};

export default DateRangeFilters;
