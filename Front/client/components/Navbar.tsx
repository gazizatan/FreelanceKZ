import { Link, useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Locale } from '@/data/locales';
import { Globe, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-lg dark:bg-black/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            <span className="hidden font-bold text-foreground sm:inline">FreelanceKZ</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden gap-8 md:flex">
            <Link
              to="/browse"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('nav.browse')}
            </Link>
            <Link
              to="/jobs"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Find Jobs
            </Link>
            <Link
              to="/post-job"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('nav.postJob')}
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-1">
              {(['en', 'ru', 'kz'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                    locale === lang
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="text-primary" size={18} />
                  </div>
                  <span className="hidden text-sm font-medium text-foreground sm:inline">
                    {user?.fullName || 'My Profile'}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut size={16} className="mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              /* Guest User Actions */
              <>
                <Link to="/signin" className="hidden sm:inline-flex">
                  <Button variant="ghost">
                    {t('nav.signin')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
