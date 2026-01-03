import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import AdminOrderDetails from '../components/AdminOrderDetails';
import { useNavigate } from 'react-router-dom';
import {
  fetchProducts, createProduct, updateProduct, uploadProductImage, deleteProductImage, deleteProduct,
  fetchBlogs, createBlog, updateBlog, deleteBlog,
  uploadBlogImage, deleteBlogImage,
  fetchUsers, updateUser, deleteUser,
  reorderProductImages,
} from '../services/adminService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Icons (SVG Components) ---
const Icons = {
  Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  FileText: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  ShoppingBag: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

// --- Initial States ---
const emptyProduct = {
  category: '', product: '', print: '', color: '', fabricType: '', fabricPattern: '', 
  fabricDescription: '', productType: '', length: '', lengthInInches: 0, sleeves: '', 
  closure: '', productDescription: '', features: [], sizeAndFit: '', material: '', 
  mrp: 0, discountedPrice: 0, totalQuantity: 0,
  sizeXXSQuantity: 0, sizeXSQuantity: 0, sizeSQuantity: 0, sizeMQuantity: 0, 
  sizeLQuantity: 0, sizeXLQuantity: 0, sizeXXLQuantity: 0,
  slug: '', images: [], isShownInHomepage: false
};

const emptyBlog = { title: '', subtitle: '', slug: '', excerpt: '', content: '', images: [], tags: [] };

// --- STABLE EXTERNAL COMPONENTS (Prevents focus loss) ---

const InputGroup = ({ label, name, type = "text", placeholder, colSpan = 1, formData, onChange, rows }) => {
  const value = formData && formData[name] !== undefined && formData[name] !== null ? formData[name] : '';
  const checked = Boolean(formData && formData[name]);
  return (
    <div className={colSpan === 2 ? "col-span-2" : ""}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows || 3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
      ) : type === 'checkbox' ? (
        <label className="flex items-center mt-2 cursor-pointer">
          <input
            type="checkbox" name={name} checked={checked} onChange={onChange}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-3 text-sm font-medium text-gray-700">{placeholder || label}</span>
        </label>
      ) : (
        <input
          type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
      )}
    </div>
  );
};

