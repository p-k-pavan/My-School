import React from "react";
import { Locate } from "lucide-react";
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

const AddressSection = ({ formData, setFormData, errors = {}, setErrors }) => {

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
                    <Locate className="h-5 w-5 text-primary" />
                    Address Information
                </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field invalid={!!errors.address} className="md:col-span-3">
                    <FieldLabel htmlFor="address">
                        Address <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="House No 124, Ittina Nagar, 5th Cross, Near SRS, Jigani"
                        aria-invalid={!!errors.address}
                    />
                    <FieldError>{errors.address}</FieldError>
                </Field>

                <Field invalid={!!errors.city}>
                    <FieldLabel htmlFor="city">
                        City <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Bangalore"
                        aria-invalid={!!errors.city}
                    />
                    <FieldError>{errors.city}</FieldError>
                </Field>

                <Field invalid={!!errors.state}>
                    <FieldLabel htmlFor="state">
                        State <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="state"
                        value={formData.state || ""}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="Karnataka"
                        aria-invalid={!!errors.state}
                    />
                    <FieldError>{errors.state}</FieldError>
                </Field>

                <Field invalid={!!errors.pincode}>
                    <FieldLabel htmlFor="pincode">
                        Pin Code <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        id="pincode"
                        value={formData.pincode || ""}
                        onChange={(e) => updateField("pincode", e.target.value)}
                        placeholder="560105"
                        maxLength={6}
                        aria-invalid={!!errors.pincode}
                    />
                    <FieldError>{errors.pincode}</FieldError>
                </Field>
            </CardContent>
        </Card>
    );
};

export default AddressSection;
