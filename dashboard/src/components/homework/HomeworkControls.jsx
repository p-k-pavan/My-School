import React from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function HomeworkControls({
    classesList,
    selectedClassId,
    setSelectedClassId,
    assignedDate,
    setAssignedDate,
    searchQuery,
    setSearchQuery,
    classesLoading,
}) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                {/* Class Selector */}
                <div className="w-full sm:w-64">
                    <Select
                        value={selectedClassId || ""}
                        onValueChange={setSelectedClassId}
                        disabled={classesLoading}
                    >
                        <SelectTrigger className="bg-background w-full cursor-pointer">
                            <SelectValue placeholder={classesLoading ? "Loading classes..." : "Select Class"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            {classesList.map((cls) => (
                                <SelectItem key={cls._id} value={cls._id}>
                                    Class {cls.className} - {cls.section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative w-full sm:w-48">
                    <Input
                        type="date"
                        value={assignedDate}
                        onChange={(e) => setAssignedDate(e.target.value)}
                        className="bg-background w-full pl-3 cursor-pointer"
                    />
                </div>
            </div>

            <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search homework by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background w-full"
                />
            </div>
        </div>
    );
}
