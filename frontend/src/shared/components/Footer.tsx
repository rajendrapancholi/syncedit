"use client";

import Link from "next/link";
import React from "react";
import { Send, Code2, Heart, GlobeIcon, BookOpenText } from "lucide-react";
import { SiDiscord, SiGithub, SiX } from '@icons-pack/react-simple-icons'
import { IoLogoLinkedin } from "react-icons/io";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background transition-colors duration-500">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-primary text-primary-foreground group-hover:rotate-12 transition-transform">
                <Code2 size={22} />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-foreground">
                Raje<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The next-generation collaborative coding platform. Build together,
              sync instantly, and ship faster.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <SiGithub size={18} />, label: "GitHub", href: "https://github.com/rajendrapancholi" },
                { icon: <IoLogoLinkedin size={18} />, label: "LinkedIn", href: "https://www.linkedin.com/in/rajendra-pancholi-11a3a5286" },
                { icon: <GlobeIcon size={18} />, label: "Discord", href: "https://rajendrapancholi.vercel.app/" },
                { icon: <BookOpenText size={18} />, label: "X", href: "https://rajendrapancholi.vercel.app/blogs" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="p-2 rounded-md bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">
                  Product
                </h3>
                <ul className="space-y-4">
                  {["Editor", "Projects", "Extension", "CLI"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">
                  Support
                </h3>
                <ul className="space-y-4">
                  {["Documentation", "API Reference", "Status", "Contact"].map(
                    (item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">
                  Stay Updated
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe to our newsletter for updates.
                </p>
                <div className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="min-w-0 flex-auto rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button className="flex-none rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary-hover transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Raje Collaborative Tool. Built with {" "}
            <span className="text-destructive"><Heart size={14} fill="red" className="inline flex-center"/> </span> for developers.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/privarcy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookie-settings" className="hover:text-foreground">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
