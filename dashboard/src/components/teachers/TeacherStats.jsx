import { Users, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherStats({
    totalTeachers,
    activeTeachers,
    inactiveTeachers,
    isLoading,
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Teachers
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
                            totalTeachers
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Registered academic faculty
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Teachers
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
                            activeTeachers
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Currently teaching classes
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Inactive Teachers
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
                            inactiveTeachers
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        On leave or inactive status
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
