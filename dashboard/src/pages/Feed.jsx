import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Megaphone, Search, SlidersHorizontal, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
    useGetAllFeedPostQuery,
    useDeleteFeedPostMutation,
    usePinFeedPostMutation,
    useUnpinFeedPostMutation
} from "@/redux/api/feed";

import FeedStats from "@/components/feed/FeedStats";
import FeedCard from "@/components/feed/FeedCard";
import FeedDialog from "@/components/feed/FeedDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function Feed() {
    const { user } = useSelector((state) => state.auth);
    const role = user?.role;
    const currentUserId = user?.id || user?._id;

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [visibilityFilter, setVisibilityFilter] = useState("all_scopes");

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [feedToDelete, setFeedToDelete] = useState(null);

    const { data, isLoading, isFetching } = useGetAllFeedPostQuery({ page, limit });
    const [deleteFeed, { isLoading: isDeleting }] = useDeleteFeedPostMutation();
    const [pinFeed] = usePinFeedPostMutation();
    const [unpinFeed] = useUnpinFeedPostMutation();

    const feedList = data?.feed || [];
    const totalCount = data?.totalCount || 0;
    const totalPages = data?.totalPages || 1;

    const filteredFeeds = feedList.filter((post) => {
        const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = post.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const creatorMatch = post.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const searchMatches = titleMatch || descMatch || creatorMatch;

        const statusMatches = statusFilter === "all" || post.status === statusFilter;
        
        const visibilityMatches =
            visibilityFilter === "all_scopes" || post.visibility === visibilityFilter;

        return searchMatches && statusMatches && visibilityMatches;
    });

    const handleAddNew = () => {
        setSelectedFeed(null);
        setOpenDialog(true);
    };

    const handleEdit = (feed) => {
        setSelectedFeed(feed);
        setOpenDialog(true);
    };

    const handleDeleteClick = (feed) => {
        setFeedToDelete(feed);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!feedToDelete) return;
        try {
            const response = await deleteFeed(feedToDelete._id).unwrap();
            toast.success(response.message || "Announcement deleted successfully");
            setDeleteConfirmOpen(false);
            setFeedToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete announcement");
            console.error(error);
        }
    };

    const handlePin = async (id) => {
        try {
            const response = await pinFeed(id).unwrap();
            toast.success(response.message || "Announcement pinned successfully");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to pin announcement");
            console.error(error);
        }
    };

    const handleUnpin = async (id) => {
        try {
            const response = await unpinFeed(id).unwrap();
            toast.success(response.message || "Announcement unpinned successfully");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to unpin announcement");
            console.error(error);
        }
    };

    const canCreate = ["admin", "management", "teacher"].includes(role);

    return (
        <div className="space-y-6">
            <PageHeading
                title="School Feed"
                description="Stay updated with the latest announcements, homework details, and news."
                showAddNew={canCreate}
                onAddNew={handleAddNew}
            />

            <FeedStats
                feedList={feedList}
                role={role}
                isLoading={isLoading}
            />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search posts by title, description, or creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full bg-background"
                    />
                </div>

                {["admin", "management", "teacher"].includes(role) && (
                    <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span>Filters:</span>
                        </div>

                        <div className="w-36">
                            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                                <SelectTrigger className="cursor-pointer bg-background">
                                    <SelectValue placeholder="Scope" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border border-border">
                                    <SelectItem value="all_scopes">All Scopes</SelectItem>
                                    <SelectItem value="all">Public</SelectItem>
                                    <SelectItem value="teachers">Teachers</SelectItem>
                                    <SelectItem value="classes">Classes</SelectItem>
                                    <SelectItem value="individual_students">Students</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-32">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="cursor-pointer bg-background">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border border-border">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Drafts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading announcements feed...</p>
                </div>
            ) : filteredFeeds.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border border-dashed rounded-3xl bg-card py-20 px-4 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <Megaphone className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">No announcements found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {searchQuery || statusFilter !== "all" || visibilityFilter !== "all_scopes"
                            ? "No results match your selected filters or search terms. Try resetting them."
                            : "There are no active announcements in the feed right now."}
                    </p>
                    {(searchQuery || statusFilter !== "all" || visibilityFilter !== "all_scopes") ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setVisibilityFilter("all_scopes");
                            }}
                            className="cursor-pointer rounded-xl h-9"
                        >
                            Reset Filters
                        </Button>
                    ) : canCreate ? (
                        <Button onClick={handleAddNew} className="cursor-pointer rounded-xl h-9">
                            Create First Announcement
                        </Button>
                    ) : null}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Fetching overlay */}
                    {isFetching && (
                        <div className="flex items-center justify-center py-2 text-xs font-semibold text-muted-foreground bg-muted/20 border border-border/40 rounded-xl">
                            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                            Updating feed list...
                        </div>
                    )}
                    
                    <div className="grid gap-5">
                        {filteredFeeds.map((feed) => (
                            <FeedCard
                                key={feed._id}
                                feed={feed}
                                role={role}
                                currentUserId={currentUserId}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onPin={handlePin}
                                onUnpin={handleUnpin}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-xs font-medium text-muted-foreground">
                                Showing page {page} of {totalPages} ({totalCount} total posts)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="cursor-pointer rounded-xl"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="cursor-pointer rounded-xl"
                                >
                                    Next <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dialogs */}
            <FeedDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                feedData={selectedFeed}
            />

            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Announcement"
                itemName={feedToDelete ? `"${feedToDelete.title}"` : ""}
                description={
                    feedToDelete ? (
                        <>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{feedToDelete?.title}"</span>? This action is permanent and cannot be undone. All attachments and view count data associated with this announcement will be permanently removed.
                        </>
                    ) : null
                }
                confirmText="Delete Permanently"
                isDeleting={isDeleting}
            />
        </div>
    );
}
