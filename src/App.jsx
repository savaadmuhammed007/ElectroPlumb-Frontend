import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListProvider } from './context/ListContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
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
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Worker Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Dedicated Electrical List Page */}
                <Route
                  path="/electrical-list"
                  element={
                    <ProtectedRoute>
                      <ElectricalList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-electrical-list"
                  element={
                    <ProtectedRoute>
                      <ElectricalList />
                    </ProtectedRoute>
                  }
                />

                {/* Dedicated Plumbing List Page */}
                <Route
                  path="/plumbing-list"
                  element={
                    <ProtectedRoute>
                      <PlumbingList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-plumbing-list"
                  element={
                    <ProtectedRoute>
                      <PlumbingList />
                    </ProtectedRoute>
                  }
                />

                {/* General Create List Route */}
                <Route
                  path="/create-list"
                  element={
                    <ProtectedRoute>
                      <CreateList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-lists"
                  element={
                    <ProtectedRoute>
                      <MyLists />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/lists/:id"
                  element={
                    <ProtectedRoute>
                      <ListDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
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

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
