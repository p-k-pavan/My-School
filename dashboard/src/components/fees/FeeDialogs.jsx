import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, DollarSign, Percent, AlertTriangle } from "lucide-react";
import {
    feeStructureSchema,
    bulkGenerateSchema,
    paymentSchema,
} from "@/schemas/fee.schema";

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

import {
    useCreateFeeStructureMutation,
    useUpdateFeeStructureMutation,
} from "@/redux/api/feeStructure";
import {
    useGenerateFeesForClassMutation,
    useUpdateFeeMutation,
} from "@/redux/api/fee";
import {
    useCreateFeePaymentMutation,
    useVoidFeePaymentMutation,
} from "@/redux/api/payment";
import { useGetClassQuery } from "@/redux/api/class";
import { Separator } from "../ui/separator";

// 1. Fee Structure Dialog
export function FeeStructureDialog({ open, onClose, structureData, refetch }) {
    const isEdit = !!structureData;
    const [createFeeStructure, { isLoading: isCreating }] = useCreateFeeStructureMutation();
    const [updateFeeStructure, { isLoading: isUpdating }] = useUpdateFeeStructureMutation();
    const isLoading = isCreating || isUpdating;

    const [formData, setFormData] = useState({
        academicYear: "2026-2027",
        classLevel: "1",
        tuitionFee: 0,
        transportFee: 0,
        examFee: 0,
        libraryFee: 0,
        miscellaneousFee: 0,
        otherFee: 0,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            if (structureData) {
                setFormData({
                    academicYear: structureData.academicYear || "",
                    classLevel: String(structureData.classLevel || 1),
                    tuitionFee: structureData.tuitionFee || 0,
                    transportFee: structureData.transportFee || 0,
                    examFee: structureData.examFee || 0,
                    libraryFee: structureData.libraryFee || 0,
                    miscellaneousFee: structureData.miscellaneousFee || 0,
                    otherFee: structureData.otherFee || 0,
                });
            } else {
                setFormData({
                    academicYear: "2026-2027",
                    classLevel: "1",
                    tuitionFee: 0,
                    transportFee: 0,
                    examFee: 0,
                    libraryFee: 0,
                    miscellaneousFee: 0,
                    otherFee: 0,
                });
            }
            setErrors({});
        }
    }, [open, structureData]);

    const handleFieldChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = feeStructureSchema.safeParse(formData);
        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            toast.error("Please verify all fields");
            return;
        }

        const payload = {
            academicYear: formData.academicYear.trim(),
            classLevel: Number(formData.classLevel),
            tuitionFee: Number(formData.tuitionFee),
            transportFee: Number(formData.transportFee),
            examFee: Number(formData.examFee),
            libraryFee: Number(formData.libraryFee),
            miscellaneousFee: Number(formData.miscellaneousFee),
            otherFee: Number(formData.otherFee),
        };

        try {
            if (isEdit) {
                const response = await updateFeeStructure({ id: structureData._id, data: payload }).unwrap();
                toast.success(response.message || "Fee Structure updated successfully");
            } else {
                const response = await createFeeStructure(payload).unwrap();
                toast.success(response.message || "Fee Structure created successfully");
            }
            if (refetch) refetch();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Operation failed");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Fee Structure" : "Create Fee Structure"}</DialogTitle>
                    <DialogDescription>Configure the detailed itemized fee amounts by class level.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Field invalid={!!errors.academicYear} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Academic Year *</FieldLabel>
                            <Input
                                placeholder="e.g. 2026-2027"
                                value={formData.academicYear}
                                onChange={(e) => handleFieldChange("academicYear", e.target.value)}
                                disabled={isEdit}
                            />
                            <FieldError>{errors.academicYear}</FieldError>
                        </Field>

                        <Field invalid={!!errors.classLevel} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Class Level (1-10) *</FieldLabel>
                            <Select
                                value={formData.classLevel}
                                onValueChange={(val) => handleFieldChange("classLevel", val)}
                                disabled={isEdit}
                            >
                                <SelectTrigger className="bg-background cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <SelectItem key={num} value={String(num)}>Class {num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.classLevel}</FieldError>
                        </Field>
                    </div>

                    <Separator className="my-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Itemized Fee Allocations</span>

                    <div className="grid grid-cols-2 gap-4">
                        <Field invalid={!!errors.tuitionFee} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Tuition Fee (Rs.)</FieldLabel>
                            <Input
                                type="number"
                                value={formData.tuitionFee}
                                onChange={(e) => handleFieldChange("tuitionFee", Number(e.target.value))}
                            />
                            <FieldError>{errors.tuitionFee}</FieldError>
                        </Field>

                        <Field invalid={!!errors.transportFee} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Transport Fee (Rs.)</FieldLabel>
                            <Input
                                type="number"
                                value={formData.transportFee}
                                onChange={(e) => handleFieldChange("transportFee", Number(e.target.value))}
                            />
                            <FieldError>{errors.transportFee}</FieldError>
                        </Field>

                        <Field invalid={!!errors.examFee} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Exam Fee (Rs.)</FieldLabel>
                            <Input
                                type="number"
                                value={formData.examFee}
                                onChange={(e) => handleFieldChange("examFee", Number(e.target.value))}
                            />
                            <FieldError>{errors.examFee}</FieldError>
                        </Field>

                        <Field invalid={!!errors.libraryFee} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Library Fee (Rs.)</FieldLabel>
                            <Input
                                type="number"
                                value={formData.libraryFee}
                                onChange={(e) => handleFieldChange("libraryFee", Number(e.target.value))}
                            />
                            <FieldError>{errors.libraryFee}</FieldError>
                        </Field>

                        <Field invalid={!!errors.miscellaneousFee} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Miscellaneous (Rs.)</FieldLabel>
                            <Input
                                type="number"
                                value={formData.miscellaneousFee}
                                onChange={(e) => handleFieldChange("miscellaneousFee", Number(e.target.value))}
                            />
                            <FieldError>{errors.miscellaneousFee}</FieldError>
                        </Field>

                        <Field invalid={!!errors.otherFee} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Other Fees (Rs.)</FieldLabel>
                            <Input
                                type="number"
                                value={formData.otherFee}
                                onChange={(e) => handleFieldChange("otherFee", Number(e.target.value))}
                            />
                            <FieldError>{errors.otherFee}</FieldError>
                        </Field>
                    </div>

                    <DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="cursor-pointer">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? "Save Changes" : "Create Structure")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// 2. Bulk Generate Fees Dialog
