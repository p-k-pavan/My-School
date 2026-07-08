import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LuUser, LuMail, LuKey, LuArrowLeft, LuShieldAlert } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Profile() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <LuShieldAlert className="h-12 w-12 text-destructive" />
                <h3 className="text-lg font-semibold">Not Authenticated</h3>
                <p className="text-sm text-muted-foreground">Please log in to view your profile.</p>
                <Button onClick={() => navigate("/")}>Go to Login</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer h-9 w-9 rounded-lg"
                >
                    <LuArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                        My Profile
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your account settings and credentials.
                    </p>
                </div>
            </div>

            <Card className="border border-border/80 bg-linear-to-b from-white to-neutral-50/50 dark:from-neutral-800 dark:to-neutral-850/50 shadow-md overflow-hidden relative">
                {/* Visual Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary to-purple-600"></div>
                
                <CardHeader className="pb-6 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 flex items-center justify-center text-white dark:text-black shadow-md border-2 border-background">
                            <span className="text-2xl font-black">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">{user.name}</CardTitle>
                            <CardDescription className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1 bg-muted px-2.5 py-0.5 rounded-full inline-block">
                                {user.role}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-1.5 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                                <LuUser className="h-3 w-3" /> Full Name
                            </span>
                            <div className="text-sm font-bold text-foreground">{user.name}</div>
                        </div>

                        <div className="space-y-1.5 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                                <LuMail className="h-3 w-3" /> Email Address
                            </span>
                            <div className="text-sm font-bold text-foreground">{user.email}</div>
                        </div>

                        <div className="space-y-1.5 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                                <LuKey className="h-3 w-3" /> User Account ID
                            </span>
                            <div className="text-sm font-mono text-muted-foreground select-all break-all">{user.id || user._id}</div>
                        </div>

                        <div className="space-y-1.5 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                                <LuShieldAlert className="h-3 w-3" /> Profile Status
                            </span>
                            <div className="text-sm font-bold text-success flex items-center gap-1.5">
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-success"></span>
                                Active
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
