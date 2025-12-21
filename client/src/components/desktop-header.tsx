import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { NeoButton } from "./neo-button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

export function DesktopHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const avatarLabel = user?.email?.slice(0, 1).toUpperCase() || "G";
  const avatarImage = user?.user_metadata?.avatar_url;

  return (
    <header className="hidden md:flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex justify-center items-center">
          <img
            src="/rank-factory-logo.png"
            alt="Rank Factory Logo"
            className="h-8 w-8 mr-2 inline-block"
          />
          <span className="font-logo font-bold text-xl">랭크팩토리</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {[
              { key: "A", label: "배틀" },
              { key: "B", label: "테스트" },
              { key: "C", label: "티어" },
              { key: "D", label: "블로그" },
              { key: "G", label: "게임", path: "/games" },
            ].map((item) => (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink
                  href={item.path || `/?mode=${item.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.path) {
                      navigate(item.path);
                    } else {
                      navigate(`/?mode=${item.key}`);
                    }
                  }}
                  className={navigationMenuTriggerStyle()}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-3">
        {!user ? (
          <NeoButton
            size="sm"
            variant="outline"
            onClick={() => navigate("/login")}
          >
            로그인
          </NeoButton>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="focus:outline-none"
            >
              <Avatar>
                {avatarImage && (
                  <AvatarImage src={avatarImage} alt={user?.email} />
                )}
                <AvatarFallback>{avatarLabel}</AvatarFallback>
              </Avatar>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-black/10 bg-white shadow-md z-20">
                <div className="px-3 py-2 border-b border-black/10 text-sm">
                  {user?.email}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  >
                    내 정보
                  </button>
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await signOut();
                      navigate("/login");
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default DesktopHeader;
