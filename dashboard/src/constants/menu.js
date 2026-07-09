import { NewspaperIcon, TimelineIcon } from "lucide-react";
import {
  LuBadge,
  LuBriefcase,
  LuContact,
  LuHeartHandshake,
  LuLayoutDashboard,
  LuUsers,
  LuBus,
  LuMedal,
  LuBell,
  LuBuilding2,
  LuUserCheck,
  LuGalleryThumbnails,
  LuCalendar,
  LuBook,
  LuMegaphone
} from "react-icons/lu";

export const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LuLayoutDashboard,
    roles: ["management", "admin"],
  },

  {
    name: "Admissions",
    path: "/admissions",
    icon: LuUserCheck,
    roles: ["management", "admin"],
  },

  {
    name: "Students",
    path: "/students",
    icon: LuUsers,
    roles: ["management", "admin"],
  },

  {
    name: "Parents",
    path: "/parents",
    icon: LuHeartHandshake,
    roles: ["management", "admin"],
  },

  {
    name: "Teachers",
    path: "/teachers",
    icon: LuBriefcase,
    roles: ["management", "admin"],
  },

  {
    name: "Classes",
    path: "/classes",
    icon: LuBuilding2,
    roles: ["management", "admin"],
  },

  {
    name: "Subjects",
    path: "/subjects",
    icon: NewspaperIcon,
    roles: ["management", "admin"],
  },

  {
    name: "Attendance",
    path: "/attendance",
    icon: LuBadge,
    roles: ["management", "admin"],
  },

  {
    name: "Timetable",
    path: "/timetable",
    icon: LuCalendar,
    roles: ["management", "admin"],
  },

  {
    name: "Homework",
    path: "/homework",
    icon: LuBook,
    roles: ["management", "admin", "teacher"],
  },

  {
    name: "Fees",
    path: "/fees",
    icon: LuMedal,
    roles: ["management", "admin"],
  },

  // {
  //   name: "Transport",
  //   path: "/transport",
  //   icon: LuBus,
  //   roles: ["management", "admin"],
  // },

  {
    name: "Announcements",
    path: "/feed",
    icon: LuMegaphone,
    roles: ["management", "admin", "teacher", "parent"],
  },

];
