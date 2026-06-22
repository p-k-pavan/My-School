import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmDialog({ open, onClose, onConfirm, homeworkItem, isDeleting }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-6">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="flex items-center gap-2.5 text-destructive font-bold text-lg">
                        <div className="p-1.5 bg-destructive/10 rounded-md border border-destructive/20">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        Delete Homework
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground pt-1">
                        Are you absolutely sure you want to delete the homework assignment{" "}
                        <span className="font-extrabold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border">
                            {homeworkItem?.title}
                        </span>
                        ? All data associated with this homework assignment will be permanently removed. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="cursor-pointer text-xs h-9 px-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="cursor-pointer text-xs h-9 px-5 bg-destructive hover:bg-destructive/95 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Permanently"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
