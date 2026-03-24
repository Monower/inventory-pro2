import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = () => {
    const { url } = usePage();
    const searchParams = new URLSearchParams(
        new URL(url, window.location.origin).search
    );
    const { data, setData, post, errors, processing } = useForm({
        name: "",
        paymentMethod: "cash",
        transaction_type: searchParams.get("type") || "",
        source: "",
        amount: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("transaction.store"));
    };

    return (
        <AuthenticatedLayout title="Create Transaction">
            <CreatePageLayout
                title="Create Transaction"
                description="Log a financial transaction with a clear payment method, source, and amount so your income and expense records remain trustworthy."
                backRoute="transactions.index"
                meta={[
                    {
                        label: "Transaction type",
                        value: data.transaction_type || "Manual selection",
                    },
                    { label: "Module", value: "Cash flow tracking" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Entry Guidance"
                        items={[
                            {
                                title: "Use a descriptive name",
                                description:
                                    "Names like rent, courier income, or office expense make reports easier to understand.",
                            },
                            {
                                title: "Match the real payment channel",
                                description:
                                    "Choosing the correct payment method helps reconcile cash, bank, and mobile balances later.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Transaction Details"
                        description="Capture the operational context for this transaction so it stays useful in reporting, reconciliation, and audits."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Create transaction"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Name
                                    </legend>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter transaction name"
                                    />
                                </fieldset>
                                {errors.name ? <p className="field-error">{errors.name}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Payment method
                                    </legend>
                                    <select
                                        name="paymentMethod"
                                        value={data.paymentMethod}
                                        onChange={(e) =>
                                            setData("paymentMethod", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                        <option value="mobileBanking">
                                            Mobile banking
                                        </option>
                                    </select>
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Source
                                    </legend>
                                    <input
                                        type="text"
                                        name="source"
                                        value={data.source}
                                        onChange={(e) => setData("source", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter source name"
                                    />
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Amount
                                    </legend>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={data.amount}
                                        onChange={(e) => setData("amount", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter amount"
                                    />
                                </fieldset>
                                {errors.amount ? (
                                    <p className="field-error">{errors.amount}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
