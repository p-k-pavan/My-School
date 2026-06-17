export default function ParentSkeleton({ viewMode }) {
    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="border border-border/60 rounded-xl p-5 space-y-4 bg-card shadow-xs animate-pulse"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-full" />
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-3 w-16 bg-muted rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-12 bg-muted rounded-full" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-3.5 w-full bg-muted rounded" />
                            <div className="h-3.5 w-full bg-muted rounded" />
                            <div className="h-3.5 w-2/3 bg-muted rounded" />
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-border/50">
                            <div className="h-8 flex-1 bg-muted rounded-md" />
                            <div className="h-8 flex-1 bg-muted rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden animate-pulse">
            <div className="h-10 bg-muted/50 border-b border-border" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="h-14 border-b border-border/50 flex items-center px-6 justify-between gap-4"
                >
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-4 w-36 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-4 w-28 bg-muted rounded" />
                    <div className="h-6 w-14 bg-muted rounded-full" />
                    <div className="h-8 w-20 bg-muted rounded" />
                </div>
            ))}
        </div>
    );
}
