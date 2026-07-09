import React from "react";
import { Clock, BookOpen, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TimetablePeriodCard({ period }) {
    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
                        Period {period.periodNo}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {period.startTime} - {period.endTime}
                    </div>
                </div>

                <Separator />

                <div className="space-y-2.5">
                    <div className="flex gap-2 items-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="text-sm font-bold text-foreground">
                            {period.subjectId?.subjectName || "Subject Details Unavailable"}{" "}
                            <span className="text-xs text-muted-foreground">
                                ({period.subjectId?.subjectCode})
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="text-xs text-muted-foreground">
                            {period.teacherId?.teacherName || "No teacher assigned"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