const TabButton = ({ id, label, icon, activeTab, setActiveTab, setSearchQuery }) => (
  <button
    onClick={() => { setActiveTab(id); setSearchQuery(''); }}
    className={`w-full flex items-center space-x-3 px-6 py-3.5 transition-all duration-200 border-r-4
      ${activeTab === id 
        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
  >
    {icon}
    <span className="font-medium tracking-wide text-sm">{label}</span>
  </button>
);

// Sortable Image Item Component
const SortableImageItem = ({ img, index, onDeleteImage }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group w-24 h-24 cursor-move"
    >
      <img
        src={img}
        alt="preview"
        className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200"
      />
      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
        {index + 1}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteImage(img);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-black opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 z-10"
      >
        <Icons.X />
      </button>
    </div>
  );
};

const ImageUploadSection = ({ images, fileMap, setFileMap, onDeleteImage, onReorderImages }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.indexOf(active.id);
      const newIndex = images.indexOf(over.id);
      const newImages = arrayMove(images, oldIndex, newIndex);
      onReorderImages(newImages);
    }
  };

  return (
    <div className="col-span-2 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gallery
          {images && images.length > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              (Drag to reorder - Order: 1, 2, 3...)
            </span>
          )}
        </label>
        {images && images.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-4 mt-3">
                {images.map((img, i) => (
                  <SortableImageItem
                    key={img}
                    img={img}
                    index={i}
                    onDeleteImage={onDeleteImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="w-24 h-24 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 mt-3">
            No Images
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload New
        </label>
        <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
          <div className="space-y-1 text-center">
            <div className="text-gray-400 group-hover:text-black transition-colors">
              <Icons.Upload />
            </div>
            <div className="flex text-sm text-gray-600">
              <span className="font-medium text-indigo-600 group-hover:text-black">
                Click to upload
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {fileMap ? fileMap.name : 'PNG, JPG up to 5MB'}
            </p>
          </div>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => setFileMap(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = !!(storedUser && storedUser.role === 'admin');

  // --- State ---
  const [activeTab, setActiveTab] = useState('products');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [formData, setFormData] = useState({});
  const [fileMap, setFileMap] = useState(null); 
  const [productFormTab, setProductFormTab] = useState('basic'); 

  // Order Details Modal State
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Confirm Modal State - MOVED TO TOP to avoid Reference Errors
  const [confirm, setConfirm] = useState({ open: false, title: '', description: '', onConfirm: () => {}, onCancel: () => {} });

  // --- Effects ---
  useEffect(() => {
    if (!token || !isAdmin) navigate('/');
    else fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res = [];
      if (activeTab === 'products') res = await fetchProducts(token);
      else if (activeTab === 'blogs') res = await fetchBlogs(token);
      else if (activeTab === 'users') res = await fetchUsers(token);
      else if (activeTab === 'orders') res = await getAllOrders(token);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleOpenModal = (item = null) => {
    // For orders, use the order details modal instead
    if (activeTab === 'orders') {
      if (item) {
        setSelectedOrderId(item._id);
        setIsOrderDetailsOpen(true);
      }
      return;
    }

    setFileMap(null);
    setProductFormTab('basic'); 
    if (item) {
      setModalMode('edit');
      const prep = { ...item };
      if (activeTab === 'products' && Array.isArray(prep.features)) {
        prep.features = prep.features.join(', ');
      }
      setFormData(prep);
    } else {
      setModalMode('create');
      if (activeTab === 'products') setFormData({ ...emptyProduct });
      if (activeTab === 'blogs') setFormData({ ...emptyBlog });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDeleteImage = async (imgUrl) => {
    setConfirm({
      open: true,
      title: 'Delete image?',
      description: 'Are you sure you want to delete this image?',
      onConfirm: async () => {
        try {
          if (activeTab === 'products') await deleteProductImage(formData._id, imgUrl, token);
          else if (activeTab === 'blogs') await deleteBlogImage(formData._id, imgUrl, token);
          
          setFormData(prev => ({ ...prev, images: (prev.images || []).filter(x => x !== imgUrl) }));
          toast.success('Image deleted');
        } catch (e) { toast.error('Could not delete image'); }
        finally { setConfirm(c => ({ ...c, open: false })); }
      },
      onCancel: () => setConfirm(c => ({ ...c, open: false }))
    });
  };

  const handleReorderImages = async (newImages) => {
    // Update local state immediately for smooth UX
    setFormData(prev => ({ ...prev, images: newImages }));
    
    // If editing an existing product, save to backend
    if (modalMode === 'edit' && formData._id) {
      try {
        if (activeTab === 'products') {
          await reorderProductImages(formData._id, newImages, token);
          toast.success('Image order saved');
        }
        // Note: You can add similar logic for blogs if needed
      } catch (e) {
        toast.error('Failed to save image order');
        console.error(e);
      }
    }
  };

  const handleUserRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote to Admin' : 'demote to User';
    
    setConfirm({
      open: true,
      title: `Confirm ${action}`,
      description: `Are you sure you want to ${action} for ${user.name}?`,
      onConfirm: async () => {
        try {
          await updateUser(user._id, { role: newRole }, token);
          fetchData();
          toast.success('Role updated');
        } catch (err) {
          toast.error('Failed to update role: ' + (err.message || ''));
        } finally { setConfirm(c => ({ ...c, open: false })); }
      },
      onCancel: () => setConfirm(c => ({ ...c, open: false }))
    });
  };

  const handleChangeOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchData();
      toast.success('Order status updated');
    } catch (err) {
      console.error('Failed to update order status', err);
      toast.error('Failed to update order status: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload = { ...formData };
      
      // Feature formatting
      if (activeTab === 'products' && typeof payload.features === 'string') {
        payload.features = payload.features.split(',').map(s => s.trim()).filter(Boolean);
      }

      let result;
      if (activeTab === 'products') {
        if (modalMode === 'edit') result = await updateProduct(payload._id, payload, token);
        else result = await createProduct(payload, token);
        
        if (fileMap) await uploadProductImage(result._id, fileMap, token);
      
      } else if (activeTab === 'blogs') {
        if (modalMode === 'edit') result = await updateBlog(payload._id, payload, token);
        else result = await createBlog(payload, token);

        if (fileMap && result._id) {
          try { await uploadBlogImage(result._id, fileMap, token); } catch (e) { console.error('Blog image upload failed', e); }
        }
      } else if (activeTab === 'orders') {
        try {
          await updateOrderStatus(payload._id, payload.status);
          toast.success('Order updated');
        } catch (err) {
          throw err;
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Error saving: " + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirm({
      open: true,
      title: 'Confirm Delete',
      description: 'Are you sure you want to delete this? This cannot be undone.',
      onConfirm: async () => {
        try {
          if (activeTab === 'products') await deleteProduct(id, token);
          else if (activeTab === 'blogs') await deleteBlog(id, token);
          else if (activeTab === 'users') await deleteUser(id, token);
          fetchData();
          toast.success('Deleted successfully');
        } catch (err) {
          toast.error('Error deleting: ' + (err.message || ''));
        } finally { setConfirm(c => ({ ...c, open: false })); }
      },
      onCancel: () => setConfirm(c => ({ ...c, open: false }))
    });
  };

  // --- Filter Logic ---
  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (activeTab === 'products') return item.product?.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q);
    if (activeTab === 'users') return item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q);
    if (activeTab === 'blogs') return item.title?.toLowerCase().includes(q);
    if (activeTab === 'orders') return item._id?.includes(q);
    return true;
  });

  return (
    <div className="flex h-screen font-bdogrotesk text-gray-800">
      
      {/* --- Sidebar --- */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-20">
        <div className="flex items-center justify-center h-20 border-b border-gray-100">
          <h1 onClick={()=>navigate('/')} className="cursor-pointer text-2xl text-black font-medium font-bdogrotesk">
            NUFAB ADMIN
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 space-y-1">
          <TabButton id="products" label="Products" icon={<Icons.Box />} activeTab={activeTab} setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} />
          <TabButton id="orders" label="Orders" icon={<Icons.ShoppingBag />} activeTab={activeTab} setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} />
          <TabButton id="blogs" label="Blogs" icon={<Icons.FileText />} activeTab={activeTab} setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} />
          <TabButton id="users" label="Users" icon={<Icons.Users />} activeTab={activeTab} setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} />
        </nav>
        <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg shadow-md">
              {storedUser?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{storedUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{storedUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-black rounded-lg transition-colors"
          >
            <Icons.Logout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize tracking-tight">{activeTab}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your {activeTab} data here</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Icons.Search />
              </span>
              <input
                type="text"
                placeholder="Search database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            {activeTab !== 'orders' && (
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black shadow-lg hover:shadow-lg transition-all active:scale-95 font-medium"
              >
                <Icons.Plus />
                <span className="ml-2">Add New</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              Loading NUFAB data...
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    {activeTab === 'products' && (
                      <React.Fragment>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </React.Fragment>
                    )}
                    {activeTab === 'users' && (
                       <React.Fragment>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Role Access</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </React.Fragment>
                    )}
                    {activeTab === 'blogs' && (
                      <React.Fragment>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </React.Fragment>
                    )}
                    {activeTab === 'orders' && (
                      <React.Fragment>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </React.Fragment>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredData.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No records found matching your search.</td></tr>
                  )}
                  {filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                      
                      {/* --- Product Rows --- */}
                      {activeTab === 'products' && (
                        <React.Fragment>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {item.images && item.images[0] ? (
                                  <img className="h-full w-full object-cover" src={item.images[0]} alt="" />
                                ) : <div className="h-full w-full flex items-center justify-center text-gray-300"><Icons.Box /></div>}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900">{item.product}</div>
                                <div className="text-xs text-gray-500">{item.productType}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <div className="text-sm text-gray-700">Collection ({item.category})</div>
                             <div className="text-xs text-gray-400">Color ({item.color}) • Fabric Type ({item.fabricType})</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">₹{item.discountedPrice || item.mrp}</div>
                            <div className="text-xs text-gray-500">
                              Stock: <span className={item.totalQuantity < 10 ? "text-red-500 font-bold" : "text-green-600"}>
                                {item.totalQuantity || ((item.sizeXXSQuantity||0)+(item.sizeXSQuantity||0)+(item.sizeSQuantity||0)+(item.sizeMQuantity||0)+(item.sizeLQuantity||0)+(item.sizeXLQuantity||0)+(item.sizeXXLQuantity||0))}
                              </span>
                            </div>
                          </td>
                        </React.Fragment>
                      )}

                      {/* --- User Rows --- */}
                      {activeTab === 'users' && (
                        <React.Fragment>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-400">ID: {item._id.slice(-6)}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.email}</td>
                          <td className="px-6 py-4 flex justify-center">
                            {/* Custom Switch Toggle for Role */}
                            <button 
                              onClick={() => handleUserRoleToggle(item)}
                              title={item.role === 'admin' ? "Click to Demote" : "Click to Promote"}
                              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${item.role === 'admin' ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            >
                              <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 shadow-sm ${item.role === 'admin' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className={`ml-3 text-xs font-bold uppercase py-1 px-2 rounded-md self-center ${item.role === 'admin' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-500 bg-gray-100'}`}>
                              {item.role}
                            </span>
                          </td>
                        </React.Fragment>
                      )}

                      {/* --- Blog Rows --- */}
                      {activeTab === 'blogs' && (
                          <React.Fragment>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                {item.images && item.images[0] && (
                                  <img src={item.images[0]} alt="" className="w-10 h-10 rounded object-cover border border-gray-200" />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                  <div className="text-xs text-gray-400 line-clamp-1">{item.excerpt}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-gray-500 bg-gray-50 rounded p-1 w-fit">{item.slug}</td>
                        </React.Fragment>
                      )}

                      {/* --- Order Rows --- */}
                       {activeTab === 'orders' && (
                          <React.Fragment>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">{item._id.substring(0,10)}...</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.user?.name || 'Guest'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{item.totalPrice}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border 
                              ${item.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="text-indigo-600 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                              title="View"
                            >
                              View
                            </button>
                            <select
                              value={item.status}
                              onChange={(e) => handleChangeOrderStatus(item._id, e.target.value)}
                              className="px-2 py-1 rounded-lg border text-sm"
                              title="Change status"
                            >
                              <option value="pending">pending</option>
                              <option value="paid">paid</option>
                              <option value="shipped">shipped</option>
                              <option value="delivered">delivered</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                            </td>
                          </React.Fragment>
                        )}

                      {/* --- Common Actions --- */}
                      {activeTab !== 'orders' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleOpenModal(item)} 
                            className="text-indigo-600 hover:text-black bg-indigo-50 hover:bg-black p-2 rounded-lg mr-2 transition-colors"
                            title="Edit"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)} 
                            className="text-red-600 hover:text-black bg-red-50 hover:bg-black p-2 rounded-lg transition-colors"
                            title="Delete"
                          >
                             <Icons.Trash />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- CENTERED MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
               <div>
                 <h3 className="text-xl font-bold text-gray-900">
                   {modalMode === 'create' ? 'Create New' : 'Edit'} <span className="capitalize">{activeTab.slice(0, -1)}</span>
                 </h3>
                 <p className="text-sm text-gray-500">Fill in the details below.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm border border-gray-200 transition-colors">
                 <Icons.X />
               </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form id="admin-form" onSubmit={handleSave}>
                
                {/* --- Product Form (Tabbed) --- */}
                {activeTab === 'products' && (
                  <div>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                       {['basic', 'fabric', 'pricing', 'media'].map(tab => (
                         <button
                           type="button"
                           key={tab}
                           onClick={() => setProductFormTab(tab)}
                           className={`py-1.5 px-4 text-sm font-semibold rounded-lg capitalize transition-all ${
                             productFormTab === tab 
                             ? 'bg-white text-indigo-600 shadow-sm' 
                             : 'text-gray-500 hover:text-gray-700'
                           }`}
                         >
                           {tab}
                         </button>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {productFormTab === 'basic' && (
                        <React.Fragment>
                          <InputGroup label="Product Name" name="product" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Category" name="category" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Slug (URL)" name="slug" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Product Type" name="productType" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Description" name="productDescription" type="textarea" colSpan={2} formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Show on Homepage" name="isShownInHomepage" type="checkbox" colSpan={2} formData={formData} onChange={handleInputChange} />
                        </React.Fragment>
                      )}
                      {productFormTab === 'fabric' && (
                          <React.Fragment>
                          <InputGroup label="Print / Pattern" name="print" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Color" name="color" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Fabric Type" name="fabricType" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Fabric Pattern" name="fabricPattern" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Material Composition" name="material" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Sleeves Style" name="sleeves" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Closure Type" name="closure" formData={formData} onChange={handleInputChange} />
                          <div className="grid grid-cols-2 gap-2">
                             <InputGroup label="Length" name="length" formData={formData} onChange={handleInputChange} />
                             <InputGroup label="Length (Inch)" name="lengthInInches" type="number" formData={formData} onChange={handleInputChange} />
                          </div>
                          <InputGroup label="Features (comma separated)" name="features" colSpan={2} placeholder="e.g. Breathable, Lightweight, Cotton" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Size & Fit Info" name="sizeAndFit" type="textarea" colSpan={2} formData={formData} onChange={handleInputChange} />
                        </React.Fragment>
                      )}
                      {productFormTab === 'pricing' && (
                        <React.Fragment>
                          <div className="bg-blue-50 p-4 rounded-xl col-span-2 grid grid-cols-2 gap-4 border border-blue-100">
                             <InputGroup label="MRP (₹)" name="mrp" type="number" formData={formData} onChange={handleInputChange} />
                             <InputGroup label="Selling Price (₹)" name="discountedPrice" type="number" formData={formData} onChange={handleInputChange} />
                          </div>
                          <div className="col-span-2"><h4 className="font-bold text-gray-800">Inventory Management</h4></div>
                          <InputGroup label="XXS Qty" name="sizeXXSQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="XS Qty" name="sizeXSQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Small Qty" name="sizeSQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Medium Qty" name="sizeMQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="Large Qty" name="sizeLQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="XL Qty" name="sizeXLQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <InputGroup label="XXL Qty" name="sizeXXLQuantity" type="number" formData={formData} onChange={handleInputChange} />
                          <div className="col-span-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                            Total Quantity will be calculated automatically based on sizes.
                          </div>
                        </React.Fragment>
                      )}
                      {productFormTab === 'media' && (
                        <ImageUploadSection 
                          images={formData.images} 
                          fileMap={fileMap} 
                          setFileMap={setFileMap} 
                          onDeleteImage={handleDeleteImage} 
                          onReorderImages={handleReorderImages}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* --- Blog Form (Now with Image Support) --- */}
                {activeTab === 'blogs' && (
                  <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Article Title" name="title" formData={formData} onChange={handleInputChange} />
                        <InputGroup label="Subtitle" name="subtitle" formData={formData} onChange={handleInputChange} />
                        <InputGroup label="URL Slug" name="slug" formData={formData} onChange={handleInputChange} />
                      </div>
                      <InputGroup label="Short Excerpt" name="excerpt" type="textarea" placeholder="A short summary for the card view..." formData={formData} onChange={handleInputChange} />
                      
                      {/* Added Image Section for Blogs */}
                      <div className="border rounded-xl p-4 bg-gray-50">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Cover Image</h4>
                        <ImageUploadSection 
                          images={formData.images} 
                          fileMap={fileMap} 
                          setFileMap={setFileMap} 
                          onDeleteImage={handleDeleteImage} 
                          onReorderImages={handleReorderImages}
                        />
                      </div>

                      <InputGroup label="Main Content" name="content" type="textarea" rows={8} placeholder="Write your blog post here..." formData={formData} onChange={handleInputChange} />
                  </div>
                )}

                {/* --- Order Form (View Details) --- */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500">Order ID</div>
                        <div className="font-mono text-sm text-gray-900">{formData._id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <select
                          value={formData.status || 'pending'}
                          onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                          className="px-3 py-1 rounded-md border"
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold">Customer</h4>
                      <div className="text-sm text-gray-700">{formData.user?.name} <span className="text-xs text-gray-500">{formData.user?.email}</span></div>
                    </div>

                    <div>
                      <h4 className="font-bold">Shipping Address</h4>
                      <div className="text-sm text-gray-700">
                        {formData.shippingAddress ? (
                          <div>
                            <div>{formData.shippingAddress.name} {formData.shippingAddress.label ? `(${formData.shippingAddress.label})` : ''}</div>
                            <div>{formData.shippingAddress.line1}{formData.shippingAddress.line2 ? `, ${formData.shippingAddress.line2}` : ''}</div>
                            <div>{formData.shippingAddress.city}, {formData.shippingAddress.state} — {formData.shippingAddress.postalCode}</div>
                            <div>{formData.shippingAddress.country}</div>
                            <div className="text-xs text-gray-500">Phone: {formData.shippingAddress.phone}</div>
                          </div>
                        ) : <div className="text-gray-500">No shipping address</div>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold">Items</h4>
                      <div className="space-y-2">
                        {Array.isArray(formData.items) && formData.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              {it.image && <img src={it.image} alt="" className="w-10 h-10 object-cover rounded" />}
                              <div>
                                <div className="font-medium">{it.productName || it.product}</div>
                                <div className="text-xs text-gray-500">{it.color} • {it.size}</div>
                              </div>
                            </div>
                            <div className="text-sm">Qty: {it.quantity} • ₹{it.price}</div>
                          </div>
                        ))}
                        {(!Array.isArray(formData.items) || formData.items.length === 0) && (
                          <div className="text-gray-500">No items in this order.</div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-sm text-gray-500">Payment</div>
                      <div className="font-bold">₹{formData.totalPrice} • {formData.paymentMethod}</div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-form"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- ORDER DETAILS MODAL --- */}
      {isOrderDetailsOpen && selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              setIsOrderDetailsOpen(false);
              setSelectedOrderId(null);
            }}
          ></div>

          {/* Modal Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-fade-in-up">
            <AdminOrderDetails 
              orderId={selectedOrderId} 
              onClose={() => {
                setIsOrderDetailsOpen(false);
                setSelectedOrderId(null);
                fetchData(); // Refresh orders list after closing
              }} 
            />
          </div>
        </div>
      )}

      <ConfirmModal open={confirm.open} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />
    </div>
  );
}