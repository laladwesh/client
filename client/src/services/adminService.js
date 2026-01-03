const API = process.env.REACT_APP_API_URL || '';

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProducts(token) {
  const res = await fetch(`${API}/products`, {
    headers: { ...authHeader(token) }
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

// Blogs
export async function fetchBlogs(token) {
  const res = await fetch(`${API}/blogs`, { headers: { ...authHeader(token) } });
  if (!res.ok) throw new Error('Failed to fetch blogs');
  return res.json();
}

export async function createBlog(data, token) {
  const res = await fetch(`${API}/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create blog failed');
  return res.json();
}

export async function updateBlog(blogId, data, token) {
  const res = await fetch(`${API}/blogs/${blogId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update blog failed');
  return res.json();
}

export async function deleteBlog(blogId, token) {
  const res = await fetch(`${API}/blogs/${blogId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error('Delete blog failed');
  return res.json();
}

// Users
export async function fetchUsers(token) {
  const res = await fetch(`${API}/users`, { headers: { ...authHeader(token) } });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function updateUser(userId, data, token) {
  const res = await fetch(`${API}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update user failed');
  return res.json();
}

export async function deleteUser(userId, token) {
  const res = await fetch(`${API}/users/${userId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error('Delete user failed');
  return res.json();
}

export async function createProduct(data, token) {
  const res = await fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json();
}

export async function updateProduct(productId, data, token) {
  const res = await fetch(`${API}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

export async function uploadProductImage(productId, file, token) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API}/products/${productId}/images`, {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: fd,
  });
  if (!res.ok) throw new Error('Image upload failed');
  return res.json();
}

export async function uploadBlogImage(blogId, file, token) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API}/blogs/${blogId}/images`, {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: fd,
  });
  if (!res.ok) throw new Error('Blog image upload failed');
  return res.json();
}

export async function deleteProduct(productId, token) {
  const res = await fetch(`${API}/products/${productId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function deleteProductImage(productId, imageUrl, token) {
  const res = await fetch(`${API}/products/${productId}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error('Delete image failed');
  return res.json();
}

export async function reorderProductImages(productId, images, token) {
  const res = await fetch(`${API}/products/${productId}/images/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ images }),
  });
  if (!res.ok) throw new Error('Reorder images failed');
  return res.json();
}

export async function deleteBlogImage(blogId, imageUrl, token) {
  const res = await fetch(`${API}/blogs/${blogId}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error('Delete blog image failed');
  return res.json();
}

export async function adminLoginWithToken(token) {
  // optional helper to verify token and fetch user; backend lacks a verify endpoint so we rely on stored user
  return { token };
}
