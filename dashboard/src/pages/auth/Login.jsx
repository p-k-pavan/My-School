import AuthLayout from "@/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        if (!formData.password) {
            toast.error("Password is required");
            return false;
        }

        return true;
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log("Login submitted");
    };

    return (
        <AuthLayout
            title="Login to your account"
            description="Enter your email and password to continue"
        >
            <CardContent>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <FieldGroup>

                        <Field>
                            <FieldLabel htmlFor="email">
                                Email
                            </FieldLabel>

                            <Input
                                id="email"
                                type="email"
                                placeholder="jordan@email.com"
                                onChange={handleChange}
                                value={formData.email}
                            />
                        </Field>

                        <Field>
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>


                            </div>

                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                onChange={handleChange}
                                value={formData.password}
                            />
                        </Field>

                    </FieldGroup>
                    <div className="flex items-center justify-between">
                        <Button
                            variant="link"
                            className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary text-end cursor-pointer"
                            type="button"
                        >
                            Forgot Password?
                        </Button>

                        <Button
                            type="submit"
                            className="px-8 cursor-pointer"
                        >
                            Login
                        </Button>
                    </div>
                </form>
            </CardContent>
        </AuthLayout>
    );
}