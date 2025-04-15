import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-gradient-to-b from-voicevault-softpurple to-white cloud-background">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-voicevault-tertiary">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          The voice memory you're looking for seems to be lost in time.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            asChild
            className="bg-voicevault-primary hover:bg-voicevault-secondary text-white"
          >
            <Link to="/">
              <Home size={18} className="mr-2" />
              Return Home
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline"
          >
            <Link to="/dashboard">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
