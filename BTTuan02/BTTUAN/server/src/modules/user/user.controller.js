const userService = require('./user.service');
const { ApiResponse } = require('../../shared/utils/apiResponse');

const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.status(200).json(ApiResponse.success(user, 'Profile retrieved'));
};

const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(ApiResponse.success(user, 'Profile updated'));
};

const deleteAccount = async (req, res) => {
  await userService.deleteAccount(req.user._id);
  res.status(200).json(ApiResponse.success(null, 'Account deleted'));
};

module.exports = { getProfile, updateProfile, deleteAccount };
