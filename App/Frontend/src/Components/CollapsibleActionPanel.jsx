// CollapsibleActionPanel.jsx
import * as React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActionPanel } from "./ActionPanel";
import { toggleRightPanel } from '../store/slices/uiSlice';

export function CollapsibleActionPanel() {
  const dispatch = useDispatch();
  const { rightPanelOpen } = useSelector((state) => state.ui);

  const handleToggle = () => {
    dispatch(toggleRightPanel());
  };

  return (
    <div className="relative">
      {/* Trigger bar - dynamically positioned */}
      <div 
        className={`
          fixed top-45 -translate-y-1/2 z-30
          bg-college-blue text-white shadow-lg cursor-pointer
          transition-all duration-300 ease-in-out
          ${rightPanelOpen 
            ? 'right-[0%] w-5 h-20 flex items-center justify-center rounded-r-none rounded-l-lg' 
            : 'right-0 p-2 rounded-l-lg'
          }
        `}
        onClick={handleToggle}
      >
        {rightPanelOpen ? (
          // Minimized state - just the arrow button
          <ChevronRight className="h-7 w-7" />
        ) : (
          // Full state - text and arrow
          <div className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span className="writing-mode-vertical text-sm font-medium tracking-wide">
              Quick Actions
            </span>
          </div>
        )}
        
        {/* Triangular design element */}
        {!rightPanelOpen && (
          <div className="absolute -top-1 left-1 w-0 h-0 border-r-[8px] border-r-transparent border-b-[8px] border-b-college-yellow opacity-60"></div>
        )}
      </div>

      {/* Collapsible panel */}
      <div 
        className={`
          fixed right-0 top-16 h-[calc(100vh-4rem)] w-[25%] min-w-[300px]
          bg-background border-l border-college-blue/20 shadow-lg z-20
          transition-transform duration-300 ease-in-out
          ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Triangular design elements */}
        <div className="absolute top-4 left-4 w-0 h-0 border-r-[20px] border-r-transparent border-b-[20px] border-b-college-yellow opacity-30"></div>
        <div className="absolute top-8 left-8 w-0 h-0 border-r-[15px] border-r-transparent border-b-[15px] border-b-college-red opacity-40"></div>
        
        <div className="p-6 h-full overflow-y-auto">
          <ActionPanel />
        </div>
      </div>

      {/* Backdrop when panel is open */}
      {rightPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10"
          onClick={handleToggle}
        />
      )}
    </div>
  );
}