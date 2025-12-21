import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// GET /api/users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-__v');
  res.json(users);
});

// PUT /api/users/:id (admin) - update role or name
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { name, role } = req.body;
  if (name) user.name = name;
  if (role) user.role = role;
  await user.save();
  res.json(user);
});

// DELETE /api/users/:id (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.remove();
  res.json({ message: 'User removed' });
});

export { getUsers, updateUser, deleteUser };