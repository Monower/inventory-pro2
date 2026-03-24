import { Link, usePage } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";
import {
    ArrowRightLeft,
    BriefcaseBusiness,
    CircleDollarSign,
    ClipboardList,
    CreditCard,
    FolderKanban,
    LayoutDashboard,
    PackagePlus,
    Settings2,
    ShieldCheck,
    ShoppingCart,
    Truck,
    TicketPercent,
    Users,
} from "lucide-react";

const MenuSection = ({ title, children }) => (
    <div className="space-y-1 pt-3 first:pt-0">
        <div className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
            {title}
        </div>
        <div className="space-y-1">{children}</div>
    </div>
);

const PlanBadge = ({ label }) => (
    <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
    </span>
);

const Menu = ({ url }) => {
    const { auth, license, planCatalog = [] } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const currentQueryString = url.includes("?") ? url.split("?")[1] : "";
    const currentQuery = new URLSearchParams(currentQueryString);
    const currentPath =
        url.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

    const isPath = (path) => currentPath === path;
    const isPathPrefix = (prefix) =>
        currentPath === prefix || currentPath.startsWith(`${prefix}/`);

    const linkClass = (active) =>
        "flex items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-200 " +
        (active
            ? "border-violet-200 bg-violet-100 text-violet-600 dark:border-violet-700/60 dark:bg-violet-900/40 dark:text-violet-300"
            : "border-transparent text-primary hover:bg-muted");

    const subLinkClass = (active) =>
        "menu-sublink block rounded-md px-2 py-1.5 transition-colors duration-200 " +
        (active
            ? "bg-violet-100 font-medium text-violet-600 dark:bg-violet-900/40 dark:text-violet-300"
            : "text-muted-foreground hover:bg-muted hover:text-foreground");

    const dashboardActive = isPath("/dashboard");
    const catalogActive =
        isPathPrefix("/products") ||
        isPathPrefix("/categories") ||
        isPathPrefix("/sub-categories") ||
        isPathPrefix("/attributes") ||
        isPathPrefix("/attribute-values") ||
        isPathPrefix("/stock-ledgers");
    const inventoryActive =
        isPathPrefix("/purchases") || isPathPrefix("/stock-transfers");
    const supplierActive = isPathPrefix("/suppliers");
    const financeActive =
        isPathPrefix("/banks") ||
        isPathPrefix("/transactions") ||
        isPathPrefix("/coupons");
    const peopleActive =
        isPathPrefix("/employees") ||
        isPathPrefix("/employee") ||
        isPathPrefix("/salaries") ||
        isPathPrefix("/advance-salaries");
    const branchActive =
        isPathPrefix("/branches") || isPathPrefix("/branch");
    const customerActive =
        isPathPrefix("/customers") || isPathPrefix("/customer");
    const posActive = isPath("/orders/create");
    const orderView = currentQuery.get("view") || "all";
    const ordersActive = isPathPrefix("/orders") && !isPath("/orders/create");
    const canViewSales = permissions.includes("view order");
    const canViewPos = permissions.includes("create order");
    const canViewCustomer =
        permissions.includes("view customer") ||
        permissions.includes("create customer");
    const canViewCatalog =
        permissions.includes("view product") ||
        permissions.includes("create product") ||
        permissions.includes("view category") ||
        permissions.includes("view subcategory") ||
        permissions.includes("view attribute") ||
        permissions.includes("view attribute value") ||
        permissions.includes("view stock ledger") ||
        permissions.includes("view stock transfer") ||
        permissions.includes("view supplier");
    const canViewInventory =
        permissions.includes("view purchase") ||
        permissions.includes("view stock transfer") ||
        permissions.includes("create stock transfer");
    const canViewFinance =
        permissions.includes("view transaction") ||
        permissions.includes("view bank") ||
        permissions.includes("view coupon");
    const canViewPeople =
        permissions.includes("view staff") ||
        permissions.includes("view salary") ||
        permissions.includes("view advance salary");
    const canManageBranchNavigation =
        permissions.includes("view branch") || Boolean(auth.user);
    const canViewAdministration =
        canManageBranchNavigation ||
        permissions.includes("view role") ||
        permissions.includes("view settings") ||
        permissions.includes("edit profile");
    const minimumPlanByFeature = planCatalog.reduce((carry, plan) => {
        (plan.included_features || []).forEach((feature) => {
            const current = carry[feature.key];

            if (!current || (plan.rank || 0) < (current.rank || 0)) {
                carry[feature.key] = {
                    label: plan.label,
                    rank: plan.rank,
                };
            }
        });

        return carry;
    }, {});
    const planRankByLabel = planCatalog.reduce((carry, plan) => {
        carry[plan.label] = plan.rank || 0;
        return carry;
    }, {});
    const currentPlanRank = license?.is_active
        ? (planRankByLabel[license?.plan_label] || 0)
        : 0;
    const shouldShowUpgradeBadge = (planLabel) => {
        if (!license?.is_active || !planLabel) {
            return false;
        }

        const requiredRank = planRankByLabel[planLabel] || 0;

        return requiredRank > currentPlanRank;
    };
    const renderUpgradeBadge = (planLabel) =>
        shouldShowUpgradeBadge(planLabel) ? <PlanBadge label={planLabel} /> : null;

    return (
        <div className="space-y-3">
            {permissions.includes("view dashboard") && (
                <MenuSection title="Overview">
                    <Link
                        href="/dashboard"
                        className={linkClass(dashboardActive)}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                </MenuSection>
            )}

            {canViewSales && (
                <MenuSection title="Order Section">
                    {permissions.includes("view order") && (
                        <SidebarDropdown
                            title="Orders"
                            icon={<ShoppingCart size={18} />}
                            active={ordersActive}
                            defaultOpen={ordersActive}
                        >
                            <div className="mt-2 flex flex-col space-y-2">
                                <Link
                                    href="/orders"
                                    className={subLinkClass(
                                        isPath("/orders") && orderView === "all"
                                    )}
                                >
                                    All
                                </Link>
                                <Link
                                    href="/orders?view=completed"
                                    className={subLinkClass(
                                        isPath("/orders") &&
                                            orderView === "completed"
                                    )}
                                >
                                    Completed
                                </Link>
                                <Link
                                    href="/orders?view=refunded"
                                    className={subLinkClass(
                                        isPath("/orders") &&
                                            orderView === "refunded"
                                    )}
                                >
                                    Refunded
                                </Link>
                            </div>
                        </SidebarDropdown>
                    )}
                </MenuSection>
            )}

            {canViewPos && (
                <MenuSection title="POS section">
                    <Link
                        href="/orders/create"
                        className={linkClass(posActive)}
                    >
                        <CircleDollarSign size={18} />
                        <span>New Sale</span>
                    </Link>
                </MenuSection>
            )}

            {canViewCustomer && (
                <MenuSection title="Customer section">
                    <SidebarDropdown
                        title="Customer"
                        icon={<Users size={18} />}
                        active={customerActive}
                        defaultOpen={customerActive}
                    >
                        <div className="mt-2 flex flex-col space-y-2">
                            {permissions.includes("create customer") && (
                                <Link
                                    href="/customer/create"
                                    className={subLinkClass(
                                        isPath("/customer/create")
                                    )}
                                >
                                    Add customer
                                </Link>
                            )}
                            {permissions.includes("view customer") && (
                                <Link
                                    href="/customers"
                                    className={subLinkClass(
                                        isPath("/customers")
                                    )}
                                >
                                    Customer list
                                </Link>
                            )}
                        </div>
                    </SidebarDropdown>
                </MenuSection>
            )}

            {(canViewCatalog || canViewInventory) && (
                <MenuSection title="Catalog & Inventory">
                    {canViewCatalog && (
                        <SidebarDropdown
                            title="Product Catalog"
                            icon={<FolderKanban size={18} />}
                            active={catalogActive}
                            defaultOpen={catalogActive}
                        >
                            <div className="mt-2 flex flex-col space-y-2">
                                {permissions.includes("view product") && (
                                    <Link
                                        href="/products"
                                        className={subLinkClass(
                                            isPath("/products")
                                        )}
                                    >
                                        Products
                                    </Link>
                                )}
                                {permissions.includes("create product") && (
                                    <Link
                                        href="/products/create"
                                        className={subLinkClass(
                                            isPath("/products/create")
                                        )}
                                    >
                                        Create Product
                                    </Link>
                                )}
                                {permissions.includes("view category") && (
                                    <Link
                                        href="/categories"
                                        className={subLinkClass(
                                            isPathPrefix("/categories")
                                        )}
                                    >
                                        Categories
                                    </Link>
                                )}
                                {permissions.includes("view subcategory") && (
                                    <Link
                                        href="/sub-categories"
                                        className={subLinkClass(
                                            isPathPrefix("/sub-categories")
                                        )}
                                    >
                                        Subcategories
                                    </Link>
                                )}
                                {permissions.includes("view attribute") && (
                                    <Link
                                        href="/attributes"
                                        className={subLinkClass(
                                            isPathPrefix("/attributes")
                                        )}
                                    >
                                        Attributes
                                    </Link>
                                )}
                                {permissions.includes(
                                    "view attribute value"
                                ) && (
                                    <Link
                                        href="/attribute-values"
                                        className={subLinkClass(
                                            isPathPrefix("/attribute-values")
                                        )}
                                    >
                                        Attribute Values
                                    </Link>
                                )}
                            </div>
                        </SidebarDropdown>
                    )}
                    {canViewInventory && (
                        <div className="space-y-1">
                            {permissions.includes("view supplier") && (
                                <Link
                                    href="/suppliers"
                                    className={linkClass(supplierActive)}
                                >
                                    <Truck size={18} />
                                    <span>Suppliers</span>
                                </Link>
                            )}
                            <Link
                                href="/purchases"
                                className={linkClass(inventoryActive)}
                            >
                                <PackagePlus size={18} />
                                <span>Purchases</span>
                            </Link>
                            {permissions.includes("view stock ledger") && (
                                <Link
                                    href="/stock-ledgers"
                                    className={linkClass(isPathPrefix("/stock-ledgers"))}
                                >
                                    <ClipboardList size={18} />
                                    <span className="flex w-full items-center justify-between gap-2">
                                        <span>Stock Ledger</span>
                                        {renderUpgradeBadge(minimumPlanByFeature.stock_ledger?.label || "Advance")}
                                    </span>
                                </Link>
                            )}
                            {permissions.includes("view stock transfer") && (
                                <Link
                                    href="/stock-transfers"
                                    className={linkClass(isPathPrefix("/stock-transfers"))}
                                >
                                    <ArrowRightLeft size={18} />
                                    <span className="flex w-full items-center justify-between gap-2">
                                        <span>Stock Transfers</span>
                                        {renderUpgradeBadge(minimumPlanByFeature.stock_transfers?.label || "Premium")}
                                    </span>
                                </Link>
                            )}
                        </div>
                    )}
                </MenuSection>
            )}

            {canViewFinance && (
                <MenuSection title="Finance">
                    {permissions.includes("view bank") && (
                        <Link
                            href="/banks"
                            className={linkClass(isPathPrefix("/banks"))}
                        >
                            <CreditCard size={18} />
                            <span>Bank Accounts</span>
                        </Link>
                    )}
                    {permissions.includes("view transaction") && (
                        <Link
                            href="/transactions"
                            className={linkClass(isPathPrefix("/transactions"))}
                        >
                            <CircleDollarSign size={18} />
                            <span>Transactions</span>
                        </Link>
                    )}
                    {permissions.includes("view coupon") && (
                        <Link
                            href="/coupons"
                            className={linkClass(isPathPrefix("/coupons"))}
                        >
                            <TicketPercent size={18} />
                            <span className="flex w-full items-center justify-between gap-2">
                                <span>Coupons</span>
                                {renderUpgradeBadge(minimumPlanByFeature.coupons?.label || "Advance")}
                            </span>
                        </Link>
                    )}
                </MenuSection>
            )}

            {canViewPeople && (
                <MenuSection title="People">
                    <SidebarDropdown
                        title="Staff & Payroll"
                        icon={<BriefcaseBusiness size={18} />}
                        active={peopleActive}
                        defaultOpen={peopleActive}
                    >
                        <div className="mt-2 flex flex-col space-y-2">
                            {permissions.includes("view staff") && (
                                <Link
                                    href="/employees"
                                    className={subLinkClass(
                                        isPathPrefix("/employees") ||
                                            isPathPrefix("/employee")
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span>Employees</span>
                                        {renderUpgradeBadge(minimumPlanByFeature.staff_management?.label || "Advance")}
                                    </span>
                                </Link>
                            )}
                            {permissions.includes("view salary") && (
                                <Link
                                    href="/salaries"
                                    className={subLinkClass(
                                        isPathPrefix("/salaries")
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span>Salaries</span>
                                        {renderUpgradeBadge(minimumPlanByFeature.salary_management?.label || "Advance")}
                                    </span>
                                </Link>
                            )}
                            {permissions.includes("view advance salary") && (
                                <Link
                                    href="/advance-salaries"
                                    className={subLinkClass(
                                        isPathPrefix("/advance-salaries")
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span>Advance Salaries</span>
                                        {renderUpgradeBadge(minimumPlanByFeature.advance_salary_management?.label || "Advance")}
                                    </span>
                                </Link>
                            )}
                        </div>
                    </SidebarDropdown>
                </MenuSection>
            )}

            {canViewAdministration && (
                <MenuSection title="Administration">
                    {canManageBranchNavigation && (
                        <SidebarDropdown
                            title="Branches"
                            icon={<BriefcaseBusiness size={18} />}
                            active={branchActive}
                            defaultOpen={branchActive}
                        >
                            <div className="mt-2 flex flex-col space-y-2">
                                <Link
                                    href="/branches/workspace"
                                    className={subLinkClass(
                                        isPath("/branches/workspace")
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span>Branch Workspace</span>
                                        {renderUpgradeBadge(minimumPlanByFeature.branch_switching?.label || "Premium")}
                                    </span>
                                </Link>
                                {permissions.includes("view branch") && (
                                    <Link
                                        href="/branches"
                                        className={subLinkClass(
                                            isPath("/branches")
                                        )}
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span>Branch Directory</span>
                                                {renderUpgradeBadge(minimumPlanByFeature.branches?.label || "Premium")}
                                            </span>
                                        </Link>
                                    )}
                            </div>
                        </SidebarDropdown>
                    )}
                    {permissions.includes("view role") && (
                        <SidebarDropdown
                            title="Access Control"
                            icon={<ShieldCheck size={18} />}
                            active={isPathPrefix("/roles")}
                            defaultOpen={isPathPrefix("/roles")}
                        >
                            <div className="mt-2 flex flex-col space-y-2">
                                {permissions.includes("view role") && (
                                    <Link
                                        href="/roles"
                                        className={subLinkClass(
                                            isPathPrefix("/roles")
                                        )}
                                    >
                                        <span className="flex items-center justify-between gap-2">
                                            <span>Roles</span>
                                            {renderUpgradeBadge(minimumPlanByFeature.role_management?.label || "Advance")}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </SidebarDropdown>
                    )}
                    {(permissions.includes("view settings") ||
                        permissions.includes("edit profile")) && (
                        <SidebarDropdown
                            title="System Settings"
                            icon={<Settings2 size={18} />}
                            active={
                                isPathPrefix("/profile") ||
                                isPathPrefix("/settings")
                            }
                            defaultOpen={
                                isPathPrefix("/profile") ||
                                isPathPrefix("/settings")
                            }
                        >
                            <div className="mt-2 flex flex-col space-y-2">
                                {permissions.includes("edit profile") && (
                                    <Link
                                        href="/profile"
                                        className={subLinkClass(
                                            isPathPrefix("/profile")
                                        )}
                                    >
                                        Profile
                                    </Link>
                                )}
                                {permissions.includes("view settings") && (
                                    <Link
                                        href="/settings"
                                        className={subLinkClass(
                                            isPath("/settings")
                                        )}
                                    >
                                        General Settings
                                    </Link>
                                )}
                                {permissions.includes("view settings") && (
                                    <Link
                                        href="/settings/licensing"
                                        className={subLinkClass(
                                            isPath("/settings/licensing")
                                        )}
                                    >
                                        Plans & Licensing
                                    </Link>
                                )}
                            </div>
                        </SidebarDropdown>
                    )}
                </MenuSection>
            )}
        </div>
    );
};

export default Menu;
