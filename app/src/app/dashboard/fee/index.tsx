import React, { useState } from "react";
import {
    AntDesign,
    FontAwesome,
    FontAwesome6,
    Fontisto,
    Ionicons,
} from "@expo/vector-icons";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDrawer } from "@/context/DrawerContext";
import { useAppSelector } from "@/redux/hooks";
import { Redirect } from "expo-router";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetFeesByStudentIdQuery } from "@/redux/api/fees";
import Skeleton from "@/components/shared/Skeleton";

const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN").format(amount ?? 0);

const formatDate = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const day = d.getDate();
    const suffix =
        day === 1 || day === 21 || day === 31
            ? "st"
            : day === 2 || day === 22
                ? "nd"
                : day === 3 || day === 23
                    ? "rd"
                    : "th";
    const month = d.toLocaleString("en-IN", { month: "short" });
    return `${day}${suffix} ${month} ${d.getFullYear()}`;
};


export default function Fees() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) return <Redirect href="/" />;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { openDrawer } = useDrawer();
    const isParent = (user as any)?.role === "parent";
    const parentId = isParent ? String((user as any).id) : undefined;

    const { data: parentData } = useGetParentsByUserIdQuery(
        parentId as string | undefined,
        { skip: !isParent || !parentId }
    );

    const selectedStudentId = useAppSelector(
        (state) => state.auth.selectedStudentId
    );
    const studentIds = parentData?.parent?.studentIds || [];
    const student =
        studentIds.find((s: any) => s._id === selectedStudentId) ||
        studentIds[0];

    const studentId = student?._id;

    const { data: feeData, isLoading } = useGetFeesByStudentIdQuery(
        studentId,
        { skip: !studentId }
    );


    const fees = feeData?.fees;

    const transactions: any[] = feeData?.transcation ?? [];

    const feeStructure = fees?.feeStructureId;

    const lastPayment = [...transactions]
        .filter((t) => t.paymentStatus === "success")
        .sort(
            (a, b) =>
                new Date(b.paymentDate).getTime() -
                new Date(a.paymentDate).getTime()
        )[0];

    const isDue =
        fees &&
        fees.dueAmount > 0 &&
        (fees.status === "partial" || fees.status === "overdue");

    const studentName = student?.studentName ?? "Student";
    const className = student?.classId?.className
        ? `${student.classId.className}${student.classId.section ?? ""}`
        : "-";
    const rollNo = student?.rollNo ?? "-";





    return (
        <SafeAreaView
            className="flex-1 bg-slate-100"
            edges={["top", "left", "right"]}
        >
            <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
            >
                <View className="bg-[#1E88E5] rounded-b-[32px] flex-row justify-between items-center px-4 pt-10 pb-10">
                    <View className="flex-row gap-3 items-center">
                        <Pressable onPress={openDrawer}>
                            <AntDesign name="menu-unfold" size={24} color="white" />
                        </Pressable>
                        <View>
                            <Text className="text-[17px] font-bold text-white">
                                {studentName}
                            </Text>
                            <Text className="text-[12px] text-white/70 mt-0.5">
                                Class {className}  •  Roll No: {rollNo}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row gap-3 items-center">
                        <View className="relative">
                            <Ionicons
                                name="notifications-outline"
                                size={26}
                                color="white"
                            />
                            <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E88E5]" />
                        </View>
                        <Image
                            source={require("@/assets/images/user.png")}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 19,
                                borderWidth: 2,
                                borderColor: "white",
                            }}
                        />
                    </View>
                </View>

                <View className="px-3">

                    {isLoading ? (
                        <View className="bg-white rounded-2xl p-4 border border-blue-100 my-4 flex-row gap-3 items-center">
                            <Skeleton width={64} height={64} borderRadius={12} />
                            <View className="flex-1 gap-2">
                                <Skeleton width="40%" height={12} />
                                <Skeleton width="80%" height={24} />
                            </View>
                        </View>
                    ) : (
                        <View
                            className="bg-white rounded-2xl p-3.5 border border-blue-100 my-4"
                            style={{
                                shadowColor: "#1E88E5",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <View className="flex-row justify-between items-center">
                                <View className="w-32 h-32 px-4 rounded-xl items-center justify-center shrink-0">
                                    <Image
                                        source={require("@/assets/images/wallet.png")}
                                        style={{ width: 64, height: 64 }}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-slate-500 mt-1 font-medium">
                                        Total Fees {fees?.academicYear ?? "-"}
                                    </Text>
                                    <View className="flex-row items-center justify-between mt-1 pr-4">
                                        <Text className="text-[22px] font-bold text-blue-900">
                                            ₹ {formatINR(fees?.totalFee)}
                                        </Text>
                                        <Pressable 
                                            onPress={() => setIsModalOpen(true)}
                                            className="bg-[#1E88E5] px-3 py-1.5 rounded-lg active:opacity-80"
                                        >
                                            <Text className="text-white text-[11px] font-semibold">
                                                View
                                            </Text>
                                        </Pressable>
                                    </View>
                                    {fees?.discountAmount > 0 && (
                                        <Text className="text-[11px] text-green-600 mt-1">
                                            Discount applied: ₹ {formatINR(fees.discountAmount)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {isLoading ? (
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            <View className="bg-white rounded-xl p-4 items-center border border-slate-100 gap-2 flex-1" style={{ width: "48.5%" }}>
                                <Skeleton width={48} height={48} borderRadius={24} />
                                <Skeleton width="60%" height={12} />
                                <Skeleton width="80%" height={22} />
                            </View>
                            <View className="bg-white rounded-xl p-4 items-center border border-slate-100 gap-2 flex-1" style={{ width: "48.5%" }}>
                                <Skeleton width={48} height={48} borderRadius={24} />
                                <Skeleton width="60%" height={12} />
                                <Skeleton width="80%" height={22} />
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            <View
                                className="bg-white rounded-xl p-3.5 items-center border border-slate-100"
                                style={{ width: "48.5%" }}
                            >
                                <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center shrink-0 mb-2.5">
                                    <Fontisto name="wallet" size={24} color="green" />
                                </View>
                                <Text className="text-[12px] text-slate-400 mt-0.5">
                                    Total Paid
                                </Text>
                                <Text className="text-[22px] font-bold text-green-600">
                                    ₹ {formatINR(fees?.paidAmount)}
                                </Text>
                            </View>

                            <View
                                className="bg-white rounded-xl p-3.5 border items-center border-slate-100"
                                style={{ width: "48.5%" }}
                            >
                                <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center shrink-0 mb-2.5">
                                    <FontAwesome name="calendar" size={24} color="orange" />
                                </View>
                                <Text className="text-[12px] text-slate-400 mt-0.5">
                                    Due Amount
                                </Text>
                                <Text className="text-[22px] font-bold text-orange-400">
                                    ₹ {formatINR(fees?.dueAmount)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {isDue && (
                        <View
                            className="bg-red-50 rounded-2xl p-4 border border-red-100 mb-4"
                            style={{
                                shadowColor: "#1E88E5",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <View className="flex-row items-center gap-6">
                                <View className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center shrink-0">
                                    <FontAwesome6
                                        name="circle-exclamation"
                                        size={24}
                                        color="red"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[15px] font-semibold text-red-600">
                                        {fees.status === "overdue"
                                            ? "Payment Overdue"
                                            : "Payment Due"}
                                    </Text>
                                    <Text className="text-[12px] text-slate-500 mt-1 leading-5">
                                        {fees.status === "overdue"
                                            ? `₹ ${formatINR(fees.dueAmount)} was due on ${formatDate(fees.dueDate)}. Please clear your dues immediately.`
                                            : `₹ ${formatINR(fees.dueAmount)} is due on ${formatDate(fees.dueDate)}.`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {isLoading ? (
                        <View className="gap-3">
                            {[1, 2].map((i) => (
                                <View key={i} className="bg-white rounded-2xl p-4 border border-blue-50 gap-2">
                                    <Skeleton width="50%" height={12} />
                                    <View className="flex-row justify-between items-center mt-1">
                                        <Skeleton width="40%" height={24} />
                                        <Skeleton width={80} height={28} borderRadius={8} />
                                    </View>
                                    <Skeleton width="80%" height={11} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        transactions
                            .slice()
                            .sort(
                                (a, b) =>
                                    new Date(b.paymentDate).getTime() -
                                    new Date(a.paymentDate).getTime()
                            )
                            .map((transaction) => (
                                <View
                                    key={transaction._id}
                                    className="bg-white rounded-2xl p-3.5 border border-blue-100 my-4"
                                    style={{
                                        shadowColor: "#1E88E5",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 8,
                                        elevation: 3,
                                    }}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-[12px] text-slate-400 mt-0.5">
                                            Paid on {formatDate(transaction.paymentDate)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center justify-between mt-1 pr-4">
                                        <Text className="text-[22px] font-bold text-blue-900">
                                            ₹ {formatINR(transaction.amount)}
                                        </Text>
                                        <Pressable className="bg-[#1E88E5] px-3 py-1.5 rounded-lg active:opacity-80">
                                            <Text className="text-white text-[11px] font-semibold">
                                                View Receipt
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <Text className="text-[11px] text-slate-400 mt-1">
                                        Receipt No: {transaction.receiptNo}  •  {(transaction.paymentMethod || "").toUpperCase()}
                                    </Text>
                                </View>
                            ))
                    )}

                </View>
            </ScrollView>

            <Modal
                visible={isModalOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[32px] max-h-[85%] pb-6">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between px-6 py-5 border-b border-slate-100">
                            <Text className="text-[18px] font-bold text-blue-900">Fee Structure & Transactions</Text>
                            <Pressable onPress={() => setIsModalOpen(false)} className="bg-slate-100 p-1.5 rounded-full">
                                <Ionicons name="close" size={20} color="#64748b" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-4">
                            {/* 1. Fee Structure Section */}
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <FontAwesome name="list-alt" size={16} color="#1E88E5" />
                                    <Text className="text-[14px] font-bold text-slate-800">Fee Structure Breakdown ({feeStructure?.academicYear || fees?.academicYear || "-"})</Text>
                                </View>
                                
                                <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <View className="flex-row justify-between py-2 border-b border-slate-200/50">
                                        <Text className="text-[13px] text-slate-500">Tuition Fee</Text>
                                        <Text className="text-[13px] font-semibold text-slate-700">₹ {formatINR(feeStructure?.tuitionFee)}</Text>
                                    </View>
                                    <View className="flex-row justify-between py-2 border-b border-slate-200/50">
                                        <Text className="text-[13px] text-slate-500">Exam Fee</Text>
                                        <Text className="text-[13px] font-semibold text-slate-700">₹ {formatINR(feeStructure?.examFee)}</Text>
                                    </View>
                                    <View className="flex-row justify-between py-2 border-b border-slate-200/50">
                                        <Text className="text-[13px] text-slate-500">Library Fee</Text>
                                        <Text className="text-[13px] font-semibold text-slate-700">₹ {formatINR(feeStructure?.libraryFee)}</Text>
                                    </View>
                                    <View className="flex-row justify-between py-2 border-b border-slate-200/50">
                                        <Text className="text-[13px] text-slate-500">Miscellaneous Fee</Text>
                                        <Text className="text-[13px] font-semibold text-slate-700">₹ {formatINR(feeStructure?.miscellaneousFee)}</Text>
                                    </View>
                                    <View className="flex-row justify-between py-2 border-b border-slate-200/50">
                                        <Text className="text-[13px] text-slate-500">Other Fee</Text>
                                        <Text className="text-[13px] font-semibold text-slate-700">₹ {formatINR(feeStructure?.otherFee)}</Text>
                                    </View>
                                    <View className="flex-row justify-between pt-2">
                                        <Text className="text-[13px] font-bold text-blue-900">Total Structure Fee</Text>
                                        <Text className="text-[13px] font-bold text-blue-900">₹ {formatINR(feeStructure?.totalFee)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* 2. Payment History / Transactions Section */}
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <FontAwesome6 name="money-bill-transfer" size={16} color="#16A34A" />
                                    <Text className="text-[14px] font-bold text-slate-800">Transaction History ({transactions.length})</Text>
                                </View>

                                {transactions.length === 0 ? (
                                    <View className="bg-slate-50 rounded-2xl p-6 items-center justify-center border border-slate-100">
                                        <Text className="text-[13px] text-slate-400">No transactions recorded</Text>
                                    </View>
                                ) : (
                                    <View className="gap-3">
                                        {transactions.map((t) => {
                                            const isLast = t._id === lastPayment?._id;
                                            return (
                                                <View
                                                    key={t._id}
                                                    className={`rounded-2xl p-4 border ${
                                                        isLast 
                                                            ? "bg-blue-50/50 border-blue-200 shadow-sm" 
                                                            : "bg-white border-slate-100"
                                                    }`}
                                                >
                                                    <View className="flex-row justify-between items-start">
                                                        <View className="flex-row items-center gap-2">
                                                            <Text className="text-[13px] font-bold text-slate-800">
                                                                Receipt: {t.receiptNo}
                                                            </Text>
                                                            {isLast && (
                                                                <View className="bg-blue-500 px-2 py-0.5 rounded-full">
                                                                    <Text className="text-[9px] text-white font-bold uppercase tracking-wider">
                                                                        Last Payment
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text className="text-[14px] font-extrabold text-blue-900">
                                                            ₹ {formatINR(t.amount)}
                                                        </Text>
                                                    </View>

                                                    <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                                                        <View className="flex-row items-center gap-1.5">
                                                            <Ionicons name="calendar-outline" size={13} color="#64748b" />
                                                            <Text className="text-[11px] text-slate-400">
                                                                {formatDate(t.paymentDate)}
                                                            </Text>
                                                        </View>
                                                        
                                                        <View className="flex-row items-center gap-1.5">
                                                            <Text className="text-[11px] font-medium text-slate-500 uppercase">
                                                                Method: {t.paymentMethod}
                                                            </Text>
                                                            <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            <Text className="text-[11px] font-semibold text-green-600 capitalize">
                                                                {t.paymentStatus}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}