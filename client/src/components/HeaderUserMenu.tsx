import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMe, signOutUser } from "../api";
import type { AuthUser } from "../types";

type MobileNavItem = {
  label: string;
  to: string;
};

function isActivePath(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function HeaderUserMenu({
  mobileNavItems = [],
}: {
  mobileNavItems?: readonly MobileNavItem[];
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = "header-user-menu";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const response = await getMe();
        if (!active) return;
        setUser(response.user);
      } catch {
        if (!active) return;
        setUser(null);
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      const target = event.target as Node | null;
      if (!target || rootRef.current.contains(target)) return;
      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="sr-only" aria-live="polite">
        {user?.full_name ?? "Account"}
      </div>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-gray-100 bg-white px-3 transition-colors hover:bg-gray-50 sm:gap-3 sm:px-4"
        aria-expanded={open}
        aria-label="Open account menu"
        aria-controls={menuId}
        aria-haspopup="dialog"
      >
        <div
          className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-semibold"
          aria-hidden="true"
        >
          {getInitials(user)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-dark leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {getDisplayName(user)}
          </p>
        </div>
        <i className="fas fa-chevron-down text-xs text-gray-400 ml-1"></i>
      </button>

      {open && (
        <div
          id={menuId}
          aria-label="Account options"
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg"
        >
          {mobileNavItems.length > 0 && (
            <div className="mb-2 flex flex-col gap-1 border-b border-gray-100 pb-2 md:hidden">
              {mobileNavItems.map((item) => {
                const isActive = isActivePath(location.pathname, item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "flex items-center rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
                        : "flex items-center rounded-xl px-3 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-50"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
          <button
            onClick={async () => {
              setOpen(false);
              try {
                await signOutUser();
              } catch {
                // Keep navigation behavior even if sign-out request fails.
              }
              navigate("/login");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <i className="fas fa-right-from-bracket"></i>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function getDisplayName(user: AuthUser | null) {
  const rawName = user?.full_name?.trim() || "";
  if (rawName) {
    const parts = rawName.split(/\s+/).filter(Boolean);
    if (parts.length > 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return rawName;
  }

  if (user?.email) return user.email.split("@")[0];
  return "Account";
}

function getInitials(user: AuthUser | null) {
  const name = getDisplayName(user).trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default HeaderUserMenu;
