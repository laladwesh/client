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

// GET /api/users/me/addresses - get current user's addresses
const getMyAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.addresses || []);
});

// POST /api/users/me/addresses - add a new address
const addMyAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const addr = req.body;
  if (!addr.line1 || !addr.city || !addr.postalCode) {
    res.status(400);
    throw new Error('Required address fields missing');
  }
  if (addr.isDefault) {
    (user.addresses || []).forEach((a) => (a.isDefault = false));
  }
  user.addresses = user.addresses || [];
  user.addresses.push(addr);
  await user.save();
  res.status(201).json(user.addresses);
});

// PUT /api/users/me/addresses/:addressId - update address
const updateMyAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const idx = user.addresses.findIndex((a) => String(a._id) === String(addressId));
  if (idx === -1) {
    res.status(404);
    throw new Error('Address not found');
  }
  const updated = req.body;
  if (updated.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses[idx] = { ...user.addresses[idx]._doc, ...updated };
  await user.save();
  res.json(user.addresses[idx]);
});

// DELETE /api/users/me/addresses/:addressId - remove address
const deleteMyAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.addresses = (user.addresses || []).filter((a) => String(a._id) !== String(addressId));
  await user.save();
  res.json(user.addresses || []);
});

export { getMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress };