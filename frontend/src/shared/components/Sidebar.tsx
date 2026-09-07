"use client";

import { cn } from "@/lib/utils/cn";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";

interface Links {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(true);
    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({ children, open, setOpen, animate }: any) => (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
        {children}
    </SidebarProvider>
);

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => (
    <>
        <DesktopSidebar {...props} />
        <MobileSidebar {...(props as any)} />
    </>
);

export const DesktopSidebar = ({
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    ...props
}: React.ComponentProps<typeof motion.div>) => {
    const { open, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-4 py-4 hidden md:flex md:flex-col bg-background border-r border-border shrink-0 transition-colors duration-300",
                className
            )}
            animate={{ width: animate ? (open ? "300px" : "80px") : "300px" }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const SidebarLink = ({ link, className, ...props }: { link: Links; className?: string }) => {
    const { open, animate } = useSidebar();
    return (
        <Link
            href={link.href}
            className={cn(
                "flex items-center justify-start gap-2 group/sidebar py-2 text-muted-foreground hover:text-foreground transition-colors",
                className
            )}
            {...props}
        >
            <div className="shrink-0 flex-center">
                {link.icon}
            </div>

            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-sm group-hover/sidebar:translate-x-1 transition-transform duration-150 whitespace-pre"
            >
                {link.label}
            </motion.span>
        </Link>
    );
};

export const SidebarButton = ({ btn, className, ...props }: { btn: Links; className?: string }) => {
    const { open, animate } = useSidebar();
    return (
        <div
            className={cn(
                "flex items-center gap-2 group/sidebar py-2 text-muted-foreground transition-colors",
                className
            )}
            {...props}
        >
            <div className="shrink-0 flex-center">
                {btn.icon}
            </div>
            {btn.label !== '' && (
                <motion.span
                    animate={{
                        display: animate ? (open ? "inline-block" : "none") : "inline-block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                    }}
                    className="text-sm group-hover/sidebar:translate-x-1 transition-transform duration-150 whitespace-pre"
                >
                    {btn.label}
                </motion.span>
            )}
        </div>
    );
};

export const MobileSidebar = ({ className, children }: any) => {
    const { open, setOpen } = useSidebar();

    return (
        <div className="md:hidden h-screen fixed z-50 top-0 bottom-0">
            {/* Mobile Trigger */}
            <div className="absolute px-4 flex items-center justify-between top-4 left-0 z-40">
                <button
                    onClick={() => setOpen(true)}
                    className="text-foreground p-2 rounded-md bg-background border border-border shadowwhite"
                >
                    <IconMenu2 size={20} />
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={cn(
                                "fixed inset-y-0 left-0 w-72 bg-background z-60 flex flex-col shadowwhite border-r border-border",
                                className
                            )}
                        >
                            <div className="flex justify-end p-4">
                                <button 
                                    onClick={() => setOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <IconX className="text-foreground" size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
