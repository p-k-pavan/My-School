import { Edit3, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentTable({
    students,
    onEdit,
    onToggleStatus,
    isTogglingStatus,
}) {
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
                                Student Details
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Class & Section
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Roll No
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Parents / Contact
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Gender
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
                        {students.map((student) => {
                            const isActive = student.status;
                            const className = student.classId?.className || "N/A";
                            const section = student.classId?.section || "";
                            const parentInfo = student.parentId || {};
                            
                            return (
                                <tr
                                    key={student._id}
                                    className="hover:bg-muted/10 transition-colors duration-250"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {student.profilePhoto ? (
                                                    <img
                                                        src={student.profilePhoto.startsWith("http") ? student.profilePhoto : `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")}/${student.profilePhoto}`}
                                                        alt={student.studentName}
                                                        className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                                                    />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                    {student.studentName ? student.studentName.charAt(0).toUpperCase() : "?"}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-foreground text-sm">
                                                    {student.studentName || "N/A"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Adm: {student.admissionNo || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                        {className} {section ? `(${section})` : ""}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                                        {student.rollNo !== undefined ? student.rollNo : "-"}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                                        <div className="text-xs">
                                            <span className="font-semibold text-muted-foreground">Father:</span> {parentInfo.fatherName || "N/A"}
                                        </div>
                                        <div className="text-xs mt-0.5">
                                            <span className="font-semibold text-muted-foreground">Mother:</span> {parentInfo.motherName || "N/A"}
                                        </div>
                                        {parentInfo.phoneNumber && (
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Ph: {parentInfo.phoneNumber}
                                            </div>
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                        {student.gender || "N/A"}
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
                                                onClick={() => onEdit(student)}
                                                className="cursor-pointer"
                                                title="Edit Profile"
                                            >
                                                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onToggleStatus(student)}
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
