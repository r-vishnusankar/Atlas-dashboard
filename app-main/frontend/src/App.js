import React, { useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { CONFIG } from "@/config";
import { DashboardProvider } from "@/context/DashboardContext";
import PinGate from "@/components/PinGate";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import OverviewView from "@/views/OverviewView";
import ProjectsView from "@/views/ProjectsView";
import PipelineView from "@/views/PipelineView";
import AlertsView from "@/views/AlertsView";
import TimelineView from "@/views/TimelineView";

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="stresk-app" data-testid="stresk-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenu={() => setSidebarOpen((v) => !v)} />
      <main className="stresk-main" data-testid="stresk-main">
        <Routes>
          <Route path="/" element={<OverviewView />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/pipeline" element={<PipelineView />} />
          <Route path="/alerts" element={<AlertsView />} />
          <Route path="/timeline" element={<TimelineView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [unlocked, setUnlocked] = useState(
    () => !CONFIG.PIN_ENABLED || sessionStorage.getItem("stresk.unlocked") === "1",
  );

  if (!unlocked) {
    return (
      <PinGate
        onUnlock={() => {
          sessionStorage.setItem("stresk.unlocked", "1");
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <DashboardProvider>
        <Shell />
        <Toaster position="bottom-right" richColors />
      </DashboardProvider>
    </BrowserRouter>
  );
}

// eslint-disable-next-line no-unused-vars
const _navUsage = NavLink; // keep import stable for visual-edits

export default App;
