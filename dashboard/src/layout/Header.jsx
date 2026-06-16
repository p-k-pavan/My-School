import React, { useState } from "react";
import {
  LuChevronDown,
  LuLogOut,
  LuMenu,
  LuUser,
  LuX,
} from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { menus } from "@/constants/menu";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false); 

  const toggleSubmenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
    
  };

  const role = user?.role;

  const handleLogout = () => {
    // dispatch(logout());
    // navigate("/");
  };

  const handleProfile = () => {
    // setUserMenuOpen(false); 
    // navigate("/profile");
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-white p-4 shadow-md dark:bg-neutral-800 dark:text-neutral-300">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-xl lg:hidden"
          >
            {menuOpen ? <LuX /> : <LuMenu />}
          </Button>
        </div>

        <div className="relative">
          <Button
            variant="none"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            <LuUser className="text-xl" />
          </Button>

          {/* Dropdown for Profile and Logout */}
          {userMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white p-2 shadow-lg dark:bg-neutral-800">
              <Button
                variant="none"
                className="w-full justify-start px-4 py-2 text-sm text-black hover:bg-black hover:text-white"
                onClick={handleProfile}
              >
                <LuUser />
                Profile
              </Button>
              <Button
                variant="none"
                className="w-full justify-start px-4 py-2 text-sm text-black hover:bg-black hover:text-white"
                onClick={handleLogout}
              >
                <LuLogOut />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <nav
        className={`absolute z-40 flex h-dvh w-full flex-col overflow-y-auto bg-white p-6 lg:hidden ${
          menuOpen ? "top-16" : "-top-full overflow-hidden"
        }`}
      >
        <ul className="space-y-1.5">
          {menus.map((menu, index) => {
            if (!menu.roles.includes(role)) {
              return null;
            }

            return (
              <li key={index}>
                {!menu.submenu ? (
                  <Link
                    className="flex items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm text-black hover:bg-black hover:text-white dark:text-neutral-300 dark:hover:bg-neutral-700"
                    to={menu.path}
                  >
                    <menu.icon />
                    {menu.name}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm font-medium text-black hover:bg-black hover:text-white focus:outline-none dark:text-neutral-300 dark:hover:bg-neutral-700"
                      onClick={() => toggleSubmenu(menu.name)}
                    >
                      <menu.icon />
                      {menu.name}
                      <LuChevronDown
                        className={`ml-auto transform transition-transform ${
                          activeMenu === menu.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`w-full overflow-hidden transition-[height] duration-500 ${
                        activeMenu === menu.name ? "block" : "hidden"
                      }`}
                    >
                      <ul className="ps-3 pt-2">
                        {menu.submenu.map((submenuItem, idx) => {
                          if (!submenuItem.roles.includes(role)) {
                            return null;
                          }
                          return (
                            <li key={idx}>
                              <Link
                                className="flex items-center gap-x-3.5 rounded-lg px-2.5 py-2 text-sm text-gray-900 hover:bg-black hover:text-white dark:text-neutral-400 dark:hover:bg-neutral-700"
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
    </>
  );
};

export default Header;
