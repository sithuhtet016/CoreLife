import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOutUser } from "../api";

function HeaderUserMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = "header-user-menu";
  const navigate = useNavigate();

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
      <button
        onClick={() => setOpen((value) => !value)}
        className="h-10 px-4 rounded-full border border-gray-100 bg-white flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-label="Toggle profile menu"
        aria-controls={menuId}
        aria-haspopup="menu"
      >
        <img
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
          alt="User"
          className="w-7 h-7 rounded-full object-cover"
        />
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-dark leading-tight">
            Alex Morgan
          </p>
        </div>
        <i className="fas fa-chevron-down text-xs text-gray-400 ml-1"></i>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-100 bg-white shadow-lg p-2 z-50"
        >
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-bodyText hover:bg-gray-50 hover:text-dark transition-colors"
          >
            <i className="fas fa-gauge"></i>
            Dashboard
          </Link>
          <Link
            to="/settings#profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-bodyText hover:bg-gray-50 hover:text-dark transition-colors"
          >
            <i className="far fa-user"></i>
            Profile
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-bodyText hover:bg-gray-50 hover:text-dark transition-colors"
          >
            <i className="fas fa-gear"></i>
            Settings
          </Link>
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
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <i className="fas fa-right-from-bracket"></i>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default HeaderUserMenu;
