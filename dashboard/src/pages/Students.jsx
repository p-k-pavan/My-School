import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";

import {
    useGetAllStudentsQuery,
    useChangeStudentStatusMutation,
} from "@/redux/api/student";

import StudentStats from "@/components/students/StudentStats";
import StudentControls from "@/components/students/StudentControls";
import StudentSkeleton from "@/components/students/StudentSkeleton";
import StudentTable from "@/components/students/StudentTable";
import StudentDialog from "@/components/students/StudentDialog";

export default function Students() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [page, setPage] = useState(1);

    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleClassFilterChange = (value) => {
        setClassFilter(value);
        setPage(1);
    };

    const queryParams = {
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        classId: classFilter === "all" ? undefined : classFilter,
        status: statusFilter === "all" ? undefined : (statusFilter === "active" ? "true" : "false"),
    };

    const { data, isLoading, error } = useGetAllStudentsQuery(queryParams);

    const { data: activeStatsData } = useGetAllStudentsQuery({ limit: 1, status: "true" });
    const { data: inactiveStatsData } = useGetAllStudentsQuery({ limit: 1, status: "false" });

    const [changeStudentStatus, { isLoading: isUpdatingStatus }] = useChangeStudentStatusMutation();

    const studentsList = data?.students || [];
    const totalPages = data?.totalPages || 1;
    const currentPage = data?.currentPage || 1;

    const totalActive = activeStatsData?.totalStudents || 0;
    const totalInactive = inactiveStatsData?.totalStudents || 0;
    const totalStudents = totalActive + totalInactive;

    const handleEdit = (student) => {
        setSelectedStudentId(student._id);
        setOpenStudentDialog(true);
    };

    const handleToggleStatus = async (student) => {
        try {
            await changeStudentStatus({
                id: student._id,
            }).unwrap();
            
            toast.success(`Student status updated successfully`);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update student status");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Students"
                description="Manage student profiles, academic records, and account statuses."
                showAddNew
                onAddNew={() => navigate("/admissions/new")}
            />

            <StudentStats
                totalStudents={totalStudents}
                activeStudents={totalActive}
                inactiveStudents={totalInactive}
                isLoading={isLoading}
            />

            <StudentControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={handleStatusFilterChange}
                classFilter={classFilter}
                setClassFilter={handleClassFilterChange}
            />

            {isLoading ? (
                <StudentSkeleton />
            ) : error ? (
                <div className="flex flex-col items-center justify-center border border-destructive/20 rounded-2xl bg-destructive/5 py-12 px-4 text-center">
                    <p className="text-sm font-medium text-destructive">
                        Failed to load students data. Please try again later.
                    </p>
                </div>
            ) : studentsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border border-dashed rounded-2xl bg-card py-16 px-4 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <Users className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No students found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {searchQuery || statusFilter !== "all" || classFilter !== "all"
                            ? "No results match your active search or filters. Try clearing filters or searching another term."
                            : "No students are currently enrolled. Click the button below to start the admission process."}
                    </p>
                    {searchQuery || statusFilter !== "all" || classFilter !== "all" ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setClassFilter("all");
                                setPage(1);
                            }}
                            className="cursor-pointer"
                        >
                            Reset Filters
                        </Button>
                    ) : (
                        <Button onClick={() => navigate("/admissions/new")} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> Go to Admissions
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <StudentTable
                        students={studentsList}
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                        isTogglingStatus={isUpdatingStatus}
                    />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
                            <p className="text-sm text-muted-foreground">
                                Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                                <span className="font-semibold text-foreground">{totalPages}</span>
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="cursor-pointer flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="cursor-pointer flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <StudentDialog
                open={openStudentDialog}
                onClose={() => {
                    setOpenStudentDialog(false);
                    setSelectedStudentId(null);
                }}
                studentId={selectedStudentId}
            />
        </div>
    );
}