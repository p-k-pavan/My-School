import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import SubjectStats from "@/components/subjects/SubjectStats";
import SubjectControls from "@/components/subjects/SubjectControls";
import SubjectDialog from "@/components/subjects/SubjectDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

import {
    useGetSubjectsQuery,
    useDeleteSubjectMutation,
} from "@/redux/api/subject";
import { useGetClassQuery } from "@/redux/api/class";
import { useGetTeachersQuery } from "@/redux/api/teacher";

export default function Subjects() {
    const { user } = useSelector((state) => state.auth);
    const isAdminOrManagement = ["admin", "management"].includes(user?.role);

    const [searchQuery, setSearchQuery] = useState("");
    
    const [page, setPage] = useState(1);

    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const queryParams = {
        page,
        limit: 12,
        search: searchQuery,
    };

    const { data: subjectsData, isLoading: isSubjectsLoading } = useGetSubjectsQuery(queryParams);
    const { data: classesData } = useGetClassQuery();
    const { data: teachersData } = useGetTeachersQuery();

    const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

    const subjectsList = subjectsData?.subjects || [];
    const teachersList = teachersData?.teachers || [];

    const totalSubjectsCount = subjectsData?.totalSubjects || 0;
    const activeSubjectsCount = subjectsList.filter((s) => s.isActive).length;
    const inactiveSubjectsCount = subjectsList.length - activeSubjectsCount;

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const handleOpenAdd = () => {
        setEditingSubject(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (subject) => {
        setEditingSubject(subject);
        setOpenDialog(true);
    };

    const handleOpenDelete = (subject) => {
        setSubjectToDelete(subject);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!subjectToDelete) return;
        try {
            const response = await deleteSubject(subjectToDelete._id).unwrap();
            toast.success(response.message || "Subject deleted successfully");
            setOpenDeleteDialog(false);
            setSubjectToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete subject");
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Subjects"
                description="Manage curriculum subjects, course codes, and teacher assignments."
                showAddNew={isAdminOrManagement}
                onAddNew={handleOpenAdd}
                addNewText="Add Subject"
            />

            <SubjectStats
                totalSubjects={totalSubjectsCount}
                activeSubjects={activeSubjectsCount}
                inactiveSubjects={inactiveSubjectsCount}
                isLoading={isSubjectsLoading}
            />

            <SubjectControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {isSubjectsLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : subjectsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No subjects found</h3>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {subjectsList.map((subject) => (
                        <Card key={subject._id} className="border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden hover:-translate-y-0.5">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                                            {subject.subjectCode}
                                        </span>
                                        <h3 className="text-base font-bold text-foreground line-clamp-1 pt-1">{subject.subjectName}</h3>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${subject.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                                        {subject.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-md text-primary border border-border">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Code: <span className="font-semibold text-foreground">{subject.subjectCode}</span>
                                    </div>
                                </div>

                                <Separator />

                                {isAdminOrManagement && (
                                    <div className="flex justify-end gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(subject)}
                                            className="cursor-pointer text-xs h-8"
                                        >
                                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDelete(subject)}
                                            className="cursor-pointer text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {subjectsData?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="cursor-pointer"
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground px-3">
                        Page {page} of {subjectsData.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === subjectsData.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="cursor-pointer"
                    >
                        Next
                    </Button>
                </div>
            )}

            <SubjectDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                subjectData={editingSubject}
            />

            <DeleteConfirmDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Subject"
                itemName={subjectToDelete ? `${subjectToDelete.subjectName} (${subjectToDelete.subjectCode})` : ""}
                description={
                    subjectToDelete ? (
                        <>
                            Are you absolutely sure you want to delete the subject{" "}
                            <span className="font-extrabold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border">
                                {subjectToDelete?.subjectName} ({subjectToDelete?.subjectCode})
                            </span>
                            ? All curriculum data associated with this subject code will be removed. This action cannot be undone.
                        </>
                    ) : null
                }
                confirmText="Delete Permanently"
                isDeleting={isDeleting}
            />
        </div>
    );
}
