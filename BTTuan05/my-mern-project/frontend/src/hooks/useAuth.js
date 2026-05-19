import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';

/**
 * useAuth — Custom hook that wraps AuthContext and exposes
 * user-facing auth actions: login, register, logout.
 */
export function useAuth() {
  const { user, isAuthenticated, loading, error, dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Đăng nhập thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: message });
    }
  }, [dispatch, navigate]);

  const register = useCallback(async ({ email, username, password }) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.register({ email, username, password });
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Đăng ký thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: message });
    }
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Best-effort logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  return { user, isAuthenticated, loading, error, login, register, logout, clearError };
}
