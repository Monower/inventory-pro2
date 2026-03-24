import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowRightLeft, Building2, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";

const Workspace = ({ branchOptions = [], activeBranch, assignedBranch }) => {
    const { auth } = usePage().props;
    const [query, setQuery] = useState("");
    const [processingBranchId, setProcessingBranchId] = useState(null);
    const canViewBranchDirectory = auth.user?.permissions?.includes("view branch");

    const filteredBranches = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return branchOptions;
        }

        return branchOptions.filter((branch) =>
            [branch.name, branch.code, branch.phone, branch.email, branch.address]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery))
        );
    }, [branchOptions, query]);

    const handleSwitch = (branchId) => {
        setProcessingBranchId(branchId);
        router.patch(route("branches.switch"), {
            branch_id: branchId,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingBranchId(null),
        });
    };

    const totalBranches = branchOptions.length;

    return (
        <AuthenticatedLayout title="Branch Workspace">
            <Head title="Branch Workspace" />

            <section className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Branch Workspace
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Switch operating branch from a dedicated workspace
                            </h1>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Review the branches available to this account, see which one is
                                active right now, and change the working branch when your plan allows it.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-background px-4 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Active branch
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {activeBranch?.name || "No active branch"}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {activeBranch?.code || "No branch code"}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background px-4 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Accessible branches
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {totalBranches}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {assignedBranch
                                        ? `Assigned branch: ${assignedBranch.name}`
                                        : "Multi-branch access is available for this account."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">
                                Available branches
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Search and switch with more context than the old navbar selector.
                            </p>
                        </div>

                        <div className="relative w-full max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by branch name, code, phone, or email"
                                className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground"
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {filteredBranches.map((branch) => {
                            const isCurrent = String(activeBranch?.id) === String(branch.id);

                            return (
                                <article
                                    key={branch.id}
                                    className={`rounded-3xl border p-5 transition ${
                                        isCurrent
                                            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                                            : "border-border bg-background/80"
                                    }`}
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {branch.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Code: {branch.code}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                                <p>{branch.phone || "No phone added"}</p>
                                                <p>{branch.email || "No email added"}</p>
                                                <p className="sm:col-span-2">
                                                    {branch.address || "No address added"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start gap-2 sm:items-end">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                                    isCurrent
                                                        ? "border border-emerald-300 bg-white text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                                                        : "border border-border bg-card text-muted-foreground"
                                                }`}
                                            >
                                                {isCurrent ? "Current workspace" : "Available"}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => handleSwitch(branch.id)}
                                                disabled={isCurrent || processingBranchId !== null}
                                                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                                    isCurrent
                                                        ? "cursor-default border border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
                                                        : "border border-border bg-card text-foreground hover:border-foreground/15 hover:bg-muted"
                                                }`}
                                            >
                                                {isCurrent ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowRightLeft className="h-4 w-4" />
                                                        {processingBranchId === branch.id ? "Switching..." : "Switch Here"}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {!filteredBranches.length ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/70 p-6 text-center text-sm text-muted-foreground">
                            No branches matched your search.
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                    {canViewBranchDirectory ? (
                        <Link
                            href={route("branches.index")}
                            className="inline-flex items-center rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                        >
                            View Branch Directory
                        </Link>
                    ) : null}
                    <Link
                        href={route("settings.licensing")}
                        className="inline-flex items-center rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        Manage Plan & License
                    </Link>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Workspace;
