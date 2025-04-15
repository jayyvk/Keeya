
import { Home, Mic2, CreditCard, PackageSearch, AlertCircle, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [{
  title: "Home",
  icon: Home,
  url: "/dashboard"
}, {
  title: "Clone Voice",
  icon: Mic2,
  url: "/voice-cloning"
}, {
  title: "Buy Credits",
  icon: CreditCard,
  url: "/pricing"
}, {
  title: "Marketplace",
  icon: PackageSearch,
  url: "#marketplace"
}, {
  title: "About",
  icon: AlertCircle,
  url: "#about"
}];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleMenuItemClick = (url: string) => {
    if (url.startsWith('/')) {
      navigate(url);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title} 
                    onClick={() => handleMenuItemClick(item.url)} 
                    className="text-gray-500 hover:text-voicevault-primary hover:bg-voicevault-softgray/50"
                  >
                    <a href={item.url}>
                      <item.icon className="text-gray-500 hover:text-voicevault-primary" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-voicevault-primary">
            <AvatarFallback className="bg-voicevault-softgray text-voicevault-primary">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
