import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmDialog({ open, onClose, onConfirm, feedItem, isDeleting }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 border border-border/60 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-500">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Announcement
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-2">
                        Are you sure you want to delete <span className="font-semibold text-foreground">"{feedItem?.title}"</span>? This action is permanent and cannot be undone. All attachments and view count data associated with this announcement will be permanently removed.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl h-10"
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        className="cursor-pointer rounded-xl h-10 px-5 flex items-center gap-1.5"
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Delete Permanently
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
