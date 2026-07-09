import React from "react";
import { Contact } from "lucide-react";
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

const ContactSection = ({ formData, setFormData, errors = {}, setErrors }) => {

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
                    <Contact className="h-5 w-5 text-primary" />
                    Contact Information
                </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field invalid={!!errors.phoneNumber}>
                    <FieldLabel htmlFor="phoneNumber">
                        Phone Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={(e) => updateField("phoneNumber", e.target.value)}
                        placeholder="9966332255"
                        maxLength={10}
                        aria-invalid={!!errors.phoneNumber}
                    />
                    <FieldError>{errors.phoneNumber}</FieldError>
                </Field>

                <Field invalid={!!errors.alternatePhoneNumber}>
                    <FieldLabel htmlFor="alternatePhoneNumber">Alternate Phone Number</FieldLabel>
                    <Input
                        id="alternatePhoneNumber"
                        value={formData.alternatePhoneNumber || ""}
                        onChange={(e) => updateField("alternatePhoneNumber", e.target.value)}
                        placeholder="9966332277"
                        maxLength={10}
                        aria-invalid={!!errors.alternatePhoneNumber}
                    />
                    <FieldError>{errors.alternatePhoneNumber}</FieldError>
                </Field>

                <Field invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        value={formData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="ramesh@email.com"
                        aria-invalid={!!errors.email}
                    />
                    <FieldError>{errors.email}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
};

export default ContactSection;
