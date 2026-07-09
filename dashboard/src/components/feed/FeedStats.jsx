import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Pin, FileText, CheckCircle } from "lucide-react";

export default function FeedStats({ feedList = [], role, isLoading }) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: role === "parent" ? 2 : 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6 h-24 bg-muted/20 rounded-xl" />
                    </Card>
                ))}
            </div>
        );
    }

    const totalPosts = feedList.length;
    const pinnedPosts = feedList.filter((f) => f.isPinned).length;
    const draftPosts = feedList.filter((f) => f.status === "draft").length;
    const publishedPosts = totalPosts - draftPosts;

    const stats = [
        {
            title: "Total Posts",
            value: totalPosts,
            icon: Megaphone,
            color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
            show: true
        },
        {
            title: "Pinned Announcements",
            value: pinnedPosts,
            icon: Pin,
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
            show: true
        },
        {
            title: "Published",
            value: publishedPosts,
            icon: CheckCircle,
            color: "text-green-500 bg-green-50 dark:bg-green-950/30",
            show: ["admin", "management", "teacher"].includes(role)
        },
        {
            title: "Drafts",
            value: draftPosts,
            icon: FileText,
            color: "text-neutral-500 bg-neutral-50 dark:bg-neutral-900/30",
            show: ["admin", "management", "teacher"].includes(role)
        }
    ];

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {stats
                .filter((stat) => stat.show)
                .map((stat, i) => (
                    <Card key={i} className="border border-border/60 shadow-sm bg-card hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-foreground tracking-tight">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.color} transition-all`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
        </div>
    );
}
