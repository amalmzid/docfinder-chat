import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorList from "./pages/DoctorList";
import MedicinesList from "./pages/MedicinesListWorking";
import Appointments from "./pages/Appointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientPortal from "./pages/PatientPortal";
import PharmacyDashboard from "./pages/PharmacyDashboard";

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
  </BrowserRouter>
);

export default App;
