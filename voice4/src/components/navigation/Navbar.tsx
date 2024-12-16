import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { useAuth } from '../auth/AuthProvider';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                {user.subscription_tier === 'premium' && (
                  <NavLink to="/voice-cloning">Voice Cloning</NavLink>
                )}
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login">Sign In</NavLink>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <MobileNavLink to="/dashboard" onClick={toggleMenu}>
                  Dashboard
                </MobileNavLink>
                {user.subscription_tier === 'premium' && (
                  <MobileNavLink to="/voice-cloning" onClick={toggleMenu}>
                    Voice Cloning
                  </MobileNavLink>
                )}
                <button
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={toggleMenu}>
                  Sign In
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={toggleMenu}>
                  Get Started
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-gray-500 hover:text-gray-800 px-3 py-2 text-sm font-medium"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }: { 
  to: string; 
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}