import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Write from './pages/Write';
import PostDetail from './pages/PostDetail';
import UserBlog from './pages/UserBlog';

function PrivateRoute({ children }) {
  const { currentUser, authReady } = useAuth();
  if (!authReady) return null;
  return currentUser ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { currentUser, authReady } = useAuth();
  if (!authReady) return null;
  return !currentUser ? children : <Navigate to="/home" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/write"
        element={
          <PrivateRoute>
            <Write />
          </PrivateRoute>
        }
      />
      <Route
        path="/post/:postId"
        element={
          <PrivateRoute>
            <PostDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/blog/:userId"
        element={
          <PrivateRoute>
            <UserBlog />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
