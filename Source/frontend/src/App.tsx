import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './core/store/store';
import { checkAuthThunk } from './core/store/reducers/auth';
import Header from './components/Header';
import Notification from './components/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TendersPage from './pages/TendersPage';
import TenderDetailPage from './pages/TenderDetailPage';
import MyTendersPage from './pages/MyTendersPage';
import MyBidsPage from './pages/MyBidsPage';
import ContractsPage from './pages/ContractsPage';
import RatingPage from './pages/RatingPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminContractsPage from './pages/AdminContractsPage';
import NotFoundPage from './pages/NotFoundPage';

function Layout() {
  const location = useLocation();
  const hideHeader = ['/login', '/register'].includes(location.pathname);
  return !hideHeader ? <Header /> : null;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(checkAuthThunk());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Layout />
      <Notification />
      <Routes>
        {}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {}
        <Route path="/tenders" element={<ProtectedRoute><TendersPage /></ProtectedRoute>} />
        <Route path="/tenders/:id" element={<ProtectedRoute><TenderDetailPage /></ProtectedRoute>} />
        <Route path="/contracts" element={<ProtectedRoute><ContractsPage /></ProtectedRoute>} />
        <Route path="/rating" element={<ProtectedRoute><RatingPage /></ProtectedRoute>} />

        {}
        <Route path="/my-tenders" element={
          <ProtectedRoute roles={['customer', 'admin']}><MyTendersPage /></ProtectedRoute>
        } />

        {}
        <Route path="/my-bids" element={
          <ProtectedRoute roles={['supplier', 'admin']}><MyBidsPage /></ProtectedRoute>
        } />

        {}
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>
        } />
        <Route path="/admin/contracts" element={
          <ProtectedRoute roles={['admin']}><AdminContractsPage /></ProtectedRoute>
        } />

        {}
        <Route path="/" element={<Navigate to={isAuth ? '/tenders' : '/login'} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
