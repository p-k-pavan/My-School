import { Users, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentStats({
    totalParents,
    activeParents,
    inactiveParents,
    isLoading,
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Parents
                    </CardTitle>
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded-md animate-pulse" />
                        ) : (
                            totalParents
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Registered parent profiles
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Parents
                    </CardTitle>
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <UserCheck className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded-md animate-pulse" />
                        ) : (
                            activeParents
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active contact records
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Inactive Parents
                    </CardTitle>
                    <div className="p-1.5 bg-destructive/10 rounded-lg text-destructive">
                        <UserX className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded-md animate-pulse" />
                        ) : (
                            inactiveParents
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Deactivated parent accounts
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
