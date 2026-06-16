import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { menus } from "@/constants/menu";
import { LuChevronDown } from "react-icons/lu";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const role = user?.role;

    const toggleSubmenu = (menuName) => {
        setActiveMenu((prev) => (prev === menuName ? null : menuName));
    };

    const getLinkClass = (isActive) => {
        const base = "flex items-center rounded-lg py-2 transition-all duration-300 text-sm font-semibold ";
        const layout = isCollapsed ? "justify-center px-2 gap-x-0" : "gap-x-3.5 px-2.5";
        const colors = isActive
            ? "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
            : "text-black hover:bg-black hover:text-white dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white";
        return `${base} ${layout} ${colors}`;
    };

    const getBtnClass = () => {
        const base = "flex w-full items-center rounded-lg py-2 transition-all duration-300 text-sm font-semibold focus:outline-none ";
        const layout = isCollapsed ? "justify-center px-2 gap-x-0" : "gap-x-3.5 px-2.5";
        const colors = "text-black hover:bg-black hover:text-white dark:text-neutral-300 dark:hover:bg-neutral-700";
        return `${base} ${layout} ${colors}`;
    };

    return (
        <div className={`fixed bottom-0 insert-s-0 top-0 z-40 hidden transform overflow-y-auto border border-e border-gray-200 bg-white pb-10 pt-7 transition-all duration-300 dark:border-gray-700 dark:bg-neutral-800 lg:bottom-0 lg:insert-e-auto lg:block lg:translate-x-0 ${isCollapsed ? "w-20" : "w-64"}`}>
            <div className={`transition-all duration-300 ${isCollapsed ? "px-2 flex justify-center" : "px-6"}`}>
                <Link
                    className="flex-none text-xl font-semibold text-black focus:opacity-80 focus:outline-none dark:text-white"
                    to="/dashboard"
                >
                    {isCollapsed ? (
                        <div className="flex items-center justify-center bg-black text-white dark:bg-white dark:text-black w-10 h-10 font-bold rounded-xl text-lg shadow-sm transition-all duration-300">
                            S
                        </div>
                    ) : (
                        <img
                            src={"/SRS.png"}
                            alt="logo"
                            className="h-12 w-32 object-contain transition-all duration-300"
                        />
                    )}
                </Link>
            </div>

            <nav className={`flex w-full flex-col transition-all duration-300 ${isCollapsed ? "p-4" : "p-6"}`}>
                <ul className="space-y-1.5">
                    {menus.map((menu, index) => {
                        if (!menu.roles.includes(role)) {
                            return null;
                        }

                        return (
                            <li key={index}>
                                {!menu.submenu ? (
                                    <NavLink
                                        className={({ isActive }) => getLinkClass(isActive)}
                                        to={menu.path}
                                        title={isCollapsed ? menu.name : undefined}
                                    >
                                        <menu.icon className="text-lg shrink-0" />
                                        {!isCollapsed && <span>{menu.name}</span>}
                                    </NavLink>
                                ) : (
                                    <>
                                        {/* Submenu Button */}
                                        <button
                                            type="button"
                                            className={getBtnClass()}
                                            onClick={() => {
                                                if (isCollapsed && setIsCollapsed) {
                                                    setIsCollapsed(false);
                                                }
                                                toggleSubmenu(menu.name);
                                            }}
                                            title={isCollapsed ? menu.name : undefined}
                                        >
                                            <menu.icon className="text-lg shrink-0" />
                                            {!isCollapsed && (
                                                <>
                                                    <span>{menu.name}</span>
                                                    <LuChevronDown
                                                        className={`ml-auto transform transition-transform ${activeMenu === menu.name ? "rotate-180" : ""}`}
                                                    />
                                                </>
                                            )}
                                        </button>

                                        {/* Submenu Items */}
                                        <div
                                            className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${activeMenu === menu.name && !isCollapsed ? "block" : "hidden"}`}
                                        >
                                            <ul className="ps-3 pt-2">
                                                {menu.submenu.map((submenuItem, idx) => {
                                                    // Check if the user's role is allowed for this submenu item
                                                    if (!submenuItem.roles.includes(role)) {
                                                        return null;
                                                    }
                                                    return (
                                                        <li key={idx}>
                                                            <Link
                                                                className="flex items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white dark:text-neutral-400 dark:hover:bg-neutral-700"
                                                                to={submenuItem.path}
                                                            >
                                                                {submenuItem.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
