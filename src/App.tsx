import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorList from "./pages/DoctorList";
import MedicinesList from "./pages/MedicinesListWorking";
import Appointments from "./pages/Appointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientPortal from "./pages/PatientPortal";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import MinimalTest from "./pages/MinimalTest";

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/medicines" element={<MedicinesList />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute requiredUserType="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient-portal" 
          element={
            <ProtectedRoute requiredUserType="patient">
              <PatientPortal />
            </ProtectedRoute>
          } 
        />
        <Route path="/patient-portal-test" element={<PatientPortal />} />
        <Route path="/minimal-test" element={<MinimalTest />} />
        <Route 
          path="/pharmacy-dashboard" 
          element={
            <ProtectedRoute requiredUserType="pharmacy">
              <PharmacyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
    <Toaster />
  </BrowserRouter>
);

export default App;
