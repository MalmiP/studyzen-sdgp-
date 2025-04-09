"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  PenTool,
  MessageCircle,
} from "lucide-react";

// Utility function for merging class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const mainNavItems = [
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dashboard-Rllxc6NyHq2F1bce1LRF7k97yl6REH.png",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/progress-7X8whx15v0mjTj9P8XcN3Rbvrdg5Z4.png",
    label: "Progress",
    href: "/progress",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/journal-pL2uawq5l2Jrw4yXWguWnoWNqWrJfc.png",
    label: "Journal",
    href: "/journal",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/quizz-7LaTZmLJ9m8WEhTK6E43irFnSrahWD.png",
    label: "Quiz",
    href: "/quiz",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chat-weyApYaF1xf0TwluX21oSaba8iMGzf.png",
    label: "Chat",
    href: "/chat",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/confession-Bp95oWHo2nxKAsUG2vZfhkCJXZE3xa.png",
    label: "Confessions",
    href: "/confessions",
  },
  {
    icon: "/console.png", // Local file from public folder
    label: "Games",
    href: "/games",
  },
];

const bottomNavItems = [
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-x2qaRDZN12LeGf5uPJQ3C7NIiURyMy.png",
    label: "Profile",
    href: "/profile",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/settings-Lpklw4uVHy8CpLskQeikjd1NNZRAHz.png",
    label: "Settings",
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auto expand on mouse enter, collapse on mouse leave
  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => setIsCollapsed(true);

  const renderNavItems = (items: typeof mainNavItems) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-300 ease-in-out",
          pathname === item.href
            ? "bg-blue-600 text-white font-medium shadow-md"
            : "text-blue-200 hover:bg-blue-600 hover:text-white",
          isCollapsed ? "justify-center w-14 mx-auto" : "w-full"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="relative flex-shrink-0 w-6 h-6">
          <Image
            src={item.icon || "/placeholder.svg"}
            alt={`${item.label} icon`}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    ));

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "border-r border-blue-400 bg-blue-500 font-mono relative overflow-hidden transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-4 border-b border-blue-400">
          <Link href="#">
            <Image
              src="/new.png"
              alt="StudyZen Logo"
              width={200}
              height={200}
              className="object-contain"
            />
          </Link>
        </div>
        <nav className="flex flex-col justify-between flex-grow py-4 overflow-y-auto">
          <div className="space-y-1">{renderNavItems(mainNavItems)}</div>
          <div className="mt-auto pt-4 border-t border-blue-400">
            {renderNavItems(bottomNavItems)}
          </div>
        </nav>
      </div>
      {/* Optional animated background elements */}
      <div className="absolute top-20 left-4 text-blue-200 opacity-20 animate-float">
        <BookOpen size={48} />
      </div>
      <div
        className="absolute bottom-20 right-4 text-blue-200 opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      >
        <PenTool size={40} />
      </div>
      <div
        className="absolute top-1/2 left-1/4 text-blue-200 opacity-20 animate-float"
        style={{ animationDelay: "1.5s" }}
      >
        <MessageCircle size={36} />
      </div>
    </aside>
  );
}