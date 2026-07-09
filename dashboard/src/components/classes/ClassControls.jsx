import { Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClassControls({
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by class standard, section, or teacher..."
                    className="pl-9 w-full max-w-md bg-background"
                />
            </div>

            <div className="flex items-center gap-2 border border-border p-1 rounded-lg bg-muted/30 self-end sm:self-auto">
                <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    className="cursor-pointer rounded-md"
                >
                    <Grid className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => setViewMode("table")}
                    title="Table View"
                    className="cursor-pointer rounded-md"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
