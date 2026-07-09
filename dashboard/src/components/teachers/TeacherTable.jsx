import { Edit3, UserCheck, UserX, School } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherTable({ teachers, onEdit, onToggleStatus, isTogglingStatus, onManageClasses }) {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/40">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Employee ID
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Teacher Name
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Contact Info
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Qualification
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Joining Date
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Assigned Classes
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Status
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-card">
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
                                <tr
                                    key={teacher._id}
                                    className="hover:bg-muted/10 transition-colors duration-250"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded">
                                            {teacher.employeeId}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="font-semibold text-foreground text-sm">
                                            {teacher.teacherName}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-foreground">
                                            {teacher.email}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {teacher.mobile}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                                        {teacher.qualification}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                        {formattedDate}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-50">
                                                    {teacher.assignedClasses.map((cls) => (
                                                        <span
                                                            key={cls._id}
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-xs font-medium text-foreground border border-border/50"
                                                        >
                                                            {cls.className}-{cls.section}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">
                                                    None
                                                </span>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => onManageClasses(teacher)}
                                                className="cursor-pointer text-primary hover:bg-primary/10"
                                                title="Manage Assignments"
                                            >
                                                <School className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                isActive
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                            }`}
                                        >
                                            {isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onEdit(teacher)}
                                                className="cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onToggleStatus(teacher)}
                                                disabled={isTogglingStatus}
                                                className={`cursor-pointer ${
                                                    isActive
                                                        ? "text-destructive hover:bg-destructive/10"
                                                        : "text-emerald-600 hover:bg-emerald-500/10"
                                                }`}
                                                title={isActive ? "Deactivate" : "Activate"}
                                            >
                                                {isActive ? (
                                                    <UserX className="h-4 w-4" />
                                                ) : (
                                                    <UserCheck className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
