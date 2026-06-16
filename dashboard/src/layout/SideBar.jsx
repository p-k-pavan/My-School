import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { menus } from "@/constants/menu";
import { LuChevronDown } from "react-icons/lu";

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const role = user?.role;

    const toggleSubmenu = (menuName) => {
        setActiveMenu((prev) => (prev === menuName ? null : menuName));
    };

    return (
        <div className="fixed bottom-0 start-0 top-0 z-40 hidden w-64 transform overflow-y-auto border border-e border-gray-200 bg-white pb-10 pt-7 duration-300 dark:border-gray-700 dark:bg-neutral-800 lg:bottom-0 lg:end-auto lg:block lg:translate-x-0">
            <div className="px-6">
                <Link
                    className="flex-none text-xl font-semibold text-black focus:opacity-80 focus:outline-none dark:text-white"
                    to="/dashboard"
                >
                    <img
                        src={"/SRS.png"}
                        alt="logo"
                        className="h-12 w-32 object-contain"
                    />
                </Link>
            </div>

            <nav className="flex w-full flex-col p-6">
                <ul className="space-y-1.5">
                    {menus.map((menu, index) => {
                        if (!menu.roles.includes(role)) {
                            return null;
                        }

                        return (
                            <li key={index}>
                                {!menu.submenu ? (
                                    <NavLink
                                        className={({ isActive }) =>
                                            isActive
                                                ? "flex items-center gap-x-3.5 rounded-lg bg-black px-2.5 py-2 text-sm font-semibold text-white hover:bg-black hover:text-white"
                                                : "flex items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-black hover:bg-black hover:text-white"
                                        }
                                        to={menu.path}
                                    >
                                        <menu.icon />
                                        {menu.name}
                                    </NavLink>
                                ) : (
                                    <>
                                        {/* Submenu Button */}
                                        <button
                                            type="button"
                                            className="flex w-full items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-black hover:bg-black hover:text-white focus:outline-none dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            onClick={() => toggleSubmenu(menu.name)}
                                        >
                                            <menu.icon />
                                            {menu.name}
                                            <LuChevronDown
                                                className={`ml-auto transform transition-transform ${activeMenu === menu.name ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        {/* Submenu Items */}
                                        <div
                                            className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${activeMenu === menu.name ? "block" : "hidden"
                                                }`}
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
