import { Edit3, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ClassGrid({ classes, onEdit, onDelete }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {classes.map((classItem) => {
                const hasTeacher = !!classItem.classTeacher;
                return (
                    <Card
                        key={classItem._id}
                        className="group border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                        <CardHeader className="flex flex-row items-start justify-between pb-3">
                            <div className="space-y-1">
                                <div className="inline-flex items-center justify-center px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-lg group-hover:scale-105 transition-transform duration-300">
                                    Class {classItem.className}
                                </div>
                            </div>
                            <div className="h-8 w-8 rounded-full border border-border bg-muted/40 flex items-center justify-center text-foreground font-semibold text-xs uppercase shadow-2xs">
                                {classItem.section}
                            </div>
                        </CardHeader>

                        <CardContent className="pb-4">
                            <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                                <div className="flex items-start gap-2.5">
                                    <div
                                        className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                                            hasTeacher
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-amber-500/10 text-amber-500"
                                        }`}
                                    >
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Class Teacher
                                        </div>
                                        <div className="text-sm font-medium text-foreground truncate mt-0.5">
                                            {hasTeacher
                                                ? classItem.classTeacher.teacherName
                                                : "Not Assigned"}
                                        </div>
                                        {hasTeacher && (
                                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                                                {classItem.classTeacher.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <div className="px-4 pb-4 pt-0 flex gap-2  mt-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(classItem)}
                                className="flex-1 cursor-pointer"
                            >
                                <Edit3 className="mr-1 h-3.5 w-3.5" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(classItem)}
                                className="flex-1 cursor-pointer"
                            >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
