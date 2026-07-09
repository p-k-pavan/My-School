import { useState } from "react";
import { toast } from "sonner";
import { School, Plus } from "lucide-react";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";

import {
    useGetClassQuery,
    useDeleteClassMutation,
} from "@/redux/api/class";

import ClassStats from "@/components/classes/ClassStats";
import ClassControls from "@/components/classes/ClassControls";
import ClassSkeleton from "@/components/classes/ClassSkeleton";
import ClassGrid from "@/components/classes/ClassGrid";
import ClassTable from "@/components/classes/ClassTable";
import ClassDialog from "@/components/classes/ClassDialog";
import BulkUploadDialog from "@/components/classes/BulkUpload";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function Classes() {
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");

    const [openClassDialog, setOpenClassDialog] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);


    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);


    const { data, isLoading } = useGetClassQuery();
    const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

    const classesList = data?.classes || [];

    const filteredClasses = classesList.filter((classItem) => {
        const classNameStr = classItem.className ? String(classItem.className) : "";
        const sectionStr = classItem.section ? classItem.section.toLowerCase() : "";
        const teacherNameStr = classItem.classTeacher?.teacherName
            ? classItem.classTeacher.teacherName.toLowerCase()
            : "";
        const q = searchQuery.toLowerCase();

        return (
            classNameStr.includes(q) ||
            sectionStr.includes(q) ||
            teacherNameStr.includes(q)
        );
    });


    const totalClasses = classesList.length;
    const assignedTeachersCount = classesList.filter((c) => c.classTeacher).length;
    const unassignedClassesCount = totalClasses - assignedTeachersCount;

    const handleAddNew = () => {
        setSelectedClass(null);
        setOpenClassDialog(true);
    };

    const handleEdit = (classItem) => {
        setSelectedClass(classItem);
        setOpenClassDialog(true);
    };

    const handleDeleteClick = (classItem) => {
        setClassToDelete(classItem);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!classToDelete) return;

        try {
            const response = await deleteClass(classToDelete._id).unwrap();
            toast.success(response.message || "Class deleted successfully");
            setDeleteConfirmOpen(false);
            setClassToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete class");
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">

            <PageHeading
                title="Classes"
                description="Manage class rooms, sections, and class teacher assignments."
                showAddNew
                showBulkUpload
                onAddNew={handleAddNew}
                onBulkUpload={() => setOpenUploadModal(true)}
            />

            <ClassStats
                totalClasses={totalClasses}
                assignedTeachersCount={assignedTeachersCount}
                unassignedClassesCount={unassignedClassesCount}
                isLoading={isLoading}
            />

            <ClassControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {isLoading ? (
                <ClassSkeleton viewMode={viewMode} />
            ) : filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border border-dashed rounded-2xl bg-card py-16 px-4 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <School className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No classes found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {searchQuery
                            ? "No results match your search query. Try checking for typos or searching another term."
                            : "Classes have not been set up yet. Get started by adding a new class or bulk uploading."}
                    </p>
                    {searchQuery ? (
                        <Button variant="outline" onClick={() => setSearchQuery("")} className="cursor-pointer">
                            Clear Search
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button onClick={handleAddNew} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Add First Class
                            </Button>
                            <Button variant="outline" onClick={() => setOpenUploadModal(true)} className="cursor-pointer">
                                Bulk Upload
                            </Button>
                        </div>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                <ClassGrid
                    classes={filteredClasses}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            ) : (
                <ClassTable
                    classes={filteredClasses}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <ClassDialog
                open={openClassDialog}
                onClose={() => setOpenClassDialog(false)}
                classData={selectedClass}
            />

            <BulkUploadDialog
                open={openUploadModal}
                onClose={() => setOpenUploadModal(false)}
            />

            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                itemName={classToDelete ? `Class ${classToDelete.className}-${classToDelete.section}` : ""}
                description={
                    classToDelete ? (
                        <>
                            Are you sure you want to delete{" "}
                            <strong>
                                Class {classToDelete?.className}-{classToDelete?.section}
                            </strong>
                            ? This action cannot be undone and will delete all associated schedules and records.
                        </>
                    ) : null
                }
                confirmText="Delete Class"
                isDeleting={isDeleting}
            />
        </div>
    );
}
