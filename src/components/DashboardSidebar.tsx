
import { Home, User, PackageSearch, AlertCircle, Mic2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Home",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Profile",
    icon: User,
    url: "#profile",
  },
  {
    title: "Clone Voice",
    icon: Mic2,
    url: "/voice-cloning",
  },
  {
    title: "Buy Credits",
    icon: CreditCard,
    url: "/pricing",
  },
  {
    title: "Marketplace",
    icon: PackageSearch,
    url: "#marketplace",
  },
  {
    title: "About",
    icon: AlertCircle,
    url: "#about",
  },
];

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
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title} 
                    onClick={() => handleMenuItemClick(item.url)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
