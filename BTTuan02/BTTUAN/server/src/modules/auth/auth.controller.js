const authService = require('./auth.service');
const { ApiResponse } = require('../../shared/utils/apiResponse');

const register = async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.success(result, 'Registered successfully'));
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(ApiResponse.success(result, 'Logged in successfully'));
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  res.status(200).json(ApiResponse.success(result, 'Token refreshed'));
};

const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  // We do a best-effort logout; user id may come from token
  // For simplicity, just return success
  res.status(200).json(ApiResponse.success(null, 'Logged out'));
};

module.exports = { register, login, refresh, logout };
