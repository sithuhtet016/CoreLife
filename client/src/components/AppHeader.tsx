import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import HeaderUserMenu from "./HeaderUserMenu";

type AppNavItem = {
  label: string;
  to: string;
};

const APP_NAV_ITEMS: readonly AppNavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Habit Tracker", to: "/habit-tracker" },
  { label: "Progress & Analytics", to: "/progress-analytics" },
  { label: "Results", to: "/results" },
  { label: "CoreReads", to: "/corereads" },
];

function isActivePath(pathname: string, target: string) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function AppHeader() {
  const location = useLocation();

  return (
    <header
      id="app-header"
      className="cl-navbar-surface sticky top-0 z-50 w-full"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          <BrandLogo to="/dashboard" />

          <nav className="hidden items-center gap-2 rounded-full border border-gray-100 bg-gray-50 p-2 lg:flex lg:gap-3">
            {APP_NAV_ITEMS.map((item) => {
              const isActive = isActivePath(location.pathname, item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "whitespace-nowrap rounded-full bg-dark px-3 py-2 text-sm font-bold text-white shadow-md transition-colors lg:px-5 lg:py-3 lg:text-base"
                      : "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-bodyText transition-colors hover:bg-gray-100 hover:text-dark lg:px-5 lg:py-3 lg:text-base"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <HeaderUserMenu mobileNavItems={APP_NAV_ITEMS} />
      </div>
    </header>
  );
}

export default AppHeader;
