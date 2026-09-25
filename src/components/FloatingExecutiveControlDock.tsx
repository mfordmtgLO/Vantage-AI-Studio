/**
 * ============================================================================
 * VANTAGE AI STUDIO • DRAGGABLE & DOCKABLE FLOATING EXECUTIVE CONTROL DOCK
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Provides:
 * 1. Horizontal/Vertical custom scrollbars so NO buttons are cut off on any screen size.
 * 2. Ability to be dragged by outer boundary edges or dedicated grip handle.
 * 3. 4 Docking Presets: Dock Bottom, Dock Top, Dock Left, Dock Right, or Free Float.
 * 4. LocalStorage persistence for dock position preferences.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceTab } from '../types';
import { User } from 'firebase/auth';
import { 
  Users, Smartphone, Home, Brain, LogOut, GripVertical, GripHorizontal,
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight, RotateCcw, Shield, Globe,
  Sparkles, Key, Building2, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';

export type DockPreset = 'bottom' | 'top' | 'left' | 'right' | 'free';

interface FloatingExecutiveControlDockProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  user: User | null;
  onLogout: () => void;
  onOpenMobileAdmin?: () => void;
  onOpenPublicWebsite?: () => void;
  onOpenByokDrawer?: () => void;
}

export const FloatingExecutiveControlDock: React.FC<FloatingExecutiveControlDockProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenMobileAdmin,
  onOpenPublicWebsite,
  onOpenByokDrawer
}) => {
  const [dockPreset, setDockPreset] = useState<DockPreset>(() => {
    try {
      const saved = localStorage.getItem('vantage_dock_preset');
      if (saved && ['bottom', 'top', 'left', 'right', 'free'].includes(saved)) {
        return saved as DockPreset;
      }
    } catch {}
    return 'bottom';
  });

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('vantage_dock_coords');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: 20, y: window.innerHeight - 80 };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('vantage_dock_preset', dockPreset);
    } catch {}
  }, [dockPreset]);

  useEffect(() => {
    try {
      localStorage.setItem('vantage_dock_coords', JSON.stringify(position));
    } catch {}
  }, [position]);

  // Drag Handlers for Mouse & Touch
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only allow drag if target is boundary frame or grip handle
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return; // Ignore button clicks
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setDockPreset('free');
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Determine Dock Positioning Styles
  const getDockClasses = () => {
    switch (dockPreset) {
      case 'top':
        return 'fixed top-16 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-4xl flex-row';
      case 'left':
        return 'fixed top-1/4 left-3 z-40 max-h-[70vh] flex-col max-w-[280px]';
      case 'right':
        return 'fixed top-1/4 right-3 z-40 max-h-[70vh] flex-col max-w-[280px]';
      case 'free':
        return 'fixed z-40 flex-row max-w-[92vw]';
      case 'bottom':
      default:
        return 'fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-4xl flex-row';
    }
  };

  const getDockInlineStyle = (): React.CSSProperties => {
    if (dockPreset === 'free') {
      return {
        left: `${position.x}px`,
        top: `${position.y}px`
      };
    }
    return {};
  };

  const isVertical = dockPreset === 'left' || dockPreset === 'right';

  return (
    <div
      style={getDockInlineStyle()}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className={`${getDockClasses()} bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-2 ${
        isDragging ? 'border-blue-500 ring-4 ring-blue-500/30' : 'border-slate-700/80'
      } rounded-2xl shadow-2xl p-1.5 flex items-center gap-1.5 transition-all duration-150 select-none cursor-grab active:cursor-grabbing group`}
      title="Drag by border or handle to move floating control dock anywhere"
    >
      {/* Drag & Dock Controls Trigger */}
      <div className="flex items-center gap-1 shrink-0 bg-slate-800/90 rounded-xl p-1 border border-slate-700">
        <button
          type="button"
          onClick={() => setShowControls(prev => !prev)}
          className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer flex items-center justify-center"
          title="Change Dock Position (Top, Bottom, Left, Right, Free Drag)"
        >
          {isVertical ? <GripHorizontal className="w-4 h-4 text-blue-400" /> : <GripVertical className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Quick Dock Popover */}
        {showControls && (
          <div className="absolute bottom-full mb-2 left-0 z-50 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl flex items-center gap-1 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => { setDockPreset('bottom'); setShowControls(false); }}
              className={`p-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${dockPreset === 'bottom' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              title="Dock at Bottom"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bottom</span>
            </button>

            <button
              type="button"
              onClick={() => { setDockPreset('top'); setShowControls(false); }}
              className={`p-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${dockPreset === 'top' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              title="Dock at Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Top</span>
            </button>

            <button
              type="button"
              onClick={() => { setDockPreset('left'); setShowControls(false); }}
              className={`p-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${dockPreset === 'left' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              title="Dock at Left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Left</span>
            </button>

            <button
              type="button"
              onClick={() => { setDockPreset('right'); setShowControls(false); }}
              className={`p-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${dockPreset === 'right' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              title="Dock at Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Right</span>
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Hint Arrows (When docked horizontally) */}
      {!isVertical && (
        <button
          type="button"
          onClick={scrollLeft}
          className="p-1 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-700 transition cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
          title="Scroll Dock Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Main Buttons Container with Custom Scrollbar */}
      <div
        ref={scrollContainerRef}
        className={`flex ${isVertical ? 'flex-col max-h-[60vh] overflow-y-auto' : 'flex-row overflow-x-auto'} items-center gap-1.5 custom-scrollbar touch-pan-x min-w-0 flex-1`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('lo_agent_profiles')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'lo_agent_profiles'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
          }`}
          title="Edit Kanndice McLean & LO Contact Info"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>👥 LO &amp; Agent Profiles</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-black rounded-full">
            Kanndice
          </span>
        </button>

        {onOpenMobileAdmin && (
          <button
            type="button"
            onClick={onOpenMobileAdmin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            title="Launch Mobile Admin Dashboard"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>📱 Mobile Admin</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('real_estate')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'real_estate'
              ? 'bg-blue-600 text-white shadow-md font-black'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>🏠 GeoMap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brain')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'brain'
              ? 'bg-purple-600 text-white shadow-md font-black'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>🧠 2nd Brain</span>
        </button>

        {onOpenByokDrawer && (
          <button
            type="button"
            onClick={onOpenByokDrawer}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            title="API Keys & BYOK Credentials"
          >
            <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>🔑 API Keys</span>
          </button>
        )}

        {onOpenPublicWebsite && (
          <button
            type="button"
            onClick={onOpenPublicWebsite}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            title="Public Website Portal"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>🌐 Public Site</span>
          </button>
        )}

        <div className={`${isVertical ? 'w-full h-px my-1' : 'h-4 w-px mx-0.5'} bg-slate-700 shrink-0`} />

        <button
          type="button"
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl bg-rose-900/90 hover:bg-rose-800 text-rose-200 border border-rose-500/50 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm whitespace-nowrap"
          title="Sign Out of Vantage AI Studio"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
          <span>🚪 Sign Out</span>
        </button>
      </div>

      {/* Horizontal Scroll Right Arrow */}
      {!isVertical && (
        <button
          type="button"
          onClick={scrollRight}
          className="p-1 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-700 transition cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
          title="Scroll Dock Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
