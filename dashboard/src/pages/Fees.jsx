import { useState } from "react";
import PageHeading from "@/layout/PageHeading";

import OverviewTab from "@/components/fees/OverviewTab";
import FeeStructuresTab from "@/components/fees/FeeStructuresTab";
import StudentFeesTab from "@/components/fees/StudentFeesTab";
import TransactionsTab from "@/components/fees/TransactionsTab";

export default function Fees() {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "structures", label: "Fee Structures" },
        { id: "fees", label: "Student Invoices" },
        { id: "transactions", label: "Transactions Log" },
    ];

    return (
        <div className="space-y-6">
            <PageHeading
                title="Fees Management"
                description="Manage academic year fee structures, generate student invoices, allocate discounts, and track billing payments."
            />

            {/* Navigation Tabs */}
            <div className="border-b border-border bg-card rounded-t-xl overflow-hidden px-2 pt-2 border flex gap-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 text-xs font-bold transition-all duration-300 relative border-b-2 cursor-pointer ${
                                isActive
                                    ? "text-primary border-primary font-black"
                                    : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content panels */}
            <div className="transition-all duration-300">
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "structures" && <FeeStructuresTab />}
                {activeTab === "fees" && <StudentFeesTab />}
                {activeTab === "transactions" && <TransactionsTab />}
            </div>
        </div>
    );
}
