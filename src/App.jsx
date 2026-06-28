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
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/login" element={<LoginScreen />} />

      {/* Layout route — MainTabs renders sidebar/topbar + <Outlet /> */}
      <Route element={<MainTabs />}>
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/animals" element={<AnimalDetailScreen />} />
        <Route path="/analytics" element={<AnalyticScreen />} />
        <Route path="/reports" element={<ReportMainScreen />} />
        <Route path="/notifications" element={<NotificationScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/addanimal" element={<AddAnimalScreen />} />
        <Route path="/addactivity" element={<AddActivityScreen />} />
        <Route path="/owner/:ownerId" element={<OwnerSingleScreen />} />
        <Route path="/animal/:animalId" element={<AnimalSingleScreen />} />
        <Route path="/animals/add" element={<AddanimalScreen />} />
        <Route path="/report/:animalId" element={<ReportScreen />} />
        <Route path="/schedule-template" element={<TemplateSettingsScreen />} />
        <Route path="/notification-template" element={<NotifyScreen />} />
        <Route path="/create-account" element={<CreateAccountScreen />} />
      </Route>
    </Routes>
  );
}
export default App;