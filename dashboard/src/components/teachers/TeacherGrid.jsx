import { Edit3, Mail, Phone, GraduationCap, Calendar, UserCheck, UserX, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function TeacherGrid({ teachers, onEdit, onToggleStatus, isTogglingStatus }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teachers.map((teacher) => {
                const isActive = teacher.status;
                const formattedDate = teacher.joiningDate
                    ? new Date(teacher.joiningDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                      })
                    : "N/A";

                return (
                    <Card
                        key={teacher._id}
                        className="group border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                        <CardHeader className="flex flex-row items-start justify-between pb-3">
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {teacher.employeeId}
                                </div>
                                <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors duration-250">
                                    {teacher.teacherName}
                                </h3>
                            </div>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}
                            >
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </CardHeader>

                        <CardContent className="pb-4 space-y-3.5 flex-1">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                                    <span className="truncate" title={teacher.email}>
                                        {teacher.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                                    <span>{teacher.mobile}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                                    <span className="truncate">{teacher.qualification}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                                    <span>Joined {formattedDate}</span>
                                </div>
                            </div>

                            {/* Assigned Classes badges */}
                            {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                                <div className="pt-2 border-t border-border/50">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <School className="h-3 w-3" />
                                        Assigned Classes
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.assignedClasses.map((cls) => (
                                            <span
                                                key={cls._id}
                                                className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs font-medium text-foreground border border-border/50"
                                            >
                                                {cls.className}-{cls.section}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-border/50">
                                    <div className="text-xs text-muted-foreground italic">
                                        No classes assigned
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <div className="px-4 pb-4 pt-0 flex gap-2 mt-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(teacher)}
                                className="flex-1 cursor-pointer"
                            >
                                <Edit3 className="mr-1 h-3.5 w-3.5" />
                                Edit
                            </Button>
                            <Button
                                variant={isActive ? "destructive" : "default"}
                                size="sm"
                                onClick={() => onToggleStatus(teacher)}
                                disabled={isTogglingStatus}
                                className={`flex-1 cursor-pointer ${
                                    !isActive
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                                        : ""
                                }`}
                            >
                                {isActive ? (
                                    <>
                                        <UserX className="mr-1 h-3.5 w-3.5" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="mr-1 h-3.5 w-3.5" />
                                        Activate
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
