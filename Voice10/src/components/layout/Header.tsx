import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Mic2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Mic2Icon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">VoiceAI</span>
        </Link>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <Button variant="ghost" className="h-10" asChild>
                <Link to="/text-to-speech">Text to Speech</Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="ghost" className="h-10" asChild>
                <Link to="/voice-cloning">Voice Cloning</Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="ghost" className="h-10" asChild>
                <Link to="/podcast">Podcast Creator</Link>
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="hidden md:inline-flex">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
          <Button variant="outline" size="icon" className="md:hidden">
            <Mic2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}