import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeading from "@/layout/PageHeading";
import { Button } from "@/components/ui/button";

import {
    useGetParentsQuery,
    useUpdateParentStatusMutation,
} from "@/redux/api/parent";

import ParentStats from "@/components/parents/ParentStats";
import ParentControls from "@/components/parents/ParentControls";
import ParentSkeleton from "@/components/parents/ParentSkeleton";
import ParentTable from "@/components/parents/ParentTable";
import ParentDialog from "@/components/parents/ParentDialog";

export default function Parents() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);

    const [openParentDialog, setOpenParentDialog] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState(null);

    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    
    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setPage(1);
    };

    const { data, isLoading, error } = useGetParentsQuery({
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
    });

    const [updateParentStatus, { isLoading: isUpdatingStatus }] = useUpdateParentStatusMutation();

    const parentsList = data?.parents || [];
    const pagination = data?.pagination || {};
    const totalPages = pagination.totalPages || 1;
    const currentPage = pagination.currentPage || 1;
    const totalActive = pagination.totalActive || 0;
    const totalInactive = pagination.totalInactive || 0;
    const totalParents = totalActive + totalInactive;

    const handleEdit = (parent) => {
        setSelectedParentId(parent._id);
        setOpenParentDialog(true);
    };

    const handleToggleStatus = async (parent) => {
        try {
            await updateParentStatus({
                id: parent._id,
                status: !parent.status,
            }).unwrap();
            
            toast.success(`Parent status updated successfully`);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update parent status");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Parents"
                description="Manage parent profiles, contact details, and account statuses."
            />

            <ParentStats
                totalParents={totalParents}
                activeParents={totalActive}
                inactiveParents={totalInactive}
                isLoading={isLoading}
            />

            <ParentControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={handleStatusFilterChange}
            />

            {isLoading ? (
                <ParentSkeleton viewMode="table" />
            ) : error ? (
                <div className="flex flex-col items-center justify-center border border-destructive/20 rounded-2xl bg-destructive/5 py-12 px-4 text-center">
                    <p className="text-sm font-medium text-destructive">
                        Failed to load parents data. Please try again later.
                    </p>
                </div>
            ) : parentsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border border-dashed rounded-2xl bg-card py-16 px-4 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <Users className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No parents found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {searchQuery || statusFilter !== "all"
                            ? "No results match your active search or status filters. Try clearing filters or searching another term."
                            : "Parents are automatically registered when students are admitted. To add a parent, create a student admission record."}
                    </p>
                    {searchQuery || statusFilter !== "all" ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setPage(1);
                            }}
                            className="cursor-pointer"
                        >
                            Reset Filters
                        </Button>
                    ) : (
                        <Button onClick={() => navigate("/admissions/new")} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> Go to Admissions
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <ParentTable
                        parents={parentsList}
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                        isTogglingStatus={isUpdatingStatus}
                    />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
                            <p className="text-sm text-muted-foreground">
                                Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                                <span className="font-semibold text-foreground">{totalPages}</span>
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="cursor-pointer flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="cursor-pointer flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ParentDialog
                open={openParentDialog}
                onClose={() => {
                    setOpenParentDialog(false);
                    setSelectedParentId(null);
                }}
                parentId={selectedParentId}
            />
        </div>
    );
}