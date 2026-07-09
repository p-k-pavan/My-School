import {
  AntDesign,
  Entypo,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useDrawer } from "../../context/DrawerContext";
import { useAppSelector } from "@/redux/hooks";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetTeacherByUserIdQuery } from "@/redux/api/teacher";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 1, 500);

const QUICK_LINKS = [
  { label: "Homework", icon: <Entypo name="open-book" size={22} color="#1E88E5" />, bg: "bg-blue-50", route: "/dashboard/homework", roles: ["parent", "teacher"] },
  // { label: "Calendar", icon: <FontAwesome name="calendar" size={22} color="#7C3AED" />, bg: "bg-violet-50", route: "/dashboard/calendar", roles: ["parent", "teacher"] },
  // { label: "Gallery", icon: <FontAwesome name="photo" size={22} color="#D97706" />, bg: "bg-amber-50", route: "/dashboard/gallery", roles: ["parent", "teacher"] },
];

const CLASSROOM_LINKS = [
  { label: "Attendance", icon: <MaterialIcons name="how-to-reg" size={22} color="#16A34A" />, bg: "bg-green-50", route: "/dashboard/attendance", roles: ["parent"] },
  // { label: "Progress Card", icon: <Ionicons name="stats-chart" size={22} color="#DC2626" />, bg: "bg-red-50", route: "/dashboard/progress", roles: ["parent"] },
  { label: "Time Table", icon: <MaterialIcons name="table-chart" size={22} color="#0891B2" />, bg: "bg-cyan-50", route: "/dashboard/timetable", roles: ["parent", "teacher"] },
  // { label: "Online Test", icon: <MaterialIcons name="quiz" size={22} color="#7C3AED" />, bg: "bg-violet-50", route: "/dashboard/test", roles: ["parent", "teacher"] },
  // { label: "E-Books", icon: <FontAwesome5 name="book-reader" size={20} color="#D97706" />, bg: "bg-amber-50", route: "/dashboard/ebooks", roles: ["parent", "teacher"] },
  { label: "Fee", icon: <FontAwesome6 name="money-bill" size={20} color="#16A34A" />, bg: "bg-green-50", route: "/dashboard/fee", roles: ["parent"] },
];

const COMMUNICATION_LINKS: any[] = [
  // { label: "SMS", icon: <MaterialIcons name="sms" size={22} color="#1E88E5" />, bg: "bg-blue-50", route: "/dashboard/sms", roles: ["parent", "teacher"] },
  // { label: "Email", icon: <MaterialIcons name="email" size={22} color="#7C3AED" />, bg: "bg-violet-50", route: "/dashboard/email", roles: ["parent", "teacher"] },
  // { label: "Notices", icon: <FontAwesome6 name="bullhorn" size={20} color="#0891B2" />, bg: "bg-cyan-50", route: "/dashboard/circular", roles: ["parent", "teacher"] },
  // { label: "Feedback", icon: <MaterialIcons name="feedback" size={22} color="#D97706" />, bg: "bg-amber-50", route: "/dashboard/feedback", roles: ["parent", "teacher"] },
  // { label: "Support", icon: <MaterialIcons name="contact-support" size={22} color="#DC2626" />, bg: "bg-red-50", route: "/dashboard/support", roles: ["parent", "teacher"] },
];

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-3 px-1 mb-3">
      {icon}
      <Text className="text-[15px] font-semibold text-slate-800">{label}</Text>
    </View>
  );
}

