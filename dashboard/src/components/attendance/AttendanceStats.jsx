import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AttendanceStats({ totalStudents, presentCount, absentCount, lateCount, halfDayCount }) {
    return (
        <div className="grid gap-4 md:grid-cols-5">
            <Card className="border bg-card">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{totalStudents}</div>
                </CardContent>
            </Card>
            <Card className="border bg-card">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground text-emerald-600">Present</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold text-emerald-600">{presentCount}</div>
                </CardContent>
            </Card>
            <Card className="border bg-card">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground text-destructive">Absent</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold text-destructive">{absentCount}</div>
                </CardContent>
            </Card>
            <Card className="border bg-card">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground text-amber-600">Late</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold text-amber-600">{lateCount}</div>
                </CardContent>
            </Card>
            <Card className="border bg-card">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground text-indigo-600">Half Day</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold text-indigo-600">{halfDayCount}</div>
                </CardContent>
            </Card>
        </div>
    );
}