export function BulkGenerateDialog({ open, onClose, structuresList, refetch }) {
    const { data: classesData } = useGetClassQuery();
    const [generateFees, { isLoading }] = useGenerateFeesForClassMutation();
    const classesList = classesData?.classes || [];

    const [formData, setFormData] = useState({
        classId: "",
        feeStructureId: "",
        academicYear: "2026-2027",
        dueDate: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setFormData({
                classId: "",
                feeStructureId: "",
                academicYear: "2026-2027",
                dueDate: "",
            });
            setErrors({});
        }
    }, [open]);

    const handleFieldChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = bulkGenerateSchema.safeParse(formData);
        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            const response = await generateFees(formData).unwrap();
            toast.success(response.message || "Fee records generated successfully!");
            if (refetch) refetch();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Generation failed");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate Fees for Class</DialogTitle>
                    <DialogDescription>Bulk assign fee structures to active students in a selected class room.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <Field invalid={!!errors.classId} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Select Class *</FieldLabel>
                        <Select value={formData.classId} onValueChange={(val) => handleFieldChange("classId", val)}>
                            <SelectTrigger className="bg-background cursor-pointer">
                                <SelectValue placeholder="Select Class Room" />
                            </SelectTrigger>
                            <SelectContent className="max-h-40 overflow-y-auto">
                                {classesList.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>Class {c.className} - {c.section}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError>{errors.classId}</FieldError>
                    </Field>

                    <Field invalid={!!errors.feeStructureId} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Select Fee Structure *</FieldLabel>
                        <Select value={formData.feeStructureId} onValueChange={(val) => handleFieldChange("feeStructureId", val)}>
                            <SelectTrigger className="bg-background cursor-pointer">
                                <SelectValue placeholder="Select Fee Structure" />
                            </SelectTrigger>
                            <SelectContent className="max-h-40 overflow-y-auto">
                                {structuresList.map((s) => (
                                    <SelectItem key={s._id} value={s._id}>
                                        Class Level {s.classLevel} ({s.academicYear}) - Rs.{s.totalFee}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError>{errors.feeStructureId}</FieldError>
                    </Field>

                    <Field invalid={!!errors.academicYear} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Academic Year *</FieldLabel>
                        <Input
                            placeholder="e.g. 2026-2027"
                            value={formData.academicYear}
                            onChange={(e) => handleFieldChange("academicYear", e.target.value)}
                        />
                        <FieldError>{errors.academicYear}</FieldError>
                    </Field>

                    <Field invalid={!!errors.dueDate} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Due Date *</FieldLabel>
                        <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                            className="bg-background cursor-pointer"
                        />
                        <FieldError>{errors.dueDate}</FieldError>
                    </Field>

                    <DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="cursor-pointer">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Fees"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// 3. Record Payment Dialog
export function RecordPaymentDialog({ open, onClose, feeRecord, refetch }) {
    const [createPayment, { isLoading }] = useCreateFeePaymentMutation();
    const [formData, setFormData] = useState({
        amount: "",
        paymentMethod: "cash",
        transactionId: "",
        remarks: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setFormData({
                amount: feeRecord ? String(feeRecord.dueAmount) : "",
                paymentMethod: "cash",
                transactionId: "",
                remarks: "",
            });
            setErrors({});
        }
    }, [open, feeRecord]);

    const handleFieldChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feeRecord) return;

        const valAmount = Number(formData.amount);
        if (valAmount > feeRecord.dueAmount) {
            setErrors((prev) => ({ ...prev, amount: "Amount cannot exceed total remaining balance" }));
            toast.error("Invalid amount paid entered");
            return;
        }

        const validation = paymentSchema.safeParse({
            studentFeeId: feeRecord._id,
            studentId: feeRecord.studentId?._id || feeRecord.studentId,
            amount: valAmount,
            paymentMethod: formData.paymentMethod,
            transactionId: formData.transactionId,
            remarks: formData.remarks,
        });

        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            const response = await createPayment({
                studentFeeId: feeRecord._id,
                studentId: feeRecord.studentId?._id || feeRecord.studentId,
                amount: valAmount,
                paymentMethod: formData.paymentMethod,
                transactionId: formData.transactionId || undefined,
                remarks: formData.remarks || undefined,
            }).unwrap();

            toast.success(response.message || "Payment recorded successfully!");
            if (refetch) refetch();
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Recording payment failed");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Record Fee Payment</DialogTitle>
                    <DialogDescription>Collect fees and log payment details for student billing.</DialogDescription>
                </DialogHeader>
                {feeRecord && (
                    <div className="bg-muted/40 border border-border p-3.5 rounded-lg text-xs space-y-1">
                        <div>Student Name: <span className="font-bold text-foreground">{feeRecord.studentId?.studentName}</span></div>
                        <div>Admission No: <span className="font-bold text-foreground">{feeRecord.studentId?.admissionNo}</span></div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-border/60 mt-1">
                            <div>Total: <span className="font-bold text-foreground">Rs.{feeRecord.totalFee}</span></div>
                            <div>Paid: <span className="font-bold text-emerald-600">Rs.{feeRecord.paidAmount}</span></div>
                            <div>Remaining: <span className="font-extrabold text-destructive">Rs.{feeRecord.dueAmount}</span></div>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 my-1">
                    <Field invalid={!!errors.amount} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Payment Amount (Rs.) *</FieldLabel>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => handleFieldChange("amount", e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <FieldError>{errors.amount}</FieldError>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field invalid={!!errors.paymentMethod} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Method *</FieldLabel>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(val) => handleFieldChange("paymentMethod", val)}
                            >
                                <SelectTrigger className="bg-background cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="bank_transfer">Net Banking</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.paymentMethod}</FieldError>
                        </Field>

                        <Field invalid={!!errors.transactionId} className="space-y-1.5">
                            <FieldLabel className="text-xs font-bold text-foreground">Transaction / Reference ID</FieldLabel>
                            <Input
                                placeholder="Ref / Txn No."
                                value={formData.transactionId}
                                onChange={(e) => handleFieldChange("transactionId", e.target.value)}
                            />
                            <FieldError>{errors.transactionId}</FieldError>
                        </Field>
                    </div>

                    <Field invalid={!!errors.remarks} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Remarks</FieldLabel>
                        <Input
                            placeholder="e.g. Paid term 1 library balance"
                            value={formData.remarks}
                            onChange={(e) => handleFieldChange("remarks", e.target.value)}
                        />
                        <FieldError>{errors.remarks}</FieldError>
                    </Field>

                    <DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="cursor-pointer">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// 4. Discount Dialog
export function DiscountDialog({ open, onClose, feeRecord, refetch }) {
    const [updateFee, { isLoading }] = useUpdateFeeMutation();
    const [discountAmount, setDiscountAmount] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setDiscountAmount(feeRecord ? String(feeRecord.discountAmount || 0) : "0");
            setError("");
        }
    }, [open, feeRecord]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feeRecord) return;

        const valDiscount = Number(discountAmount);
        if (isNaN(valDiscount) || valDiscount < 0) {
            setError("Discount must be a positive number");
            return;
        }

        if (valDiscount + feeRecord.paidAmount > feeRecord.totalFee) {
            setError("Discount combined with amount already paid cannot exceed total fee");
            return;
        }

        try {
            await updateFee({
                id: feeRecord._id,
                data: { discountAmount: valDiscount },
            }).unwrap();

            toast.success("Discount allocated successfully!");
            if (refetch) refetch();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Operation failed");
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Apply Student Discount</DialogTitle>
                    <DialogDescription>Assign a fee concession or discount to the student account.</DialogDescription>
                </DialogHeader>
                {feeRecord && (
                    <div className="bg-muted/40 border border-border p-3.5 rounded-lg text-xs space-y-1">
                        <div>Student Name: <span className="font-bold text-foreground">{feeRecord.studentId?.studentName}</span></div>
                        <div>Original Fee: <span className="font-bold text-foreground">Rs.{feeRecord.totalFee}</span></div>
                        <div>Paid So Far: <span className="font-bold text-emerald-600">Rs.{feeRecord.paidAmount}</span></div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 my-1">
                    <Field invalid={!!error} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Discount amount (Rs.) *</FieldLabel>
                        <div className="relative">
                            <Percent className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={discountAmount}
                                onChange={(e) => {
                                    setDiscountAmount(e.target.value);
                                    setError("");
                                }}
                                className="pl-8"
                            />
                        </div>
                        <FieldError>{error}</FieldError>
                    </Field>

                    <DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="cursor-pointer">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// 5. Void Payment Dialog
export function VoidPaymentDialog({ open, onClose, paymentRecord, refetch }) {
    const [voidPayment, { isLoading }] = useVoidFeePaymentMutation();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setReason("");
            setError("");
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentRecord) return;

        if (!reason.trim()) {
            setError("Void reason is required");
            return;
        }

        try {
            await voidPayment({
                id: paymentRecord._id,
                reason: reason.trim(),
            }).unwrap();

            toast.success("Transaction voided successfully!");
            if (refetch) refetch();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Operation failed");
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
                        <AlertTriangle className="h-5 w-5" /> Void Payment Transaction
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to void this payment? This will restore the student's due balance.
                    </DialogDescription>
                </DialogHeader>
                {paymentRecord && (
                    <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg text-xs space-y-1">
                        <div>Receipt No: <span className="font-bold">{paymentRecord.receiptNo}</span></div>
                        <div>Amount: <span className="font-bold">Rs.{paymentRecord.amount}</span></div>
                        <div>Student Name: <span className="font-bold">{paymentRecord.studentId?.studentName}</span></div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 my-1">
                    <Field invalid={!!error} className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">Reason to Void Transaction *</FieldLabel>
                        <Input
                            placeholder="e.g. Check bounced or Entry error"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                        />
                        <FieldError>{error}</FieldError>
                    </Field>

                    <DialogFooter className="pt-4 border-t border-border flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={isLoading} className="cursor-pointer bg-destructive hover:bg-destructive/95 text-white">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Void Transaction"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
