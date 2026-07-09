import { Edit3, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassTable({ classes, onEdit, onDelete }) {
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
                                Class Level
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Section
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Class Teacher
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
                        {classes.map((classItem) => {
                            const hasTeacher = !!classItem.classTeacher;
                            return (
                                <tr
                                    key={classItem._id}
                                    className="hover:bg-muted/10 transition-colors duration-250"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="font-semibold text-foreground">
                                            Class {classItem.className}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-muted font-bold text-xs uppercase text-foreground">
                                            {classItem.section}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {hasTeacher ? (
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {classItem.classTeacher.teacherName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {classItem.classTeacher.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2.5 text-muted-foreground italic text-sm">
                                                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                Not Assigned
                                            </div>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onEdit(classItem)}
                                                className="cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onDelete(classItem)}
                                                className="cursor-pointer text-destructive hover:bg-destructive/10"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
