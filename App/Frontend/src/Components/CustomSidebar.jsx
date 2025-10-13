// src/components/CustomSidebar.jsx

import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Inbox, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { setCurrentPage, setSidebarHovered, setSidebarPanelHovered } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';

const navigationItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "adminpanel", 
    title: "Admin Panel",
    icon: Settings,
  },
  {
    id: "profile",
    title: "Profile", 
    icon: User,
  },
  {
    id: "inbox",
    title: "Inbox", 
    icon: Inbox,
  },
  {
    id: "settings",
    title: "Settings", 
    icon: Settings,
  },
];

export function CustomSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hoverTimeoutRef = useRef(null);
  
  const { sidebarOpen, sidebarHovered, currentPage } = useSelector((state) => state.ui);
  const showSidebar = sidebarOpen || sidebarHovered;

  const handleNavigation = (page) => {
    let pageName = '';
    let route = '';
    
    switch (page) {
      case "dashboard":
        pageName = "Admin Dashboard";
        route = "/dashboard";
        break;
      case "adminpanel":
        pageName = "Admin Panel";
        route = "/admin";
        break;
      case "profile":
        pageName = "Profile";
        route = "/profile";
        break;
      case "inbox":
        pageName = "Inbox";
        route = "/inbox";
        break;
      case "settings":
        pageName = "Settings";
        route = "/settings";
        break;
      default:
        pageName = "Admin Panel";
        route = "/admin";
    }
    
    dispatch(setCurrentPage(pageName));
    navigate(route);
  };

  const handleSidebarPanelHover = (hovered) => {
    dispatch(setSidebarPanelHovered(hovered));
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (hovered) {
      dispatch(setSidebarHovered(true));
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        dispatch(setSidebarHovered(false));
      }, 100);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div 
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border z-40 
        transition-transform duration-300 ease-in-out
        ${sidebarHovered && !sidebarOpen ? 'shadow-lg' : ''}
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        w-[20%] min-w-[200px]
      `}
      onMouseEnter={() => dispatch(setSidebarPanelHovered(true))}
      onMouseLeave={() => dispatch(setSidebarPanelHovered(false))}
    >
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-college-yellow opacity-20"></div>
      <div className="absolute top-8 right-2 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-college-red opacity-30"></div>
      
      <div className="p-4 space-y-2 h-full flex flex-col">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-4">Navigation</h3>
        
        <div className="space-y-2 flex-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              className={`w-full justify-start h-12 px-4 transition-colors ${
                currentPage.toLowerCase().includes(item.id.toLowerCase())
                  ? 'bg-primary text-primary-foreground' // Active: Blue background, White text
                  : 'bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground' // Inactive: Blue text, Yellow hover
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </Button>
          ))}
        </div>

        {currentPage === "Profile" && (
          <div className="border-t border-sidebar-border pt-4 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}