import { type ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Shield,
  Bell,
  CreditCard,
  ChevronDown,
  UserCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update current path from window.location (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);

      // Listen for route changes
      const handleRouteChange = () => {
        setCurrentPath(window.location.pathname);
      };

      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    const name = email.split('@')[0];
    if (!name) return 'U';
    if (name.includes('.')) {
      const parts = name.split('.');
      return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/forecasters", label: "Forecasters" },
    { href: "/predictions", label: "Predictions" },
    { href: "/rankings", label: "Rankings" },
    { href: "/articles", label: "Articles" },
    { href: "/methodology", label: "Methodology" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center px-2 py-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                🔮 Opinion Pointer
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                {navLinks.map((link) => {
                  const isActive = currentPath === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                        isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center space-x-3">
                {session ? (
                  <>
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all group"
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {getUserInitials(session.user.email || 'U')}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">Signed in as</p>
                            <p className="text-sm text-gray-600 truncate">{session.user.email}</p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              Dashboard
                            </Link>

                            <Link
                              href="/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <UserCircle className="h-4 w-4" />
                              My Profile
                            </Link>

                            <Link
                              href="/settings"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              Settings
                            </Link>

                            <Link
                              href="/pricing"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <CreditCard className="h-4 w-4" />
                              Subscription
                            </Link>

                            {session.user.role === "ADMIN" && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <Link
                                  href="/admin"
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                  <Shield className="h-4 w-4" />
                                  Admin Panel
                                </Link>
                              </>
                            )}
                          </div>

                          {/* Support & Sign Out */}
                          <div className="border-t border-gray-100 pt-1">
                            <Link
                              href="/support"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <HelpCircle className="h-4 w-4" />
                              Help & Support
                            </Link>

                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                handleSignOut();
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block pl-3 pr-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-900 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile auth section */}
            <div className="pt-4 pb-3 border-t border-gray-200 bg-white">
              {session ? (
                <div className="space-y-1">
                  {/* User Info Header */}
                  <div className="px-4 py-3 flex items-center gap-3 bg-white border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {getUserInitials(session.user.email || 'U')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Signed in as</div>
                      <div className="text-sm text-gray-600 truncate">{session.user.email}</div>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5" />
                    My Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>

                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CreditCard className="h-5 w-5" />
                    Subscription
                  </Link>

                  {session.user.role === "ADMIN" && (
                    <>
                      <div className="border-t border-gray-200 my-1"></div>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        Admin Panel
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-1">
                    <Link
                      href="/support"
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <HelpCircle className="h-5 w-5" />
                      Help & Support
                    </Link>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/auth/signin"
                    className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <main className="min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}