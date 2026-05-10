import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';

export function useAuth() {
  const { user, isAuthenticated, loading, error, dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      toast.success(`Welcome back, ${user.username}! 👋`);
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      toast.error(msg);
    }
  }, [dispatch, navigate]);

  const register = useCallback(async ({ email, username, password }) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.register({ email, username, password });
      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      toast.success(`Welcome, ${user.username}! 🎉`);
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      toast.error(msg);
    }
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore errors — always clear local state
    } finally {
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      navigate('/login');
    }
  }, [dispatch, navigate]);

  return { user, isAuthenticated, loading, error, login, register, logout };
}
