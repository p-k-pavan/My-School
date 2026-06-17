import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ParentControls({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
}) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border border-border">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone number..."
                    className="pl-9 w-full bg-background"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                <div className="w-40">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="cursor-pointer bg-background">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
