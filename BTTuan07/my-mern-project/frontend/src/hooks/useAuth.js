import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';

export function useAuth() {
  const { user, isAuthenticated, loading, error, dispatch } = useAuthContext();

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const login = useCallback(async ({ email, password }, navigate) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken, redirectUrl } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      
      // Navigate based on redirectUrl from server
      if (navigate) {
        navigate(redirectUrl || '/');
      }
      return { redirectUrl };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Đăng nhập thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw err;
    }
  }, [dispatch]);

  const register = useCallback(async ({ email, username, password }) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.register({ email, username, password });
      return res.data; // Return success message, not tokens (OTP verification needed)
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Đăng ký thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw err;
    }
  }, [dispatch]);

  const verifyOtp = useCallback(async ({ email, otp }, navigate) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authAPI.verifyOtp({ email, otp });
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      if (navigate) navigate('/');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Xác thực OTP thất bại';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw err;
    }
  }, [dispatch]);

  const resendOtp = useCallback(async ({ email }) => {
    try {
      const res = await authAPI.resendOtp({ email });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Gửi lại OTP thất bại';
      throw new Error(message);
    }
  }, []);

  const forgotPassword = useCallback(async ({ email }) => {
    try {
      const res = await authAPI.forgotPassword({ email });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Yêu cầu thất bại';
      throw new Error(message);
    }
  }, []);

  const resetPassword = useCallback(async ({ email, otp, newPassword }) => {
    try {
      const res = await authAPI.resetPassword({ email, otp, newPassword });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Đặt lại mật khẩu thất bại';
      throw new Error(message);
    }
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Đổi mật khẩu thất bại';
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Best-effort logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
    }
  }, [dispatch]);

  const updateProfile = useCallback(async ({ username, avatar }) => {
    try {
      const res = await authAPI.updateProfile({ username, avatar });
      dispatch({ type: 'SET_USER', payload: res.data });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Cập nhật thất bại';
      throw err;
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    updateProfile,
    clearError,
  };
}
