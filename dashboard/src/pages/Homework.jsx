import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Loader2, Edit2, Trash2, Download, Calendar, User, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import HomeworkStats from "@/components/homework/HomeworkStats";
import HomeworkControls from "@/components/homework/HomeworkControls";
import HomeworkDialog from "@/components/homework/HomeworkDialog";
import DeleteConfirmDialog from "@/components/homework/DeleteConfirmDialog";

import { useGetClassQuery } from "@/redux/api/class";
import {
    useGetHomeworkByClassQuery,
    useDeleteHomeworkMutation,
} from "@/redux/api/homework";

export default function Homework() {
    const { user } = useSelector((state) => state.auth);
    const canAssign = ["admin", "management", "teacher"].includes(user?.role);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [assignedDate, setAssignedDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [searchQuery, setSearchQuery] = useState("");

    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editingHomework, setEditingHomework] = useState(null);
    const [homeworkToDelete, setHomeworkToDelete] = useState(null);

    const { data: classesData, isLoading: isClassesLoading } = useGetClassQuery();
    const classesList = classesData?.classes || [];

    useEffect(() => {
        if (classesList.length > 0 && !selectedClassId) {
            setSelectedClassId(classesList[0]._id);
        }
    }, [classesList, selectedClassId]);

    const {
        data: homeworkData,
        isLoading: isHomeworkLoading,
        isFetching: isHomeworkFetching
    } = useGetHomeworkByClassQuery(
        { classId: selectedClassId, assigned: assignedDate },
        { skip: !selectedClassId }
    );

    const [deleteHomework, { isLoading: isDeleting }] = useDeleteHomeworkMutation();

    const rawHomeworkList = homeworkData?.homework || [];

    const filteredHomework = rawHomeworkList.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const desc = item.description?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return title.includes(query) || desc.includes(query);
    });

    const totalHomeworkCount = rawHomeworkList.length;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const activeHomeworkCount = rawHomeworkList.filter((item) => {
        const due = new Date(item.dueDate);
        due.setHours(23, 59, 59, 999);
        return due >= now;
    }).length;

    const overdueHomeworkCount = totalHomeworkCount - activeHomeworkCount;

    const handleOpenAdd = () => {
        setEditingHomework(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (homework) => {
        setEditingHomework(homework);
        setOpenDialog(true);
    };

    const handleOpenDelete = (homework) => {
        setHomeworkToDelete(homework);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!homeworkToDelete) return;
        try {
            const response = await deleteHomework(homeworkToDelete._id).unwrap();
            toast.success(response.message || "Homework deleted successfully");
            setOpenDeleteDialog(false);
            setHomeworkToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete homework");
            console.error(error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    const isOverdue = (dueDateStr) => {
        const due = new Date(dueDateStr);
        due.setHours(23, 59, 59, 999);
        return due < now;
    };

    const canModify = (homework) => {
        if (["admin", "management"].includes(user?.role)) return true;
        return user?.role === "teacher";
    };

    const getAttachmentUrl = (fileUrl) => {
        if (fileUrl.startsWith("http")) return fileUrl;
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        const origin = apiBase.replace("/api", "");
        return `${origin}/${fileUrl.replace(/\\/g, "/")}`;
    };

    const isLoading = isClassesLoading || isHomeworkLoading;

    return (
        <div className="space-y-6">
            <PageHeading
                title="Homework"
                description="Manage, assign, and review homework assignments for class rooms."
                showAddNew={canAssign && classesList.length > 0}
                onAddNew={handleOpenAdd}
                addNewText="Assign Homework"
            />

            <HomeworkStats
                totalHomework={totalHomeworkCount}
                activeHomework={activeHomeworkCount}
                overdueHomework={overdueHomeworkCount}
                isLoading={isLoading}
            />

            <HomeworkControls
                classesList={classesList}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                assignedDate={assignedDate}
                setAssignedDate={setAssignedDate}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                classesLoading={isClassesLoading}
            />

            {isLoading || isHomeworkFetching ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : !selectedClassId ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No class selected</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Please select a class from the dropdown menu to view homework assignments.
                    </p>
                </div>
            ) : filteredHomework.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No homework found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {searchQuery
                            ? "No results match your search query. Try checking for typos or searching another term."
                            : "There is no homework assigned to this class on the selected date."}
                    </p>
                    {searchQuery ? (
                        <Button variant="outline" onClick={() => setSearchQuery("")} className="cursor-pointer">
                            Clear Search
                        </Button>
                    ) : (
                        canAssign && (
                            <Button onClick={handleOpenAdd} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Assign First Homework
                            </Button>
                        )
                    )}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {filteredHomework.map((homework) => {
                        const pastDue = isOverdue(homework.dueDate);
                        return (
                            <Card key={homework._id} className="border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden hover:-translate-y-0.5">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                                                {homework.subjectId?.subjectName || "Subject"} ({homework.subjectId?.subjectCode || "N/A"})
                                            </span>
                                            <h3 className="text-lg font-bold text-foreground line-clamp-1 pt-1">{homework.title}</h3>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${!pastDue ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                                            {!pastDue ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-3 w-3" />
                                                    Overdue
                                                </>
                                            )}
                                        </span>
                                    </div>

                                   
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                        {homework.description}
                                    </p>

                                    
                                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                Dates
                                            </div>
                                            <div>Assigned: {formatDate(homework.assignedDate)}</div>
                                            <div className={pastDue ? "text-destructive font-semibold" : "text-foreground font-semibold"}>
                                                Due: {formatDate(homework.dueDate)}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                Assigned By
                                            </div>
                                            <div className="truncate font-medium">{homework.teacherId?.teacherName || "Teacher"}</div>
                                        </div>
                                    </div>

                                    {/* Attachments Section */}
                                    {homework.attachments && homework.attachments.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-foreground flex items-center gap-1">
                                                <FileText className="h-3.5 w-3.5" />
                                                Attachments ({homework.attachments.length})
                                            </div>
                                            <div className="grid gap-1.5">
                                                {homework.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={getAttachmentUrl(file.fileUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-muted border border-border text-xs group transition-all"
                                                    >
                                                        <span className="truncate max-w-[80%] font-medium text-muted-foreground group-hover:text-foreground">
                                                            {file.fileName || `Attachment-${idx + 1}`}
                                                        </span>
                                                        <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {canModify(homework) && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-end gap-2 pt-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(homework)}
                                                    className="cursor-pointer text-xs h-8"
                                                >
                                                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDelete(homework)}
                                                    className="cursor-pointer text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <HomeworkDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                homeworkData={editingHomework}
                defaultClassId={selectedClassId}
                defaultAssignedDate={assignedDate}
            />

            <DeleteConfirmDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                homeworkItem={homeworkToDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}