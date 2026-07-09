import React from "react";
import { BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubjectStats({ totalSubjects, activeSubjects, inactiveSubjects, isLoading }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-border bg-card shadow-xs transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Subjects</CardTitle>
                    <div className="p-1.5 bg-muted rounded-md border border-border">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : totalSubjects}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">All curriculum courses cataloged</p>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Active Courses</CardTitle>
                    <div className="p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : activeSubjects}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Currently offered active syllabus</p>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Inactive Courses</CardTitle>
                    <div className="p-1.5 bg-destructive/10 rounded-md border border-destructive/20">
                        <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : inactiveSubjects}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Archived or pending allocation</p>
                </CardContent>
            </Card>
        </div>
    );
}
