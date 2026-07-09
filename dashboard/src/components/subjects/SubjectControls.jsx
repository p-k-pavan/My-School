import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SubjectControls({
    searchQuery,
    setSearchQuery,
}) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search subjects by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background w-full"
                />
            </div>

        </div>
    );
}
