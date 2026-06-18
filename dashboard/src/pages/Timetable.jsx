import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";

// Modular Subcomponents
import TimetableControls from "@/components/timetable/TimetableControls";
import TimetablePeriodCard from "@/components/timetable/TimetablePeriodCard";
import TimetableDialog from "@/components/timetable/TimetableDialog";

import { useGetClassQuery } from "@/redux/api/class";
import { useGetTeachersQuery } from "@/redux/api/teacher";
import {
    useGetTimetableByClassQuery,
    useDeleteTimetableMutation,
} from "@/redux/api/timetable";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
    const { user } = useSelector((state) => state.auth);
    const isAdminOrManagement = ["admin", "management"].includes(user?.role);

    // Filters state
    const [selectedClass, setSelectedClass] = useState("");
    const [academicYear, setAcademicYear] = useState("2026-2027");
    const [activeTabDay, setActiveTabDay] = useState("Monday");

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTimetable, setEditingTimetable] = useState(null);

    // Fetch master data
    const { data: classesData, isLoading: isClassesLoading } = useGetClassQuery();
    const classesList = classesData?.classes || [];
    const { data: teachersData } = useGetTeachersQuery();
    const teachersList = teachersData?.teachers || [];

    // Auto-select first class when loaded
    useEffect(() => {
        if (classesList.length > 0 && !selectedClass) {
            setSelectedClass(classesList[0]._id);
        }
    }, [classesList, selectedClass]);

    // Fetch timetable for selected class
    const { data: timetableData, isLoading: isTimetableLoading } = useGetTimetableByClassQuery(
        { classId: selectedClass, academicYear },
        { skip: !selectedClass }
    );
    const timetableRecords = timetableData?.timetable || [];

    // Mutations
    const [deleteTimetable] = useDeleteTimetableMutation();

    // Open schedule dialog
    const handleOpenAdd = () => {
        setEditingTimetable(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (dayRecord) => {
        setEditingTimetable(dayRecord);
        setOpenDialog(true);
    };

    const handleDelete = async (timetableId) => {
        if (!confirm("Are you sure you want to delete the schedule for this day?")) return;
        try {
            const response = await deleteTimetable(timetableId).unwrap();
            toast.success(response.message || "Timetable day schedule deleted successfully");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete timetable");
            console.error(error);
        }
    };

    // Get active day's timetable record
    const activeDayRecord = timetableRecords.find(t => t.day === activeTabDay);
    const sortedPeriods = activeDayRecord 
        ? [...activeDayRecord.periods].sort((a, b) => a.periodNo - b.periodNo) 
        : [];

    return (
        <div className="space-y-6">
            <PageHeading
                title="Class Timetable"
                description="View and schedule daily class periods, class rooms, subject codes, and subject teachers."
                showAddNew={isAdminOrManagement}
                onAddNew={handleOpenAdd}
                addNewText="Schedule Day"
            />

            {/* Timetable Filters Component */}
            <TimetableControls
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                academicYear={academicYear}
                setAcademicYear={setAcademicYear}
                classesList={classesList}
            />

            {/* Weekday Tab Switcher */}
            <div className="flex flex-wrap border-b border-border gap-1">
                {WEEKDAYS.map((day) => {
                    const hasSchedule = timetableRecords.some(t => t.day === day && t.periods.length > 0);
                    return (
                        <button
                            key={day}
                            onClick={() => setActiveTabDay(day)}
                            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTabDay === day ? "border-black text-black dark:border-white dark:text-white" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        >
                            <span className="flex items-center gap-1.5">
                                {day}
                                {hasSchedule && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Timetable schedule content */}
            {isClassesLoading || isTimetableLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : !selectedClass ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
                    No classes available. Please set up a class first.
                </div>
            ) : sortedPeriods.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <Calendar className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No periods scheduled</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        No timetable slots are scheduled for {activeTabDay} of academic year {academicYear}.
                    </p>
                    {isAdminOrManagement && (
                        <Button onClick={handleOpenAdd} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> Schedule {activeTabDay}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium text-muted-foreground">
                            Active schedule for <span className="font-bold text-foreground">{activeTabDay}</span>
                        </span>
                        {isAdminOrManagement && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEdit(activeDayRecord)}
                                    className="cursor-pointer"
                                >
                                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit Day Schedule
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(activeDayRecord._id)}
                                    className="cursor-pointer text-destructive hover:bg-destructive hover:text-white"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Day
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Periods Grid Timeline (using TimetablePeriodCard) */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedPeriods.map((period, idx) => (
                            <TimetablePeriodCard key={idx} period={period} />
                        ))}
                    </div>
                </div>
            )}

            {/* Add / Edit Timetable Dialog Component */}
            <TimetableDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                timetableData={editingTimetable}
                selectedClass={selectedClass}
                academicYear={academicYear}
                classesList={classesList}
                teachersList={teachersList}
            />
        </div>
    );
}
