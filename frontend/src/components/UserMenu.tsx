"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  FolderKanban,
  Terminal,
  TrophyIcon,
} from "lucide-react";
import LogoutButton from "./auth/LogoutButton";
import { Variants } from "motion";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils/cn";

type MenuPosition =
  | "bottom"
  | "bottom-right"
  | "bottom-left"
  | "top"
  | "top-right"
  | "top-left"
  | "left"
  | "right";

interface UserMenuProps {
  user: any;
  menuPos?: MenuPosition;
  isNavbar?: boolean;
}

export default function UserMenu({
  user,
  menuPos = "bottom-right",
  isNavbar = true,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setIsOpen(false);

  const positionClasses: Record<MenuPosition, string> = {
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    "bottom-right": "top-full right-0 mt-2",
    "bottom-left": "top-full left-0 mt-2",
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    "top-right": "bottom-95 left-0 mb-2",
    "top-left": "bottom-full left-0 mb-2",
    left: "right-full top-0 mr-2",
    right: "left-full top-0 ml-2",
  };

  // Set the animation origin based on position
  const animationVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: menuPos.includes("top") ? 10 : menuPos.includes("bottom") ? -10 : 0,
      x: menuPos === "left" ? 10 : menuPos === "right" ? -10 : 0,
    },
    animate: { opacity: 1, scale: 1, y: 0, x: 0 },
    exit: { opacity: 0, scale: 0.95, y: menuPos.includes("top") ? 10 : -10 },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={cn(
          "flex items-center p-1 rounded-full border border-border transition-all duration-300 outline-none bg-background hover:border-primary group relative overflow-hidden",
          !isNavbar ? "w-fit hover:w-full min-w-10.5" : "pr-3",
        )}
      >
        {/* Avatar - Always Visible */}
        <div className="w-8 h-8 shrink-0 bg-primary text-white flex-center rounded-full font-bold text-sm shadowwhite z-10">
          {(user.name || user.email || "U")[0].toUpperCase()}
        </div>

        {/* Animated Chevron - Slides out on Hover */}
        {isNavbar ? (
          <ChevronDown
            size={14}
            className={cn(
              "ml-2 text-muted-foreground transition-transform duration-200",
              isOpen ? "rotate-180" : "",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center overflow-hidden transition-all duration-300",
              isOpen || "group-hover:max-w-10 group-hover:ml-2",
              isOpen ? "max-w-10 ml-2" : "max-w-0 ml-0",
            )}
          >
            <ChevronDown
              size={14}
              className={cn(
                "text-muted-foreground transition-transform duration-300 mr-2 shrink-0",
                isOpen ? "rotate-180 text-primary" : "",
              )}
            />
          </div>
        )}
      </button>

      {/* Overlay to close menu when clicking outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "absolute w-64",
              positionClasses[menuPos],
              isOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none",
            )}
          >
            <div className="fixed inset-0 z-100" onClick={closeMenu} />
            <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-200">
              {/* Header info */}
              <div className="px-4 py-3 border-b border-border mb-2">
                <p className="text-sm font-bold text-foreground truncate">
                  {user.name || "Subscriber"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              {/* Links */}
              {isNavbar ? (
                <div className="px-2 space-y-1">
                  <DropdownItem
                    href={
                      user.userRole === "admin"
                        ? "/admin/dashboard"
                        : "/dashboard"
                    }
                    icon={<LayoutDashboard size={16} />}
                    label="Dashboard"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/editor"
                    icon={<Terminal size={16} />}
                    label="Editor"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/projects"
                    icon={<FolderKanban size={16} />}
                    label="Projects"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/subscription"
                    icon={<TrophyIcon size={16} />}
                    label="Subscription"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/settings"
                    icon={<Settings size={16} />}
                    label="Settings"
                    onClick={closeMenu}
                  />
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <DropdownItem
                    href={
                      user?.userRole === "admin"
                        ? "/admin/dashboard"
                        : "/dashboard"
                    }
                    icon={<LayoutDashboard size={16} />}
                    label="Dashboard"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/editor"
                    icon={<Terminal size={16} />}
                    label="Editor"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/subscription"
                    icon={<TrophyIcon size={16} />}
                    label="Subscription"
                    onClick={closeMenu}
                  />
                  <DropdownItem
                    href="/settings"
                    icon={<Settings size={16} />}
                    label="Settings"
                    onClick={closeMenu}
                  />
                </div>
              )}

              {/* Footer / Logout */}
              <div className="mt-2 pt-2 border-t border-border px-2">
                <LogoutButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for clean links
function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
    >
      {icon} {label}
    </Link>
  );
}
