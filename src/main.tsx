import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import "./index.css";

const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const CasesPage = lazy(() => import("./pages/Cases"));
const UploadData = lazy(() => import("./pages/UploadData"));
const NetworkAnalysis = lazy(() => import("./pages/NetworkAnalysis"));
const AlertsPage = lazy(() => import("./pages/Alerts"));
const EvidencePage = lazy(() => import("./pages/Evidence"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const ReportsPage = lazy(() => import("./pages/Reports"));

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b10]">
      <div className="text-xs text-white/30">Loading...</div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="upload" element={<UploadData />} />
              <Route path="network" element={<NetworkAnalysis />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="evidence" element={<EvidencePage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
);
