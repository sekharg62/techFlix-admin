import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Reviews } from './pages/Reviews';
import { HeroSlides } from './pages/HeroSlides';
import { HomeSection } from './pages/HomeSection';
import { Login } from './pages/Login';

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/login" replace />;
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1f1f27',
              color: '#ffffff',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#4caf50',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#e50914',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
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
