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
  LuGalleryThumbnails
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
    name: "Attendance",
    path: "/attendance",
    icon: LuBadge,
    roles: ["management", "admin", "teacher"],
  },

  {
    name: "Fees",
    path: "/fees",
    icon: LuMedal,
    roles: ["management", "admin"],
  },

  {
    name: "Timetable",
    path: "/timetable",
    icon: LuCalendar,
    roles: ["management", "admin", "teacher"],
  },

  {
    name: "Transport",
    path: "/transport",
    icon: LuBus,
    roles: ["management", "admin"],
  },

  {
    name: "Circulars",
    path: "/circulars",
    icon: LuBell,
    roles: ["management", "admin"],
  },

  {
    name: "Gallery",
    path: "/gallery",
    icon: LuGalleryThumbnails,
    roles: ["management", "admin"],
  },

];
