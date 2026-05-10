/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ClientDashboard from './pages/ClientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // If we are not on a dashboard page, strictly enforce light mode (white)
    const isDashboard = location.pathname.startsWith('/client/') || location.pathname.startsWith('/provider/');
    if (!isDashboard) {
      document.documentElement.classList.remove('dark');
    }
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      </Routes>
    </>
  );
}

