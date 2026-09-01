import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListProvider } from './context/ListContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import CreateList from './pages/CreateList';
import ElectricalList from './pages/ElectricalList';
import PlumbingList from './pages/PlumbingList';
import MyLists from './pages/MyLists';
import ListDetail from './pages/ListDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminItems from './pages/AdminItems';

function App() {
  return (
    <AuthProvider>
      <ListProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Fast Access Routes (Zero Auth Required) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Dashboard />} />

                {/* Electrical List Page */}
                <Route path="/electrical-list" element={<ElectricalList />} />
                <Route path="/create-electrical-list" element={<ElectricalList />} />

                {/* Plumbing List Page */}
                <Route path="/plumbing-list" element={<PlumbingList />} />
                <Route path="/create-plumbing-list" element={<PlumbingList />} />

                {/* General Create List */}
                <Route path="/create-list" element={<CreateList />} />

                {/* Saved Lists & Detail */}
                <Route path="/my-lists" element={<MyLists />} />
                <Route path="/lists/:id" element={<ListDetail />} />

                {/* Business Profile & PDF Settings */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />

                {/* Admin Only Routes (Protected by Admin PIN: admin123) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/items"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminItems />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ListProvider>
    </AuthProvider>
  );
}

export default App;