function LinkGrid({ items, onNavigate }: { items: typeof QUICK_LINKS; onNavigate: (r: string) => void }) {

  

  return (
    <View className="flex-row flex-wrap gap-2 mb-2">
      {items.map((item) => (
        <Pressable
          key={item.route}
          onPress={() => onNavigate(item.route)}
          android_ripple={{ color: "#E0E7FF", borderless: false }}
          className="bg-white rounded-xl border border-slate-100 items-center justify-center py-3.5 active:opacity-80"
          style={{ width: "31.5%" }}
        >
          <View className={`w-11 h-11 ${item.bg} rounded-xl items-center justify-center mb-2`}>
            {item.icon}
          </View>
          <Text className="text-[12px] font-medium text-slate-600 text-center px-1">{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Divider() {
  return <View className="h-[0.5px] bg-slate-200 my-4 mx-1" />;
}

export default function Drawer() {
  const { isOpen, closeDrawer } = useDrawer();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const animValue = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const user = useAppSelector((state) => state.auth.user);
  const role = (user as any)?.role;

  const isParent = role === "parent";
  const isTeacher = role === "teacher";
  const parentId = isParent ? String((user as any).id) : undefined;
  
  const { data: parentData } = useGetParentsByUserIdQuery(parentId as string | undefined, { skip: !isParent || !parentId });

  const selectedStudentId = useAppSelector((state) => state.auth.selectedStudentId);
  const studentIds = parentData?.parent?.studentIds || [];
  const student = studentIds.find((s: any) => s._id === selectedStudentId) || studentIds[0];
  
  const { data: teacherData } = useGetTeacherByUserIdQuery(
    (user as any)?.id as string | undefined,
    { skip: !isTeacher || !(user as any)?.id }
  );

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      Animated.timing(animValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      Animated.timing(animValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
    isFirstRender.current = false;
  }, [isOpen]);

  const handleNavigate = (route: string) => {
    closeDrawer();
    router.push(route as any);
  };

  const handleLogout = () => {
    closeDrawer();
    router.replace("/");
  };

  if (!shouldRender) return null;

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  let displayName = "User";
  let displayClassInfo = "";
  let displayRoleTag = "";

  if (isParent) {
    displayName = student?.studentName || (user as any)?.name || "Parent";
    displayClassInfo = student?.classId
      ? `Class ${student.classId.className}${student.classId.section || ""}  •  Roll No: ${student?.rollNo || "-"}`
      : "Parent Account";
    displayRoleTag = "Parent Account";
  } else if (isTeacher) {
    displayName = teacherData?.teacher?.teacherName || (user as any)?.name || "Teacher";
    displayClassInfo = `EMP ID: ${teacherData?.teacher?.employeeId || "N/A"}`;
    displayRoleTag = "Teacher Account";
  } else {
    displayName = (user as any)?.name || "User";
    displayClassInfo = (user as any)?.email || "";
    displayRoleTag = role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Account` : "Account";
  }

  const quickLinks = QUICK_LINKS.filter(item =>
    item.roles.includes(role)
  );

  const classroomLinks = CLASSROOM_LINKS.filter(item =>
    item.roles.includes(role)
  );

  const communicationLinks = COMMUNICATION_LINKS.filter(item =>
    item.roles.includes(role)
  );

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 z-50 flex-row">

      <Animated.View
        style={{ opacity: backdropOpacity }}
        className="absolute top-0 left-0 right-0 bottom-0 bg-black"
      >
        <Pressable className="flex-1" onPress={closeDrawer} />
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateX }], width: DRAWER_WIDTH }}
        className="h-full bg-white flex-col"
      >

        <View className="bg-[#1E88E5]  py-6 px-5 rounded-br-[32px]">
          <Pressable
            onPress={closeDrawer}
            className="absolute top-12 right-4 w-8 h-8 items-center justify-center bg-white/20 rounded-full active:bg-white/30"
          >
            <AntDesign name="close" size={18} color="white" />
          </Pressable>

          <View className="flex-row items-center gap-3.5 mt-2">
            <Image
              source={require("@/assets/images/user.png")}
              style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "white" }}
            />
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-white">{displayName}</Text>
              {!!displayClassInfo && (
                <Text className="text-[12px] text-white/80 mt-0.5">{displayClassInfo}</Text>
              )}
              <View className="bg-white/20 self-start px-2 py-0.5 rounded-full mt-1.5">
                <Text className="text-[11px] text-white font-medium">{displayRoleTag}</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        >

          {quickLinks.length > 0 && (
            <>
              <SectionHeader
                icon={<Ionicons name="flash" size={20} color="#1E88E5" />}
                label="Quick Links"
              />
              <LinkGrid items={quickLinks} onNavigate={handleNavigate} />
            </>
          )}

          {quickLinks.length > 0 && classroomLinks.length > 0 && <Divider />}

          {classroomLinks.length > 0 && (
            <>
              <SectionHeader
                icon={<MaterialCommunityIcons name="google-classroom" size={22} color="#7C3AED" />}
                label="Classroom"
              />
              <LinkGrid items={classroomLinks} onNavigate={handleNavigate} />
            </>
          )}

          {((quickLinks.length > 0 || classroomLinks.length > 0) && communicationLinks.length > 0) && <Divider />}

          {communicationLinks.length > 0 && (
            <>
              <SectionHeader
                icon={<MaterialIcons name="forum" size={22} color="#0891B2" />}
                label="Communication"
              />
              <LinkGrid items={communicationLinks} onNavigate={handleNavigate} />
            </>
          )}
        </ScrollView>


        <View className="px-5 py-4 border-t border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Text className="text-[13px] font-bold text-slate-800">Edu</Text>
            <Text className="text-[13px] font-bold text-blue-600">Connect</Text>
          </View>
          <Text className="text-[11px] text-slate-400">v1.0.0</Text>
        </View>

      </Animated.View>
    </View>
  );
}