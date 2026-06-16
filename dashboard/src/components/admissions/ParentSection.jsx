import React from "react";
import { User } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

const ParentSection = ({ formData, setFormData, errors = {}, setErrors }) => {

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
                    <User className="h-5 w-5 text-primary" />
                    Parent Information
                </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <Field invalid={!!errors.fatherName}>
                    <FieldLabel htmlFor="fatherName">
                        Father Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="fatherName"
                        value={formData.fatherName || ""}
                        onChange={(e) => updateField("fatherName", e.target.value)}
                        placeholder="Ramesh"
                        aria-invalid={!!errors.fatherName}
                    />
                    <FieldError>{errors.fatherName}</FieldError>
                </Field>

                <Field invalid={!!errors.motherName}>
                    <FieldLabel htmlFor="motherName">
                        Mother Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="motherName"
                        value={formData.motherName || ""}
                        onChange={(e) => updateField("motherName", e.target.value)}
                        placeholder="Manjula"
                        aria-invalid={!!errors.motherName}
                    />
                    <FieldError>{errors.motherName}</FieldError>
                </Field>

                <Field invalid={!!errors.fatherOccupation}>
                    <FieldLabel htmlFor="fatherOccupation">Father Occupation</FieldLabel>
                    <Input
                        id="fatherOccupation"
                        value={formData.fatherOccupation || ""}
                        onChange={(e) => updateField("fatherOccupation", e.target.value)}
                        placeholder="B.E"
                        aria-invalid={!!errors.fatherOccupation}
                    />
                    <FieldError>{errors.fatherOccupation}</FieldError>
                </Field>

                <Field invalid={!!errors.motherOccupation}>
                    <FieldLabel htmlFor="motherOccupation">Mother Occupation</FieldLabel>
                    <Input
                        id="motherOccupation"
                        value={formData.motherOccupation || ""}
                        onChange={(e) => updateField("motherOccupation", e.target.value)}
                        placeholder="Degree"
                        aria-invalid={!!errors.motherOccupation}
                    />
                    <FieldError>{errors.motherOccupation}</FieldError>
                </Field>

                <Field invalid={!!errors.annualIncome}>
                    <FieldLabel htmlFor="annualIncome">Annual Income</FieldLabel>
                    <Input
                        id="annualIncome"
                        value={formData.annualIncome || ""}
                        onChange={(e) => updateField("annualIncome", e.target.value)}
                        placeholder="600000"
                        aria-invalid={!!errors.annualIncome}
                    />
                    <FieldError>{errors.annualIncome}</FieldError>
                </Field>

                <Field invalid={!!errors.guardianName}>
                    <FieldLabel htmlFor="guardianName">Guardian Name</FieldLabel>
                    <Input
                        id="guardianName"
                        value={formData.guardianName || ""}
                        onChange={(e) => updateField("guardianName", e.target.value)}
                        placeholder="Rahul"
                        aria-invalid={!!errors.guardianName}
                    />
                    <FieldError>{errors.guardianName}</FieldError>
                </Field>

                <Field invalid={!!errors.guardianRelation}>
                    <FieldLabel htmlFor="guardianRelation">Guardian Relation</FieldLabel>
                    <Input
                        id="guardianRelation"
                        value={formData.guardianRelation || ""}
                        onChange={(e) => updateField("guardianRelation", e.target.value)}
                        placeholder="Uncle"
                        aria-invalid={!!errors.guardianRelation}
                    />
                    <FieldError>{errors.guardianRelation}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
};

export default ParentSection;
