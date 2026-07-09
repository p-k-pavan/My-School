import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { usePostAdmissionMutation } from "@/redux/api/admissions";
import { admissionSchema } from "@/schemas/admission.schema";
import StudentSection from "../../components/admissions/StudentSection";
import ParentSection from "../../components/admissions/ParentSection";
import ContactSection from "../../components/admissions/ContactSection";
import AddressSection from "../../components/admissions/AddressSection";

export default function AdmissionForm() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        admissionNo: "",
        studentName: "",
        classId: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        aadhaarNumber: "",
        academicYear: "",
        fatherName: "",
        motherName: "",
        fatherOccupation: "",
        motherOccupation: "",
        phoneNumber: "",
        alternatePhoneNumber: "",
        email: "",
        guardianName: "",
        guardianRelation: "",
        annualIncome: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [postAdmission, { isLoading }] = usePostAdmissionMutation();

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const validation = admissionSchema.safeParse(formData);
        
        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });
            
            setErrors(fieldErrors);
            toast.error("Please fill in all required fields correctly.");

            setTimeout(() => {
                const firstErrorKey = Object.keys(fieldErrors)[0];
                const errorElement = document.getElementById(firstErrorKey);
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    errorElement.focus({ preventScroll: true });
                }
            }, 100);
            
            return;
        }

        setErrors({});

        try {
            const response = await postAdmission(formData).unwrap();
            toast.success(response.message || "Admission created successfully");
            navigate("/admissions");
        } catch (error) {
            toast.error(
                error?.data?.message ||
                "Failed to create admission"
            );
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate(-1)}
                    className="cursor-pointer h-9 w-9 rounded-lg"
                >
                    <LucideArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                        Create New Admission
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Register a new student into the school system.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <StudentSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                />

                <ParentSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                />

                <ContactSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                />

                <AddressSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                />

                <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
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
                        {isLoading ? "Saving..." : "Create Admission"}
                    </Button>
                </div>
            </form>
        </div>
    );
}