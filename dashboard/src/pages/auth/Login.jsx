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
import { useLoginMutation } from "@/redux/api/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { login as loginAction } from "@/redux/reducer/authReducer";

export default function Login() {
    const navigate = useNavigate();
  const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [login, { isLoading }] = useLoginMutation();

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


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const res = await login(formData).unwrap();
            console.log(res);
            dispatch(loginAction(res.user),);
            toast.success("Login successful");
            navigate("/dashboard");
        } catch (err) {
            console.log(err);
            let errorMessage = "Something went wrong";

            if (err.status) {
                switch (err.status) {
                    case 401:
                        errorMessage = "Invalid email or password";
                        break;
                    case 404:
                        errorMessage = "Email not registred";
                        break;
                    case 500:
                        errorMessage = "Something went wrong";
                        break;
                    default:
                        errorMessage = "Something went wrong";
                }
            }
            toast.error(errorMessage);
        }
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
                            disabled={isLoading}
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </Button>

                        <Button
                            type="submit"
                            className="px-8 cursor-pointer"
                            disabled={isLoading}
                        >
                            Login
                        </Button>
                    </div>
                </form>
            </CardContent>
        </AuthLayout>
    );
}