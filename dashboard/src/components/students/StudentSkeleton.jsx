export default function StudentSkeleton() {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden animate-pulse">
            
            <div className="h-12 bg-muted/40 border-b border-border flex items-center px-6 justify-between">
                <div className="h-4 w-1/12 bg-muted rounded" />
                <div className="h-4 w-2/12 bg-muted rounded" />
                <div className="h-4 w-1/12 bg-muted rounded" />
                <div className="h-4 w-1/12 bg-muted rounded" />
                <div className="h-4 w-3/12 bg-muted rounded" />
                <div className="h-4 w-1/12 bg-muted rounded" />
                <div className="h-4 w-1/12 bg-muted rounded" />
            </div>
            
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="h-16 border-b border-border/50 flex items-center px-6 justify-between gap-4"
                >
                    <div className="h-4 w-1/12 bg-muted rounded" />
                    <div className="flex items-center gap-3 w-2/12">
                        <div className="h-10 w-10 bg-muted rounded-full shrink-0" />
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-3/4 bg-muted rounded" />
                        </div>
                    </div>
                    <div className="h-4 w-1/12 bg-muted rounded" />
                    <div className="h-4 w-1/12 bg-muted rounded" />
                    <div className="space-y-1.5 w-3/12">
                        <div className="h-3.5 w-2/3 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-14 bg-muted rounded-full" />
                    <div className="h-8 w-20 bg-muted rounded" />
                </div>
            ))}
        </div>
    );
}
