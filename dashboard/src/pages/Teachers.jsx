import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus } from "lucide-react";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";

import {
    useGetTeachersQuery,
    useUpdateTeacherStatusMutation,
    useGetTeacherAssignClassesQuery,
    useAssignClassMutation,
    useRemoveAssignClassMutation,
} from "@/redux/api/teacher";

import TeacherStats from "@/components/teachers/TeacherStats";
import TeacherControls from "@/components/teachers/TeacherControls";
import TeacherSkeleton from "@/components/teachers/TeacherSkeleton";
import TeacherGrid from "@/components/teachers/TeacherGrid";
import TeacherTable from "@/components/teachers/TeacherTable";
import TeacherDialog from "@/components/teachers/TeacherDialog";
import TeacherBulkUploadDialog from "@/components/teachers/TeacherBulkUpload";
import AssignClassesDialog from "@/components/teachers/AssignClassesDialog";

export default function Teachers() {
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [openTeacherDialog, setOpenTeacherDialog] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Class assignment states
    const [openAssignClassesDialog, setOpenAssignClassesDialog] = useState(false);
    const [assignClassesTeacher, setAssignClassesTeacher] = useState(null);

    const { data, isLoading, error } = useGetTeachersQuery();
    const [updateTeacherStatus, { isLoading: isUpdatingStatus }] = useUpdateTeacherStatusMutation();

    // Assignment hooks
    const teacherIdForClasses = assignClassesTeacher?._id;
    const {
        data: assignedClassesData,
        isLoading: isLoadingAssignedClasses,
    } = useGetTeacherAssignClassesQuery(
        teacherIdForClasses,
        {
            skip: !teacherIdForClasses,
        }
    );

    const [
        assignClass,
        { isLoading: isAssigningClass }
    ] = useAssignClassMutation();

    const [
        removeAssignClass,
        { isLoading: isRemovingAssignClass }
    ] = useRemoveAssignClassMutation();

    const teachersList = data?.teachers || [];

    const filteredTeachers = teachersList.filter((teacher) => {
        // Status filter
        if (statusFilter === "active" && !teacher.status) return false;
        if (statusFilter === "inactive" && teacher.status) return false;

        // Search filter
        const nameStr = teacher.teacherName ? teacher.teacherName.toLowerCase() : "";
        const idStr = teacher.employeeId ? teacher.employeeId.toLowerCase() : "";
        const emailStr = teacher.email ? teacher.email.toLowerCase() : "";
        const mobileStr = teacher.mobile ? teacher.mobile : "";
        const qualStr = teacher.qualification ? teacher.qualification.toLowerCase() : "";
        const q = searchQuery.toLowerCase();

        return (
            nameStr.includes(q) ||
            idStr.includes(q) ||
            emailStr.includes(q) ||
            mobileStr.includes(q) ||
            qualStr.includes(q)
        );
    });

    // Compute stats
    const totalTeachers = teachersList.length;
    const activeTeachers = teachersList.filter((t) => t.status).length;
    const inactiveTeachers = totalTeachers - activeTeachers;

    const handleAddNew = () => {
        setSelectedTeacher(null);
        setOpenTeacherDialog(true);
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setOpenTeacherDialog(true);
    };

    const handleToggleStatus = async (teacher) => {
        try {
            const response = await updateTeacherStatus({
                id: teacher._id,
                status: !teacher.status,
            }).unwrap();
            
            toast.success(response.message || `Teacher ${!teacher.status ? "activated" : "deactivated"} successfully`);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update teacher status");
            console.error(err);
        }
    };

    const handleManageClasses = (teacher) => {
        setAssignClassesTeacher(teacher);
        setOpenAssignClassesDialog(true);
    };

    const handleAssignClass = async (classId) => {
        try {
            const currentClassIds = assignedClassesData?.classes?.map((c) => c._id) || [];
            const updatedClassIds = [...currentClassIds, classId];
            const response = await assignClass({
                id: assignClassesTeacher._id,
                assignedClasses: updatedClassIds,
            }).unwrap();
            
            toast.success(response.message || "Class assigned successfully");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to assign class");
            console.error(err);
        }
    };

    const handleRemoveClass = async (classId) => {
        try {
            const response = await removeAssignClass({
                id: assignClassesTeacher._id,
                classId,
            }).unwrap();
            
            toast.success(response.message || "Class removed successfully");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to remove class");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Teachers"
                description="Manage academic faculty, view assignments, and edit credentials."
                showAddNew
                showBulkUpload
                onAddNew={handleAddNew}
                onBulkUpload={() => setOpenUploadModal(true)}
            />

            <TeacherStats
                totalTeachers={totalTeachers}
                activeTeachers={activeTeachers}
                inactiveTeachers={inactiveTeachers}
                isLoading={isLoading}
            />

            <TeacherControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {isLoading ? (
                <TeacherSkeleton viewMode={viewMode} />
            ) : error ? (
                <div className="flex flex-col items-center justify-center border border-destructive/20 rounded-2xl bg-destructive/5 py-12 px-4 text-center">
                    <p className="text-sm font-medium text-destructive">
                        Failed to load teachers data. Please try again later.
                    </p>
                </div>
            ) : filteredTeachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border border-dashed rounded-2xl bg-card py-16 px-4 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <Users className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No teachers found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {searchQuery || statusFilter !== "all"
                            ? "No results match your active search or status filters. Try clearing filters or searching another term."
                            : "Teachers have not been registered yet. Get started by adding a teacher or bulk uploading."}
                    </p>
                    {searchQuery || statusFilter !== "all" ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                            }}
                            className="cursor-pointer"
                        >
                            Reset Filters
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button onClick={handleAddNew} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Add First Teacher
                            </Button>
                            <Button variant="outline" onClick={() => setOpenUploadModal(true)} className="cursor-pointer">
                                Bulk Upload
                            </Button>
                        </div>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                <TeacherGrid
                    teachers={filteredTeachers}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    isTogglingStatus={isUpdatingStatus}
                    onManageClasses={handleManageClasses}
                />
            ) : (
                <TeacherTable
                    teachers={filteredTeachers}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    isTogglingStatus={isUpdatingStatus}
                    onManageClasses={handleManageClasses}
                />
            )}

            <TeacherDialog
                open={openTeacherDialog}
                onClose={() => setOpenTeacherDialog(false)}
                teacherData={selectedTeacher}
            />

            <TeacherBulkUploadDialog
                open={openUploadModal}
                onClose={() => setOpenUploadModal(false)}
            />

            <AssignClassesDialog
                open={openAssignClassesDialog}
                onClose={() => {
                    setOpenAssignClassesDialog(false);
                    setAssignClassesTeacher(null);
                }}
                teacher={assignClassesTeacher}
                assignedClasses={assignedClassesData?.classes || []}
                isLoadingAssigned={isLoadingAssignedClasses}
                onAssign={handleAssignClass}
                onRemove={handleRemoveClass}
                isAssigning={isAssigningClass}
                isRemoving={isRemovingAssignClass}
            />
        </div>
    );
}
