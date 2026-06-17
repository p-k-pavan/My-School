import { School, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClassStats({
    totalClasses,
    assignedTeachersCount,
    unassignedClassesCount,
    isLoading,
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Classes
                    </CardTitle>
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <School className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded-md animate-pulse" />
                        ) : (
                            totalClasses
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active standard divisions
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Teachers Assigned
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
                            assignedTeachersCount
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Classes with a class teacher
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Unassigned Classes
                    </CardTitle>
                    <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                        <UserX className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded-md animate-pulse" />
                        ) : (
                            unassignedClassesCount
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Classes without a teacher assigned
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
