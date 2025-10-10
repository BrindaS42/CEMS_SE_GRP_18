// Header.jsx

import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { setSidebarHovered, toggleSidebar } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import collegeLogoPng from '../assets/college-logo.png';

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hoverTimeoutRef = useRef(null);
  
  const { currentPage, sidebarPanelHovered } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleSidebarHover = (hovered) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (hovered) {
      dispatch(setSidebarHovered(true));
    } else {
      // Add 1 second delay before closing, but only if not hovering over sidebar panel
      hoverTimeoutRef.current = setTimeout(() => {
        // Only close if not hovering over the sidebar panel
        if (!sidebarPanelHovered) {
          dispatch(setSidebarHovered(false));
        }
      }, 1000);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Triangular design elements */}
      <div className="absolute top-0 left-20 w-0 h-0 border-r-[20px] border-r-transparent border-t-[16px] border-t-college-yellow opacity-30"></div>
      <div className="absolute top-2 left-32 w-0 h-0 border-r-[15px] border-r-transparent border-t-[12px] border-t-college-red opacity-40"></div>
      
      <div className="flex h-16 items-center justify-between px-6 relative">
        <div className="flex items-center gap-4">
          <div
            className="relative"
            onMouseEnter={() => handleSidebarHover(true)}
            onMouseLeave={() => handleSidebarHover(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarToggle}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <img src={collegeLogoPng} alt="DAU Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-semibold text-college-blue">{currentPage}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-college-blue">{user.name}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-auto p-0 text-xs text-college-red hover:text-white justify-end"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
          <Avatar className="h-8 w-8 ring-2 ring-college-yellow/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-college-yellow text-college-blue">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}