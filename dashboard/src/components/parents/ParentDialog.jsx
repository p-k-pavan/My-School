import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit3, Loader2 } from "lucide-react";

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
    useGetParentByIdQuery,
    useUpdateParentMutation,
} from "@/redux/api/parent";
import { parentValidationSchema } from "@/schemas/parentSchema";


export default function ParentDialog({ open, onClose, parentId }) {
    const [formData, setFormData] = useState({
        fatherName: "",
        motherName: "",
        fatherOccupation: "",
        motherOccupation: "",
        annualIncome: "",
        guardianName: "",
        guardianRelation: "",
        phoneNumber: "",
        alternatePhoneNumber: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [errors, setErrors] = useState({});

    const { data: parentData, isLoading: isLoadingFetch } = useGetParentByIdQuery(parentId, {
        skip: !parentId || !open,
    });

    const [updateParent, { isLoading: isUpdating }] = useUpdateParentMutation();

    const isLoading = isLoadingFetch || isUpdating;

    useEffect(() => {
        if (open) {
            if (parentId && parentData) {
                const parent = parentData.parent || parentData;
                setFormData({
                    fatherName: parent.fatherName || "",
                    motherName: parent.motherName || "",
                    fatherOccupation: parent.fatherOccupation || "",
                    motherOccupation: parent.motherOccupation || "",
                    annualIncome: parent.annualIncome ? String(parent.annualIncome) : "",
                    guardianName: parent.guardianName || "",
                    guardianRelation: parent.guardianRelation || "",
                    phoneNumber: parent.phoneNumber || "",
                    alternatePhoneNumber: parent.alternatePhoneNumber || "",
                    email: parent.email || "",
                    address: parent.address || "",
                    city: parent.city || "",
                    state: parent.state || "",
                    pincode: parent.pincode || "",
                });
            } else if (!parentId) {
                setFormData({
                    fatherName: "",
                    motherName: "",
                    fatherOccupation: "",
                    motherOccupation: "",
                    annualIncome: "",
                    guardianName: "",
                    guardianRelation: "",
                    phoneNumber: "",
                    alternatePhoneNumber: "",
                    email: "",
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                });
            }
            setErrors({});
        }
    }, [open, parentId, parentData]);

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const validation = parentValidationSchema.safeParse(formData);

        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });
            setErrors(fieldErrors);
            toast.error("Please resolve form validation errors");
            return;
        }

        setErrors({});

        const payload = {
            fatherName: formData.fatherName.trim(),
            motherName: formData.motherName.trim(),
            fatherOccupation: formData.fatherOccupation.trim(),
            motherOccupation: formData.motherOccupation.trim(),
            annualIncome: formData.annualIncome ? Number(formData.annualIncome) : undefined,
            guardianName: formData.guardianName.trim(),
            guardianRelation: formData.guardianRelation.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            alternatePhoneNumber: formData.alternatePhoneNumber.trim(),
            email: formData.email.trim().toLowerCase(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
        };

        try {
            const response = await updateParent({
                id: parentId,
                formData: payload,
            }).unwrap();
            toast.success(response.message || "Parent details updated successfully");
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update parent details");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-primary" />
                        Edit Parent Profile
                    </DialogTitle>
                    <DialogDescription>
                        Update the personal, contact, and address details of the parent.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingFetch ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground mt-2">Loading parent profile...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 my-2">
                        {/* Section 1: Parents Names & Occupations */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field invalid={!!errors.fatherName}>
                                    <FieldLabel htmlFor="fatherName">
                                        Father's Name <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="fatherName"
                                        value={formData.fatherName}
                                        onChange={(e) => updateField("fatherName", e.target.value)}
                                        placeholder="e.g. Ramesh"
                                        aria-invalid={!!errors.fatherName}
                                    />
                                    <FieldError>{errors.fatherName}</FieldError>
                                </Field>

                                <Field invalid={!!errors.motherName}>
                                    <FieldLabel htmlFor="motherName">
                                        Mother's Name <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="motherName"
                                        value={formData.motherName}
                                        onChange={(e) => updateField("motherName", e.target.value)}
                                        placeholder="e.g. Manjula"
                                        aria-invalid={!!errors.motherName}
                                    />
                                    <FieldError>{errors.motherName}</FieldError>
                                </Field>

                                <Field invalid={!!errors.fatherOccupation}>
                                    <FieldLabel htmlFor="fatherOccupation">Father's Occupation</FieldLabel>
                                    <Input
                                        id="fatherOccupation"
                                        value={formData.fatherOccupation}
                                        onChange={(e) => updateField("fatherOccupation", e.target.value)}
                                        placeholder="e.g. Engineer"
                                        aria-invalid={!!errors.fatherOccupation}
                                    />
                                    <FieldError>{errors.fatherOccupation}</FieldError>
                                </Field>

                                <Field invalid={!!errors.motherOccupation}>
                                    <FieldLabel htmlFor="motherOccupation">Mother's Occupation</FieldLabel>
                                    <Input
                                        id="motherOccupation"
                                        value={formData.motherOccupation}
                                        onChange={(e) => updateField("motherOccupation", e.target.value)}
                                        placeholder="e.g. Teacher"
                                        aria-invalid={!!errors.motherOccupation}
                                    />
                                    <FieldError>{errors.motherOccupation}</FieldError>
                                </Field>

                                <Field invalid={!!errors.annualIncome}>
                                    <FieldLabel htmlFor="annualIncome">Annual Income</FieldLabel>
                                    <Input
                                        id="annualIncome"
                                        value={formData.annualIncome}
                                        onChange={(e) => updateField("annualIncome", e.target.value.replace(/\D/g, ""))}
                                        placeholder="e.g. 600000"
                                        aria-invalid={!!errors.annualIncome}
                                    />
                                    <FieldError>{errors.annualIncome}</FieldError>
                                </Field>
                            </div>
                        </div>

                        {/* Section 2: Guardian Details */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Guardian Information (Optional)
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field invalid={!!errors.guardianName}>
                                    <FieldLabel htmlFor="guardianName">Guardian Name</FieldLabel>
                                    <Input
                                        id="guardianName"
                                        value={formData.guardianName}
                                        onChange={(e) => updateField("guardianName", e.target.value)}
                                        placeholder="e.g. Rahul"
                                        aria-invalid={!!errors.guardianName}
                                    />
                                    <FieldError>{errors.guardianName}</FieldError>
                                </Field>

                                <Field invalid={!!errors.guardianRelation}>
                                    <FieldLabel htmlFor="guardianRelation">Guardian Relation</FieldLabel>
                                    <Input
                                        id="guardianRelation"
                                        value={formData.guardianRelation}
                                        onChange={(e) => updateField("guardianRelation", e.target.value)}
                                        placeholder="e.g. Uncle"
                                        aria-invalid={!!errors.guardianRelation}
                                    />
                                    <FieldError>{errors.guardianRelation}</FieldError>
                                </Field>
                            </div>
                        </div>

                        {/* Section 3: Contact Info */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Contact Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Field invalid={!!errors.phoneNumber}>
                                    <FieldLabel htmlFor="phoneNumber">
                                        Phone Number <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => updateField("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        placeholder="e.g. 9966332255"
                                        aria-invalid={!!errors.phoneNumber}
                                    />
                                    <FieldError>{errors.phoneNumber}</FieldError>
                                </Field>

                                <Field invalid={!!errors.alternatePhoneNumber}>
                                    <FieldLabel htmlFor="alternatePhoneNumber">Alternate Phone</FieldLabel>
                                    <Input
                                        id="alternatePhoneNumber"
                                        value={formData.alternatePhoneNumber}
                                        onChange={(e) => updateField("alternatePhoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        placeholder="e.g. 9966332277"
                                        aria-invalid={!!errors.alternatePhoneNumber}
                                    />
                                    <FieldError>{errors.alternatePhoneNumber}</FieldError>
                                </Field>

                                <Field invalid={!!errors.email}>
                                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="e.g. ramesh@email.com"
                                        aria-invalid={!!errors.email}
                                    />
                                    <FieldError>{errors.email}</FieldError>
                                </Field>
                            </div>
                        </div>

                        {/* Section 4: Address Info */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Address Information
                            </h4>
                            <div className="space-y-4">
                                <Field invalid={!!errors.address}>
                                    <FieldLabel htmlFor="address">
                                        Street Address <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        placeholder="e.g. 123 Main St, Appt 4B"
                                        aria-invalid={!!errors.address}
                                    />
                                    <FieldError>{errors.address}</FieldError>
                                </Field>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Field invalid={!!errors.city}>
                                        <FieldLabel htmlFor="city">
                                            City <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => updateField("city", e.target.value)}
                                            placeholder="e.g. Bangalore"
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
                                            value={formData.state}
                                            onChange={(e) => updateField("state", e.target.value)}
                                            placeholder="e.g. Karnataka"
                                            aria-invalid={!!errors.state}
                                        />
                                        <FieldError>{errors.state}</FieldError>
                                    </Field>

                                    <Field invalid={!!errors.pincode}>
                                        <FieldLabel htmlFor="pincode">
                                            Pincode <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="pincode"
                                            value={formData.pincode}
                                            onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="e.g. 560001"
                                            aria-invalid={!!errors.pincode}
                                        />
                                        <FieldError>{errors.pincode}</FieldError>
                                    </Field>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex items-center justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="cursor-pointer px-6"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
