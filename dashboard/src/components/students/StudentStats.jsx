import { GraduationCap, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentStats({
    totalStudents,
    activeStudents,
    inactiveStudents,
    isLoading,
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Students
                    </CardTitle>
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <GraduationCap className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded-md animate-pulse" />
                        ) : (
                            totalStudents
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Enrolled student profiles
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Students
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
                            activeStudents
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active student records
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Inactive Students
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
                            inactiveStudents
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Deactivated student accounts
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
