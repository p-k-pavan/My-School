import { Edit3, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ParentTable({ parents, onEdit, onToggleStatus, isTogglingStatus }) {
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
                                Father's Name
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Mother's Name
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
                                Occupations
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                            >
                                Location
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
                        {parents.map((parent) => {
                            const isActive = parent.status;
                            const fullAddress = [parent.city, parent.state].filter(Boolean).join(", ") || "N/A";

                            return (
                                <tr
                                    key={parent._id}
                                    className="hover:bg-muted/10 transition-colors duration-250"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="font-semibold text-foreground text-sm">
                                            {parent.fatherName || "N/A"}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="font-semibold text-foreground text-sm">
                                            {parent.motherName || "N/A"}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-foreground">
                                            {parent.phoneNumber || "N/A"}
                                        </div>
                                        {parent.email && (
                                            <div className="text-xs text-muted-foreground">
                                                {parent.email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                                        <div className="text-xs">
                                            <span className="font-semibold text-muted-foreground">F:</span> {parent.fatherOccupation || "N/A"}
                                        </div>
                                        <div className="text-xs mt-0.5">
                                            <span className="font-semibold text-muted-foreground">M:</span> {parent.motherOccupation || "N/A"}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                        {fullAddress}
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
                                                onClick={() => onEdit(parent)}
                                                className="cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onToggleStatus(parent)}
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
