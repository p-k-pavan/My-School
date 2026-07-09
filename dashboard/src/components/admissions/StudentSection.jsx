import React from "react";
import { Info } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

const StudentSection = ({ formData, setFormData, errors = {}, setErrors }) => {

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (setErrors && errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    return (
        <Card className="shadow-xs border border-border">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Info className="h-5 w-5 text-primary" />
                    Student Information
                </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <Field invalid={!!errors.admissionNo}>
                    <FieldLabel htmlFor="admissionNo">
                        Admission Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="admissionNo"
                        value={formData.admissionNo || ""}
                        onChange={(e) => updateField("admissionNo", e.target.value)}
                        placeholder="ADM2026-001"
                        aria-invalid={!!errors.admissionNo}
                    />
                    <FieldError>{errors.admissionNo}</FieldError>
                </Field>

                <Field invalid={!!errors.studentName}>
                    <FieldLabel htmlFor="studentName">
                        Student Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="studentName"
                        value={formData.studentName || ""}
                        onChange={(e) => updateField("studentName", e.target.value)}
                        placeholder="Pavan Kumar R"
                        aria-invalid={!!errors.studentName}
                    />
                    <FieldError>{errors.studentName}</FieldError>
                </Field>

                <Field invalid={!!errors.classId}>
                    <FieldLabel htmlFor="classId">
                        Class <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="classId"
                        value={formData.classId || ""}
                        onChange={(e) => updateField("classId", e.target.value)}
                        placeholder="Class ID"
                        aria-invalid={!!errors.classId}
                    />
                    <FieldError>{errors.classId}</FieldError>
                </Field>

                <Field invalid={!!errors.dob}>
                    <FieldLabel htmlFor="dob">
                        Date of Birth <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="dob"
                        type="date"
                        value={formData.dob || ""}
                        onChange={(e) => updateField("dob", e.target.value)}
                        aria-invalid={!!errors.dob}
                        className="cursor-pointer animate-none"
                    />
                    <FieldError>{errors.dob}</FieldError>
                </Field>

                <Field invalid={!!errors.gender}>
                    <FieldLabel htmlFor="gender">
                        Gender <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                        value={formData.gender || ""}
                        onValueChange={(value) => updateField("gender", value)}
                    >
                        <SelectTrigger id="gender" aria-invalid={!!errors.gender} className="cursor-pointer w-full">
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{errors.gender}</FieldError>
                </Field>

                <Field invalid={!!errors.bloodGroup}>
                    <FieldLabel htmlFor="bloodGroup">Blood Group</FieldLabel>
                    <Select
                        value={formData.bloodGroup || ""}
                        onValueChange={(value) => updateField("bloodGroup", value)}
                    >
                        <SelectTrigger id="bloodGroup" aria-invalid={!!errors.bloodGroup} className="cursor-pointer w-full">
                            <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{errors.bloodGroup}</FieldError>
                </Field>

                <Field invalid={!!errors.aadhaarNumber}>
                    <FieldLabel htmlFor="aadhaarNumber">Aadhaar Number</FieldLabel>
                    <Input
                        id="aadhaarNumber"
                        value={formData.aadhaarNumber || ""}
                        onChange={(e) => updateField("aadhaarNumber", e.target.value)}
                        placeholder="123456789012"
                        maxLength={12}
                        aria-invalid={!!errors.aadhaarNumber}
                    />
                    <FieldError>{errors.aadhaarNumber}</FieldError>
                </Field>

                <Field invalid={!!errors.academicYear}>
                    <FieldLabel htmlFor="academicYear">
                        Academic Year <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="academicYear"
                        value={formData.academicYear || ""}
                        onChange={(e) => updateField("academicYear", e.target.value)}
                        placeholder="2026-2027"
                        aria-invalid={!!errors.academicYear}
                    />
                    <FieldError>{errors.academicYear}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
};

export default StudentSection;
