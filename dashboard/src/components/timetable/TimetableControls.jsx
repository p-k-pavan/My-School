import React from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function TimetableControls({
    selectedClass,
    setSelectedClass,
    academicYear,
    setAcademicYear,
    classesList,
}) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Select Class Room</span>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-45 bg-background">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classesList.map((cls) => (
                                <SelectItem key={cls._id} value={cls._id}>
                                    Class {cls.className} - {cls.section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Academic Year</span>
                    <Input
                        placeholder="e.g. 2026-2027"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="bg-background w-35"
                    />
                </div>
            </div>
        </div>
    );
}
