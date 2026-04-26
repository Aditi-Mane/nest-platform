import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MdOutlineAnalytics, MdAnalytics, MdReplay } from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { LiaRobotSolid } from "react-icons/lia";
import { FaRegSmile } from "react-icons/fa";
import { IoSettingsSharp, IoPeople } from "react-icons/io5";
import { SiGoogleanalytics } from "react-icons/si";
import { FaPeopleGroup } from "react-icons/fa6";
import { useMessages } from "@/context/MessageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "../api/axios.js";

const SellerSidebar = ({ className = "", onNavigate }) => {
  const [openAI, setOpenAI] = useState(true);
  const [user, setUser] = useState({});
  const [userLoading, setUserLoading] = useState(true);
  const { totalUnread } = useMessages();
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (onNavigate && previousPathRef.current !== location.pathname) {
      onNavigate();
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname, onNavigate]);

  const baseLink =
    "flex items-center gap-3 rounded-xl px-4 py-2 text-[15px] font-medium transition-all duration-200";
  const activeLink = "bg-[#efe6d6] text-[var(--color-primary)] font-semibold";
  const normalLink =
    "text-[var(--color-muted)] hover:bg-[#f4ecdd] hover:text-[var(--color-primary)]";

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `http://localhost:5000${user.avatar}`
    : undefined;

  return (
    <div
      className={`flex h-full w-72 flex-col justify-between border-r border-border bg-card ${className}`}
    >
      <div className="min-h-0">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="rounded-xl text-white">
            <img
              src="/NEST_logo.png"
              alt="NEST Logo"
              className="size-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text">NEST</h1>
            <p className="text-sm text-muted">Seller Dashboard</p>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          <NavLink
            to="/marketplace/seller/dashboard"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <MdOutlineAnalytics size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/marketplace/seller/messages"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink} justify-between`
            }
          >
            <div className="flex items-center gap-2">
              <IoPeople size={20} />
              Buyer Requests
            </div>

            {totalUnread > 0 && (
              <span className="rounded-full bg-[#E9C9A8] px-2 py-[2px] text-xs font-semibold text-[#7A3E1D]">
                {totalUnread}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/marketplace/seller/products"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <TbPackage size={20} />
            My Products
          </NavLink>

          <NavLink
            to="/marketplace/seller/orders"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <MdReplay size={20} />
            Order History
          </NavLink>

          <NavLink
            to="/marketplace/seller/analytics"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <SiGoogleanalytics size={20} />
            Analytics
          </NavLink>

          <NavLink
            to="/marketplace/buyer/ventures"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <FaPeopleGroup size={20} />
            Ventures
          </NavLink>

          <div className="pt-1">
            <button
              onClick={() => setOpenAI((prev) => !prev)}
              className={`${baseLink} ${normalLink} w-full justify-between`}
            >
              <div className="flex items-center gap-3">
                <LiaRobotSolid size={20} />
                AI Insights
                <span className="rounded-full bg-[#efe6d6] px-2 py-0.5 text-xs text-primary">
                  AI
                </span>
              </div>
              <span>{openAI ? "▾" : "▸"}</span>
            </button>

            {openAI && (
              <div className="ml-6 mt-1 space-y-1">
                <NavLink
                  to="/marketplace/seller/sales-prediction"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? activeLink : normalLink}`
                  }
                >
                  <MdAnalytics size={18} />
                  Sales Prediction
                </NavLink>

                <NavLink
                  to="/marketplace/seller/sentiment"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? activeLink : normalLink}`
                  }
                >
                  <FaRegSmile size={18} />
                  Sentiment Analysis
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/marketplace/seller/settings"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : normalLink}`
            }
          >
            <IoSettingsSharp size={20} />
            Settings
          </NavLink>
        </div>
      </div>

      <div className="border-t border-border p-4">
        {userLoading ? (
          <div className="flex items-center gap-3 rounded-xl bg-[#efe6d6] p-3 animate-pulse">
            <div className="size-10 rounded-full bg-white/70" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-white/70" />
              <div className="h-2.5 w-36 rounded bg-white/50" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-[#efe6d6] p-3">
            <Avatar className="size-10 border border-border">
              <AvatarImage src={avatarSrc} alt={user?.name || "Seller avatar"} />
              <AvatarFallback className="bg-primary font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerSidebar;
