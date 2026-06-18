import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, MinusCircle } from "lucide-react";
import { timetableSchema } from "@/schemas/timetable.schema";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useCreateTimetableMutation, useUpdateTimetableMutation } from "@/redux/api/timetable";
import { useGetSubjectsQuery } from "@/redux/api/subject";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableDialog({
    open,
    onClose,
    timetableData,
    selectedClass,
    academicYear,
    classesList,
    teachersList,
}) {
    const isEdit = !!timetableData;

    const [formClassId, setFormClassId] = useState("");
    const [formDay, setFormDay] = useState("Monday");
    const [formAcademicYear, setFormAcademicYear] = useState("2026-2027");
    const [formPeriods, setFormPeriods] = useState([
        { periodNo: 1, subjectId: "", teacherId: "", startTime: "", endTime: "" }
    ]);
    const [errors, setErrors] = useState({});

    const { data: formSubjectsData } = useGetSubjectsQuery(
        { classId: formClassId || selectedClass, limit: 100 },
        { skip: !formClassId && !selectedClass }
    );
    const subjectsForClass = formSubjectsData?.subjects || [];

    const [createTimetable, { isLoading: isCreating }] = useCreateTimetableMutation();
    const [updateTimetable, { isLoading: isUpdating }] = useUpdateTimetableMutation();
    const isMutating = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (timetableData) {
                setFormClassId(timetableData.classId || selectedClass);
                setFormDay(timetableData.day || "Monday");
                setFormAcademicYear(timetableData.academicYear || academicYear);

                const mappedPeriods = timetableData.periods.map((p) => ({
                    periodNo: p.periodNo,
                    subjectId: typeof p.subjectId === "object" ? p.subjectId._id : p.subjectId,
                    teacherId: typeof p.teacherId === "object" ? p.teacherId._id : p.teacherId,
                    startTime: p.startTime,
                    endTime: p.endTime,
                }));
                setFormPeriods(mappedPeriods.length > 0 ? mappedPeriods : [
                    { periodNo: 1, subjectId: "", teacherId: "", startTime: "", endTime: "" }
                ]);
            } else {
                setFormClassId(selectedClass);
                setFormDay("Monday");
                setFormAcademicYear(academicYear);
                setFormPeriods([
                    { periodNo: 1, subjectId: "", teacherId: "", startTime: "", endTime: "" }
                ]);
            }
            setErrors({});
        }
    }, [open, timetableData, selectedClass, academicYear]);

    const handleAddPeriodRow = () => {
        setFormPeriods((prev) => [
            ...prev,
            {
                periodNo: prev.length > 0 ? Math.max(...prev.map((p) => Number(p.periodNo))) + 1 : 1,
                subjectId: "",
                teacherId: "",
                startTime: "",
                endTime: "",
            },
        ]);
    };

    const handleRemovePeriodRow = (index) => {
        if (formPeriods.length === 1) {
            toast.error("At least one scheduled period is required");
            return;
        }
        setFormPeriods((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handlePeriodFieldChange = (index, field, value) => {
        setFormPeriods((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payloadToValidate = {
            classId: formClassId,
            day: formDay,
            academicYear: formAcademicYear,
            periods: formPeriods.map((p) => ({
                ...p,
                periodNo: Number(p.periodNo),
            })),
        };

        const validation = timetableSchema.safeParse(payloadToValidate);

        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            toast.error("Form validation errors. Please review scheduling fields.");
            return;
        }

        setErrors({});

        try {
            if (isEdit) {
                const response = await updateTimetable({
                    id: timetableData._id,
                    data: payloadToValidate,
                }).unwrap();
                toast.success(response.message || "Timetable updated successfully");
            } else {
                const response = await createTimetable(payloadToValidate).unwrap();
                toast.success(response.message || "Timetable created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Operation failed");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Edit Timetable: ${formDay}` : "Schedule Class Timetable"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure class periods, subject tracks, and teaching schedules for the class.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <div className="grid grid-cols-3 gap-3">
                        <Field invalid={!!errors.classId}>
                            <FieldLabel htmlFor="formClassId">Class Room <span className="text-destructive">*</span></FieldLabel>
                            <Select
                                value={formClassId}
                                onValueChange={(val) => {
                                    setFormClassId(val);
                                    setFormPeriods([{ periodNo: 1, subjectId: "", teacherId: "", startTime: "", endTime: "" }]);
                                }}
                                disabled={isEdit}
                            >
                                <SelectTrigger id="formClassId" aria-invalid={!!errors.classId} className="cursor-pointer">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classesList.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            Class {cls.className} - {cls.section}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.classId}</FieldError>
                        </Field>

                        <Field invalid={!!errors.day}>
                            <FieldLabel htmlFor="formDay">Day of Week <span className="text-destructive">*</span></FieldLabel>
                            <Select
                                value={formDay}
                                onValueChange={setFormDay}
                                disabled={isEdit}
                            >
                                <SelectTrigger id="formDay" aria-invalid={!!errors.day} className="cursor-pointer">
                                    <SelectValue placeholder="Select Day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {WEEKDAYS.map((d) => (
                                        <SelectItem key={d} value={d}>
                                            {d}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.day}</FieldError>
                        </Field>

                        <Field invalid={!!errors.academicYear}>
                            <FieldLabel htmlFor="formAcademicYear">Academic Year <span className="text-destructive">*</span></FieldLabel>
                            <Input
                                id="formAcademicYear"
                                value={formAcademicYear}
                                onChange={(e) => setFormAcademicYear(e.target.value)}
                                aria-invalid={!!errors.academicYear}
                            />
                            <FieldError>{errors.academicYear}</FieldError>
                        </Field>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-foreground">Scheduled Daily Periods</h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddPeriodRow}
                                className="cursor-pointer text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Period Row
                            </Button>
                        </div>

                        {formPeriods.map((period, idx) => (
                            <div key={idx} className="bg-muted/30 p-3 rounded-lg border border-border space-y-3 relative">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-muted-foreground">Period Row #{idx + 1}</span>
                                    {formPeriods.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePeriodRow(idx)}
                                            className="text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                                            title="Remove period slot"
                                        >
                                            <MinusCircle className="h-4.5 w-4.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">P. No</span>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={period.periodNo}
                                            onChange={(e) => handlePeriodFieldChange(idx, "periodNo", e.target.value)}
                                            placeholder="P.No"
                                            className="h-8 py-0 px-2 text-xs"
                                        />
                                        {errors[`periods.${idx}.periodNo`] && (
                                            <span className="text-[9px] text-destructive">{errors[`periods.${idx}.periodNo`]}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">Subject</span>
                                        <select
                                            value={period.subjectId}
                                            onChange={(e) => handlePeriodFieldChange(idx, "subjectId", e.target.value)}
                                            className="h-8 border border-input bg-background rounded-md text-xs px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">Choose...</option>
                                            {subjectsForClass.map((sub) => (
                                                <option key={sub._id} value={sub._id}>
                                                    {sub.subjectName} ({sub.subjectCode})
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`periods.${idx}.subjectId`] && (
                                            <span className="text-[9px] text-destructive">{errors[`periods.${idx}.subjectId`]}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">Teacher</span>
                                        <select
                                            value={period.teacherId}
                                            onChange={(e) => handlePeriodFieldChange(idx, "teacherId", e.target.value)}
                                            className="h-8 border border-input bg-background rounded-md text-xs px-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">Choose...</option>
                                            {teachersList.map((t) => (
                                                <option key={t._id} value={t._id}>
                                                    {t.teacherName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`periods.${idx}.teacherId`] && (
                                            <span className="text-[9px] text-destructive">{errors[`periods.${idx}.teacherId`]}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">Start Time</span>
                                        <Input
                                            placeholder="e.g. 08:30 AM"
                                            value={period.startTime}
                                            onChange={(e) => handlePeriodFieldChange(idx, "startTime", e.target.value)}
                                            className="h-8 py-0 px-2 text-xs"
                                        />
                                        {errors[`periods.${idx}.startTime`] && (
                                            <span className="text-[9px] text-destructive">{errors[`periods.${idx}.startTime`]}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">End Time</span>
                                        <Input
                                            placeholder="e.g. 09:30 AM"
                                            value={period.endTime}
                                            onChange={(e) => handlePeriodFieldChange(idx, "endTime", e.target.value)}
                                            className="h-8 py-0 px-2 text-xs"
                                        />
                                        {errors[`periods.${idx}.endTime`] && (
                                            <span className="text-[9px] text-destructive">{errors[`periods.${idx}.endTime`]}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {errors.periods && (
                        <div className="text-xs text-destructive font-semibold text-center bg-destructive/5 py-1 rounded-md border border-destructive/10">
                            {errors.periods}
                        </div>
                    )}

                    <DialogFooter className="flex items-center justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isMutating}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isMutating}
                            className="cursor-pointer px-6"
                        >
                            {isMutating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                isEdit ? "Save Changes" : "Save Timetable Day"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
