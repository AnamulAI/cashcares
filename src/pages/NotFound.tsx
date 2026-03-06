import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-sm px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mx-auto mb-5">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-5xl font-bold font-display tracking-tight text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-6 gap-1.5">
          <Link to="/dashboard">
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
