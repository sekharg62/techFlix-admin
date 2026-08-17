import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CustomThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Reviews } from './pages/Reviews';
import { HeroSlides } from './pages/HeroSlides';
import { HomeSection } from './pages/HomeSection';
import { Login } from './pages/Login';

// Protected route wrapper component: checks if user exists and has a valid token
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Redirect route for public pages like /login if user is already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  
  if (user && user.token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Placeholder for other pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div><h2>{title}</h2><p>This page is under construction.</p></div>
);

function App() {
  return (
    <UserProvider>
      <CustomThemeProvider>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<PlaceholderPage title="Orders" />} />
              <Route path="customers" element={<PlaceholderPage title="Customers" />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="hero-slides" element={<HeroSlides />} />
              <Route path="home-section" element={<HomeSection />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </CustomThemeProvider>
    </UserProvider>
  );
}

export default App;
