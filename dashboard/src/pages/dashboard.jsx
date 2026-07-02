import React from "react";
import { useSelector } from "react-redux";
import { useGetDashboardOverviewQuery } from "@/redux/api/dashboard";
import PageHeading from "@/layout/PageHeading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    Briefcase,
    School,
    HeartHandshake,
    IndianRupee,
    TrendingUp,
    Bell,
    UserPlus,
    CreditCard,
    ArrowUpRight,
    Calendar,
    Activity
} from "lucide-react";

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const greetingName = user?.name || "Administrator";
    const userRole = user?.role || "admin";

    const { data: responseData, isLoading, isError, refetch } = useGetDashboardOverviewQuery();
    const stats = responseData?.data;

    // Helper to format currency in INR
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Helper to format Date
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Helper to format Date with Time
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Get greeting message based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    // Loading State Skeleton
    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                        <div className="h-4 w-96 bg-neutral-100 dark:bg-neutral-800 rounded-lg"></div>
                    </div>
                </div>

                {/* KPI Skeletons */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                                <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="h-8 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
                                <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Progress / Chart Skeletons */}
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2].map((i) => (
                        <Card key={i} className="border border-border bg-card">
                            <CardHeader>
                                <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                                <div className="h-3 w-56 bg-neutral-100 dark:bg-neutral-800 rounded mt-1"></div>
                            </CardHeader>
                            <CardContent className="h-48 flex items-center justify-center">
                                <div className="h-32 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 max-w-md text-center">
                    <h3 className="font-bold text-lg mb-1">Failed to load statistics</h3>
                    <p className="text-sm">There was a problem communicating with the server. Please check your connection and try again.</p>
                </div>
                <button
                    onClick={refetch}
                    className="px-5 py-2.5 bg-black text-white hover:bg-neutral-850 dark:bg-white dark:text-black dark:hover:bg-neutral-100 font-bold rounded-lg text-sm transition-all cursor-pointer shadow-sm"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const {
        counts = {},
        feesOverview = {},
        attendanceToday = {},
        recentAdmissions = [],
        recentPayments = [],
        recentFeed = [],
        classWiseDistribution = []
    } = stats || {};

    // Calculate dynamic rates
    const maxClassStrength = Math.max(...classWiseDistribution.map(c => c.studentCount), 1);
    const feeCollectionRate = feesOverview.totalExpected > 0
        ? Math.round((feesOverview.totalPaid / feesOverview.totalExpected) * 100)
        : 0;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                        {getGreeting()}, {greetingName}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Here is a summary of your school's current operations, financial stats, and activities.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-card border border-border rounded-xl shadow-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                        {formatDate(new Date())}
                    </span>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Students Card */}
                <Card className="border border-border bg-card shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Students</CardTitle>
                        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-border/80">
                            <Users className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-extrabold tracking-tight text-foreground">
                            {counts.totalStudents || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                            {counts.activeStudents || 0} Active Students
                        </p>
                    </CardContent>
                </Card>

                {/* Teachers Card */}
                <Card className="border border-border bg-card shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Teachers</CardTitle>
                        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-border/80">
                            <Briefcase className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-extrabold tracking-tight text-foreground">
                            {counts.totalTeachers || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                            {counts.activeTeachers || 0} Active Teachers
                        </p>
                    </CardContent>
                </Card>

                {/* Classes Card */}
                <Card className="border border-border bg-card shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Classes</CardTitle>
                        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-border/80">
                            <School className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-extrabold tracking-tight text-foreground">
                            {counts.totalClasses || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active sections & class groups
                        </p>
                    </CardContent>
                </Card>

                {/* Parents Card */}
                <Card className="border border-border bg-card shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Parents</CardTitle>
                        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-border/80">
                            <HeartHandshake className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-3xl font-extrabold tracking-tight text-foreground">
                            {counts.totalParents || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Associated family contacts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Status & Attendance Rings */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Financial Insights Card */}
                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-primary" />
                            Financial Insights
                        </CardTitle>
                        <CardDescription>Fee collection progress and breakdowns</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-8 justify-around">
                            {/* SVG Gauge */}
                            <div className="relative flex items-center justify-center">
                                <svg className="w-36 h-36 transform -rotate-90">
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        className="stroke-neutral-100 dark:stroke-neutral-800 fill-transparent"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        className="stroke-success fill-transparent transition-all duration-500"
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 60}
                                        strokeDashoffset={((100 - feeCollectionRate) / 100) * (2 * Math.PI * 60)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-foreground">{feeCollectionRate}%</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Collected</span>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4 w-full sm:w-auto min-w-[180px]">
                                <div className="border-b border-border/40 pb-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Expected</span>
                                    <div className="text-xl font-extrabold text-foreground">{formatCurrency(feesOverview.totalExpected)}</div>
                                </div>
                                <div className="border-b border-border/40 pb-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Collected</span>
                                    <div className="text-xl font-extrabold text-success">{formatCurrency(feesOverview.totalCollected)}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Pending</span>
                                    <div className="text-xl font-extrabold text-danger">{formatCurrency(feesOverview.totalDue)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown bar */}
                        <div className="mt-8 space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Collection Methods</span>
                            <div className="grid grid-cols-5 gap-2.5 text-center">
                                {Object.entries(feesOverview.collectedByMethod || {}).map(([method, val]) => (
                                    <div key={method} className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-lg border border-border/60">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground truncate">{method.replace("_", " ")}</div>
                                        <div className="text-xs font-extrabold text-foreground mt-1 truncate">{formatCurrency(val)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Rate Card */}
                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Attendance Rate
                        </CardTitle>
                        <CardDescription>
                            {attendanceToday.date
                                ? `Statistics for class registers dated ${formatDate(attendanceToday.date)}`
                                : "No attendance record currently found"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-8 justify-around">
                            {/* SVG Gauge */}
                            <div className="relative flex items-center justify-center">
                                <svg className="w-36 h-36 transform -rotate-90">
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        className="stroke-neutral-100 dark:stroke-neutral-800 fill-transparent"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        className="stroke-primary fill-transparent transition-all duration-500"
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 60}
                                        strokeDashoffset={((100 - (attendanceToday.attendanceRate || 0)) / 100) * (2 * Math.PI * 60)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-foreground">{attendanceToday.attendanceRate || 0}%</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Present Rate</span>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4 w-full sm:w-auto min-w-[180px]">
                                <div className="border-b border-border/40 pb-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Students Present</span>
                                    <div className="text-xl font-extrabold text-foreground">{attendanceToday.presentCount || 0}</div>
                                </div>
                                <div className="border-b border-border/40 pb-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Students Absent</span>
                                    <div className="text-xl font-extrabold text-danger">{attendanceToday.absentCount || 0}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Late / Half Day</span>
                                    <div className="text-xl font-extrabold text-warning">
                                        {(attendanceToday.lateCount || 0) + (attendanceToday.halfDayCount || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual counts */}
                        <div className="mt-8 space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Roll breakdown</span>
                            <div className="grid grid-cols-4 gap-2.5 text-center">
                                <div className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-lg border border-border/60">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Present</div>
                                    <div className="text-xs font-extrabold text-success mt-1">{attendanceToday.presentCount || 0}</div>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-lg border border-border/60">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Absent</div>
                                    <div className="text-xs font-extrabold text-danger mt-1">{attendanceToday.absentCount || 0}</div>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-lg border border-border/60">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Late</div>
                                    <div className="text-xs font-extrabold text-warning mt-1">{attendanceToday.lateCount || 0}</div>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-lg border border-border/60">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Half Day</div>
                                    <div className="text-xs font-extrabold text-amber-600 mt-1">{attendanceToday.halfDayCount || 0}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split layout: Recent Activities & Class Distribution */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Columns - Activities (Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Payments */}
                    <Card className="border border-border bg-card shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-black flex items-center gap-2">
                                <CreditCard className="h-4.5 w-4.5 text-success" />
                                Recent Fee Receipts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentPayments.length === 0 ? (
                                <div className="p-6 text-center text-xs text-muted-foreground">
                                    No transaction receipts found in this system.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentPayments.map((payment) => (
                                        <div key={payment._id} className="flex justify-between items-center p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success text-xs font-black">
                                                    ₹
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-xs">
                                                        {payment.studentId?.studentName || "Unknown Student"}
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        Class {payment.studentId?.classId?.className || "N/A"}-{payment.studentId?.classId?.section || "N/A"} • Ref: {payment.receiptNo || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-extrabold text-foreground">
                                                    +{formatCurrency(payment.amount)}
                                                </span>
                                                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                                                    {payment.paymentMethod}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Admissions */}
                    <Card className="border border-border bg-card shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-black flex items-center gap-2">
                                <UserPlus className="h-4.5 w-4.5 text-primary" />
                                Recent Admissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentAdmissions.length === 0 ? (
                                <div className="p-6 text-center text-xs text-muted-foreground">
                                    No student admissions found.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentAdmissions.map((student) => (
                                        <div key={student._id} className="flex justify-between items-center p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                                {student.profilePhoto ? (
                                                    <img
                                                        src={student.profilePhoto.startsWith("http") ? student.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}/${student.profilePhoto}`}
                                                        alt={student.studentName}
                                                        className="w-9 h-9 rounded-full object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
                                                        {student.studentName?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground">
                                                        {student.studentName}
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        Class {student.classId?.className || "N/A"}-{student.classId?.section || "N/A"} • Reg: {student.admissionNo}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-semibold text-muted-foreground">
                                                    Joined
                                                </span>
                                                <p className="text-xs font-bold text-foreground mt-0.5">
                                                    {formatDate(student.joiningDate)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Circulars / School Feed */}
                    <Card className="border border-border bg-card shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-black flex items-center gap-2">
                                <Bell className="h-4.5 w-4.5 text-warning" />
                                Announcements & Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentFeed.length === 0 ? (
                                <div className="p-6 text-center text-xs text-muted-foreground">
                                    No announcements published.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentFeed.map((post) => (
                                        <div key={post._id} className="p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-all duration-200">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-foreground line-clamp-1">
                                                        {post.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {post.description}
                                                    </p>
                                                </div>
                                                <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground whitespace-nowrap bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-border/50">
                                                    {formatDate(post.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                                                <span>Posted by: <strong className="font-bold text-foreground">{post.createdBy?.name || "School Office"}</strong></span>
                                                {post.attachments?.length > 0 && (
                                                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                        📎 {post.attachments.length} attachment(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Class Strength Distribution */}
                <div>
                    <Card className="border border-border bg-card shadow-sm h-full flex flex-col">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-black flex items-center gap-2">
                                <Activity className="h-4.5 w-4.5 text-primary" />
                                Class Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pt-6 space-y-5">
                            {classWiseDistribution.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground pb-12">
                                    No class strengths cataloged.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {classWiseDistribution.map((c) => {
                                        const percentage = Math.round((c.studentCount / maxClassStrength) * 100);
                                        return (
                                            <div key={c.classId} className="space-y-1.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-foreground">
                                                        Class {c.className}-{c.section}
                                                    </span>
                                                    <span className="font-semibold text-muted-foreground">
                                                        {c.studentCount} student{c.studentCount !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden border border-border/40">
                                                    <div
                                                        className="bg-black dark:bg-white h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}