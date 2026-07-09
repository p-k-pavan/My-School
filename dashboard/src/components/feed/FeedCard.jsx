import React from "react";
import {
    Pin,
    Eye,
    Download,
    FileText,
    Image,
    Video,
    FileCode,
    FileSpreadsheet,
    File,
    Edit3,
    Trash2,
    Calendar,
    User,
    Users
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatDistanceToNowCustom = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    return "just now";
};

const formatDateFull = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatDateShort = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });
};

export default function FeedCard({ feed, role, currentUserId, onEdit, onDelete, onPin, onUnpin }) {
    const isCreator = feed.createdBy?._id === currentUserId || feed.createdBy === currentUserId;
    const isAdmin = ["admin", "management"].includes(role);
    const canManage = isCreator || isAdmin;

    const getAttachmentUrl = (path) => {
        if (!path) return "#";
        if (path.startsWith("http")) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");
        return `${baseUrl}/${path}`;
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case "image":
                return <Image className="h-3.5 w-3.5 text-sky-500" />;
            case "video":
                return <Video className="h-3.5 w-3.5 text-rose-500" />;
            case "pdf":
                return <FileText className="h-3.5 w-3.5 text-emerald-500" />;
            case "xlsx":
                return <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />;
            case "doc":
            case "docx":
                return <FileText className="h-3.5 w-3.5 text-blue-500" />;
            case "ppt":
                return <FileCode className="h-3.5 w-3.5 text-orange-500" />;
            default:
                return <File className="h-3.5 w-3.5 text-neutral-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const formattedDate = feed.createdAt ? formatDistanceToNowCustom(feed.createdAt) : "";
    const fullDate = feed.createdAt ? formatDateFull(feed.createdAt) : "";
    const isExpired = feed.expiresAt && new Date(feed.expiresAt) <= new Date();

    return (
        <Card className={`relative overflow-hidden border border-border bg-card rounded-xl shadow-2xs hover:shadow-sm transition-all duration-200 ${feed.isPinned ? "ring-1 ring-amber-500/20" : ""}`}>
            {feed.isPinned && (
                <div className="absolute top-0 right-0 left-0 bg-amber-500/10 px-4 py-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 border-b border-amber-500/20 uppercase tracking-wider">
                    <Pin className="h-3 w-3 fill-amber-600" /> Pinned Announcement
                </div>
            )}

            <CardContent className={`p-5 ${feed.isPinned ? "pt-9" : ""}`}>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-border overflow-hidden shrink-0">
                            {feed.createdBy?.profilePhoto ? (
                                <img
                                    src={getAttachmentUrl(feed.createdBy.profilePhoto)}
                                    alt={feed.createdBy.name || "User"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-4.5 w-4.5 text-neutral-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">
                                {feed.createdBy?.name || "Unknown Author"}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                <span className="uppercase px-1.5 py-0.5 rounded bg-muted font-semibold text-[10px] text-muted-foreground tracking-wider">
                                    {feed.createdBy?.role || "staff"}
                                </span>
                                <span>•</span>
                                <span title={fullDate} className="text-[11px]">{formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {feed.status === "draft" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 uppercase tracking-wider">
                                Draft
                            </span>
                        )}

                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${
                            feed.visibility === "all"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : feed.visibility === "teachers"
                                ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                : feed.visibility === "classes"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                            {feed.visibility === "all" && "All"}
                            {feed.visibility === "teachers" && "Teachers"}
                            {feed.visibility === "classes" && `Classes (${feed.targetClasses?.length || 0})`}
                            {feed.visibility === "individual_students" && "Students"}
                        </span>

                        {isExpired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                                Expired
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-3.5 space-y-1.5">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                        {feed.title}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {feed.description}
                    </p>
                </div>

                {["admin", "management", "teacher"].includes(role) && feed.visibility === "classes" && feed.targetClasses?.length > 0 && (
                    <div className="mt-3 py-1.5 px-3 bg-muted/30 rounded-lg flex items-center gap-2 text-xs text-muted-foreground border border-border/50">
                        <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <div>
                            <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mr-1">Target:</span>
                            <span className="font-semibold text-foreground/90">
                                {feed.targetClasses.map((c) => `${c.className}-${c.section}`).join(", ")}
                            </span>
                        </div>
                    </div>
                )}


                {feed.attachments && feed.attachments.length > 0 && (() => {
                    const media = feed.attachments.filter(f => f.fileType === "image" || f.fileType === "video");
                    const docs = feed.attachments.filter(f => f.fileType !== "image" && f.fileType !== "video");
                    return (
                        <div className="space-y-3.5">
                            {media.length > 0 && (
                                <div className="space-y-2">
                                    {media.map((file, idx) => (
                                        <div key={idx} className="rounded-lg overflow-hidden border border-border bg-black/5 dark:bg-white/5 max-h-100 flex items-center justify-center">
                                            {file.fileType === "image" ? (
                                                <img
                                                    src={getAttachmentUrl(file.fileUrl)}
                                                    alt={file.fileName}
                                                    className="max-h-100 w-auto object-contain hover:scale-[1.01] transition-transform duration-200"
                                                />
                                            ) : (
                                                <video
                                                    src={getAttachmentUrl(file.fileUrl)}
                                                    controls
                                                    className="max-h-100 w-full object-contain"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {docs.length > 0 && (
                                <div className="pt-3 border-t border-border/60 space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Attachments ({docs.length})
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {docs.map((file, i) => (
                                            <a
                                                key={i}
                                                href={getAttachmentUrl(file.fileUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/10 hover:bg-muted/40 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 mr-2">
                                                    <div className="p-1 rounded bg-background border border-border shrink-0">
                                                        {getFileIcon(file.fileType)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {file.fileName}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                            {formatFileSize(file.fileSize)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Download className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary shrink-0 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </CardContent>

            <CardFooter className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{feed.viewCount || 0} views</span>
                    {feed.expiresAt && (
                        <>
                            <span className="mx-1">•</span>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Expires {formatDateShort(feed.expiresAt)}</span>
                        </>
                    )}
                </div>

                {canManage && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => (feed.isPinned ? onUnpin(feed._id) : onPin(feed._id))}
                            className="h-7 text-xs font-semibold text-muted-foreground hover:text-amber-500 cursor-pointer"
                        >
                            <Pin className={`h-3 w-3 mr-1 ${feed.isPinned ? "fill-amber-500 text-amber-500" : ""}`} />
                            {feed.isPinned ? "Unpin" : "Pin"}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(feed)}
                            className="text-muted-foreground hover:text-primary cursor-pointer"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(feed)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
