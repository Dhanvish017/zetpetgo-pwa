import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "./screens/login/LoginScreen";
import MainTabs from "./navigation/MainTabs";
import DashboardScreen from "./screens/dashboard/dashboardScreen";
import AddAnimalScreen from "./screens/addanimal/AddAnimalScreen";
import AddActivityScreen from "./screens/addanimal/AddActivityscreen.jsx";
import AnimalDetailScreen from "./screens/animaldetails/AnimalDetailScreen";
import OwnerSingleScreen from "./screens/animaldetails/OwnerSingleScreen.jsx";
import AnalyticScreen from "./screens/Analytics/AnalyticScreen";
import NotificationScreen from "./screens/notification/NotificationScreen";
import ProfileScreen from "./screens/profile/profileScreen";
import AnimalSingleScreen from "./screens/animaldetails/AnimalSingleScreen.jsx";
import AddanimalScreen from "./screens/animaldetails/AddanimalScreen.jsx";
import ReportScreen from "./screens/animaldetails/ReportScreen.jsx";
import ReportMainScreen from "./screens/report/reportscreen.jsx";
import TemplateSettingsScreen from "./screens/settings/Templatesettingsscreen.jsx";
import NotifyScreen from "./screens/settings/NotifyScreen.jsx";
import CreateAccountScreen from "./screens/profile/CreateAccountScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          localStorage.getItem("token")
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      <Route path="/login" element={<LoginScreen />} />

      {/* Layout route — MainTabs renders sidebar/topbar + <Outlet /> */}
      <Route element={<MainTabs />}>
        <Route path="/dashboard" element={<ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>} />
        <Route path="/animals" element={<ProtectedRoute>
          <AnimalDetailScreen />
        </ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute>
          <AnalyticScreen />
        </ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute>
          <ReportMainScreen />
        </ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute>
          <NotificationScreen />
        </ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute>
          <ProfileScreen />
        </ProtectedRoute>} />
        <Route path="/addanimal" element={<ProtectedRoute>
          <AddAnimalScreen />
        </ProtectedRoute>} />
        <Route path="/addactivity" element={<ProtectedRoute>
          <AddActivityScreen />
        </ProtectedRoute>} />
        <Route path="/owner/:ownerId" element={<ProtectedRoute>
          <OwnerSingleScreen />
        </ProtectedRoute>} />
        <Route path="/animal/:animalId" element={<ProtectedRoute>
          <AnimalSingleScreen />
        </ProtectedRoute>} />
        <Route path="/animals/add" element={<ProtectedRoute>
          <AddanimalScreen />
        </ProtectedRoute>} />
        <Route path="/report/:animalId" element={<ProtectedRoute>
          <ReportScreen />
        </ProtectedRoute>} />
        <Route path="/schedule-template" element={<ProtectedRoute>
          <TemplateSettingsScreen />
        </ProtectedRoute>} />
        <Route path="/notification-template" element={<ProtectedRoute>
          <NotifyScreen />
        </ProtectedRoute>} />
        <Route path="/create-account" element={<ProtectedRoute>
          <CreateAccountScreen />
        </ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
export default App;