import React from "react";
import { BookOpen, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomeworkStats({ totalHomework, activeHomework, overdueHomework, isLoading }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-border bg-card shadow-xs transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Assignments</CardTitle>
                    <div className="p-1.5 bg-muted rounded-md border border-border">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : totalHomework}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">All assignments for class on this date</p>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Active (Due Future)</CardTitle>
                    <div className="p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : activeHomework}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Pending submission deadline</p>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Overdue / Past Due</CardTitle>
                    <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                        <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /> : overdueHomework}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Past due submission deadline</p>
                </CardContent>
            </Card>
        </div>
    );
}
