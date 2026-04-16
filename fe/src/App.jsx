import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SymptomForm from './pages/SymptomForm';
import BookingPage from './pages/BookingPage';
import HistoryPage from './pages/HistoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Activity, Stethoscope, CalendarCheck, Wind, LogOut, HistoryIcon } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { auth, logout } = useContext(AuthContext);

  // Jika di halaman login/register, sembunyikan sidebar & layout standar
  if (['/login', '/register'].includes(location.pathname)) {
    return <main>{children}</main>;
  }

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Wind },
    { path: '/symptoms', label: 'Cek Gejala', icon: Activity },
    { path: '/booking', label: 'Booking', icon: CalendarCheck },
    { path: '/history', label: 'Riwayat Medis', icon: HistoryIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Minimalist layout */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground lexend-font">
            NapasLega
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        {auth.isAuthenticated && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground truncate">{auth.user?.username}</div>
              <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 flex items-center justify-center rounded-sm bg-primary text-primary-foreground">
               <Stethoscope className="w-4 h-4" />
             </div>
             <span className="font-bold text-foreground lexend-font">NapasLega</span>
           </div>
           {auth.isAuthenticated && (
             <button onClick={logout} className="text-muted-foreground"><LogOut className="w-5 h-5" /></button>
           )}
        </header>

        {/* Minimal gradient line like Hero.tsx */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <div className="p-6 md:p-10 container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/symptoms" element={<PrivateRoute><SymptomForm /></PrivateRoute>} />
            <Route path="/booking" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
