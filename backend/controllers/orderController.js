import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import * as delhiveryService from '../services/delhiveryService.js';

// Helper function to auto-create Delhivery shipment
const autoCreateDelhiveryShipment = async (order, user) => {
  try {
    // Check if order has shipping address
    if (!order.shippingAddress) {
      console.log('Skipping Delhivery shipment - no shipping address');
      return null;
    }

    const pincode = order.shippingAddress.postalCode || order.shippingAddress.pincode || '';
    if (!pincode || pincode.length !== 6) {
      console.log('Skipping Delhivery shipment - invalid pincode');
      return null;
    }

    const phone = order.shippingAddress.phone || user.phone || '';
    if (!phone || phone.length < 10) {
      console.log('Skipping Delhivery shipment - invalid phone number');
      return null;
    }

    if (!order.shippingAddress.city || !order.shippingAddress.state) {
      console.log('Skipping Delhivery shipment - missing city or state');
      return null;
    }

    // Check if Delhivery is configured
    if (!process.env.DELHIVERY_API_KEY) {
      console.log('Skipping Delhivery shipment - API key not configured');
      return null;
    }

    // Prepare shipment data with proper formatting
    const shipmentData = {
      orderId: `${order._id.toString()}-${Date.now()}`, // Make unique with timestamp
      name: order.shippingAddress.name || user.name || 'Customer',
      phone: phone.replace(/\D/g, '').slice(-10), // Extract last 10 digits
      address: `${order.shippingAddress.line1 || ''} ${order.shippingAddress.line2 || ''}`.trim() || order.shippingAddress.address || '',
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: pincode,
      codAmount: order.paymentMethod === 'COD' ? order.totalPrice : 0,
      totalAmount: order.totalPrice,
      productDescription: order.items.map(item => `${item.productName} (${item.quantity}x)`).join(', '),
      weightKg: 0.5, // Default weight, adjust as needed
      pickupLocationName: process.env.WAREHOUSE_NAME || '',
      sellerName: process.env.WAREHOUSE_NAME || 'Nufab Store',
      sellerAddress: process.env.WAREHOUSE_ADDRESS || '',
      sellerGST: process.env.WAREHOUSE_GST || '',
    };

    // Create Delhivery shipment
    const shipmentResponse = await delhiveryService.createShipment(shipmentData);

    // Extract waybill from response
    let waybill = '';
    if (shipmentResponse && shipmentResponse.packages && shipmentResponse.packages.length > 0) {
      waybill = shipmentResponse.packages[0].waybill || '';
    } else if (shipmentResponse && shipmentResponse.success && shipmentResponse.upload_wbn) {
      waybill = shipmentResponse.upload_wbn;
    }

    if (waybill) {
      // Update order with Delhivery details
      order.delhivery = {
        waybill,
        orderId: order._id.toString(),
        lastUpdated: new Date(),
      };
      order.status = 'shipped';
      await order.save();

      console.log(`Delhivery shipment created automatically for order ${order._id}, waybill: ${waybill}`);
      return { waybill, shipmentResponse };
    } else {
      console.log('Delhivery shipment created but no waybill received');
      return null;
    }
  } catch (error) {
    console.error('Auto-create Delhivery shipment failed:', error.message);
    // Don't throw error - let order creation succeed even if shipment fails
    return null;
  }
};

// POST /api/orders - create order
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate totals (simple)
  let itemsPrice = 0;
  const orderItems = [];
  for (const it of items) {
    const product = await Product.findById(it.product);
    if (!product) {
      res.status(400);
      throw new Error('Product not found: ' + it.product);
    }
    const qty = it.quantity || 1;
    const price = product.discountedPrice || product.mrp;
    itemsPrice += price * qty;
    orderItems.push({ 
      product: product._id, 
      productName: product.product, 
      print: product.print,
      color: product.color,
      size: it.size || 'S',
      price: price, 
      quantity: qty, 
      image: product.images && product.images[0] 
    });
  }

  const taxPrice = 0.00; // Tax disabled
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Shipment creation disabled - must be done manually from admin panel
  // Auto-shipment removed to prevent automatic shipment creation

  // Return order
  const response = {
    ...order.toObject(),
  };

  res.status(201).json(response);
});

// GET /api/orders/my - get orders for logged in user
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id - get order by id (user or admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // allow owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json(order);
});

// GET /api/orders (admin) - list all
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// PUT /api/orders/:id/status (admin) - update status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  const oldStatus = order.status;
  order.status = req.body.status || order.status;
  await order.save();

  // Shipment creation disabled - must be done manually from admin panel
  // Auto-shipment removed to prevent automatic shipment creation

  const response = {
    ...order.toObject(),
  };

  res.json(response);
});

// PUT /api/orders/:id/delhivery/waybill (admin) - add Delhivery waybill
const addDelhiveryWaybill = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  const { waybill, orderId } = req.body;
  if (!waybill) {
    res.status(400);
    throw new Error('Waybill number is required');
  }
  
  order.delhivery = {
    waybill,
    orderId: orderId || order._id.toString(),
    lastUpdated: new Date(),
  };
  
  // Update order status to shipped
  order.status = 'shipped';
  await order.save();
  
  res.json(order);
});

// GET /api/orders/:id/track - track order via Delhivery
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is authorized to track this order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  if (!order.delhivery || !order.delhivery.waybill) {
    res.status(400);
    throw new Error('No tracking information available');
  }
  
  try {
    // Fetch tracking info from Delhivery
    const trackingData = await delhiveryService.trackShipment(order.delhivery.waybill);
    
    // Update order with latest tracking info
    if (trackingData && trackingData.ShipmentData && trackingData.ShipmentData.length > 0) {
      const shipment = trackingData.ShipmentData[0];
      const shipmentTrack = shipment.Shipment || {};
      
      // Status can be a string OR an object with nested Status property
      let statusString = '';
      if (typeof shipmentTrack.Status === 'string') {
        statusString = shipmentTrack.Status;
      } else if (typeof shipmentTrack.Status === 'object' && shipmentTrack.Status && shipmentTrack.Status.Status) {
        statusString = shipmentTrack.Status.Status;
      }
      
      order.delhivery.shipmentStatus = statusString;
      order.delhivery.scans = shipmentTrack.Scans || [];
      order.delhivery.lastUpdated = new Date();
      
      // Update order status and stage based on Delhivery status
      if (statusString) {
        const statusLower = statusString.toLowerCase();
        if (statusLower.includes('delivered')) {
          order.status = 'delivered';
          if (order.orderStage !== 'delivered') {
            order.orderStage = 'delivered';
            if (!order.stageHistory) {
              order.stageHistory = [];
            }
            order.stageHistory.push({
              stage: 'delivered',
              timestamp: new Date(),
              updatedBy: 'System (Delhivery Tracking)'
            });
          }
        } else if (statusLower.includes('in transit') || statusLower.includes('dispatched') || statusLower.includes('manifested')) {
          order.status = 'shipped';
          if (order.orderStage !== 'shipped') {
            order.orderStage = 'shipped';
            if (!order.stageHistory) {
              order.stageHistory = [];
            }
            order.stageHistory.push({
              stage: 'shipped',
              timestamp: new Date(),
              updatedBy: 'System (Delhivery Tracking)'
            });
          }
        }
      }
      
      await order.save();
    }
    
    res.json({
      order,
      trackingData,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch tracking information: ' + error.message);
  }
});

// POST /api/orders/:id/delhivery/shipment (admin) - create Delhivery shipment
const createDelhiveryShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  if (!order.shippingAddress) {
    res.status(400);
    throw new Error('Order has no shipping address');
  }

  // Check if shipment already exists
  if (order.delhivery && order.delhivery.waybill) {
    res.status(400);
    throw new Error('Shipment already created. Use cancel shipment first if you want to recreate it.');
  }
  
  try {
    // Validate required fields
    if (!order.shippingAddress.city || !order.shippingAddress.state) {
      res.status(400);
      throw new Error('Shipping address is incomplete. City and State are required.');
    }

    const pincode = order.shippingAddress.postalCode || order.shippingAddress.pincode || '';
    if (!pincode || pincode.length !== 6) {
      res.status(400);
      throw new Error('Valid 6-digit pincode is required for shipment creation.');
    }

    const phone = order.shippingAddress.phone || order.user.phone || '';
    if (!phone || phone.length < 10) {
      res.status(400);
      throw new Error('Valid phone number is required for shipment creation.');
    }

    // Prepare shipment data with proper formatting
    const shipmentData = {
      orderId: `${order._id.toString()}-${Date.now()}`, // Make unique with timestamp
      name: order.shippingAddress.name || order.user.name || 'Customer',
      phone: phone.replace(/\D/g, '').slice(-10), // Extract last 10 digits
      address: `${order.shippingAddress.line1 || ''} ${order.shippingAddress.line2 || ''}`.trim() || order.shippingAddress.address || '',
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: pincode,
      codAmount: order.paymentMethod === 'COD' ? order.totalPrice : 0,
      totalAmount: order.totalPrice,
      productDescription: order.items.map(item => `${item.productName} (${item.quantity}x)`).join(', '),
      weightKg: 0.5,
      pickupLocationName: process.env.WAREHOUSE_NAME || '',
      sellerName: process.env.WAREHOUSE_NAME || 'Nufab Store',
      sellerAddress: process.env.WAREHOUSE_ADDRESS || '',
      sellerGST: process.env.WAREHOUSE_GST || '',
    };
    
    const shipmentResponse = await delhiveryService.createShipment(shipmentData);
    
    // Extract waybill from response
    let waybill = '';
    if (shipmentResponse && shipmentResponse.packages && shipmentResponse.packages.length > 0) {
      waybill = shipmentResponse.packages[0].waybill || '';
    } else if (shipmentResponse && shipmentResponse.success && shipmentResponse.upload_wbn) {
      waybill = shipmentResponse.upload_wbn;
    }
    
    if (waybill) {
      order.delhivery = {
        waybill,
        orderId: order._id.toString(),
        lastUpdated: new Date(),
      };
      order.status = 'shipped';
      
      // Auto-update order stage to shipped
      order.orderStage = 'shipped';
      if (!order.stageHistory) {
        order.stageHistory = [];
      }
      order.stageHistory.push({
        stage: 'shipped',
        timestamp: new Date(),
        updatedBy: 'System (Shipment Created)'
      });
      
      await order.save();
    }
    
    res.json({
      order,
      shipmentResponse,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to create Delhivery shipment: ' + error.message);
  }
});

// DELETE /api/orders/:id/delhivery/cancel (admin) - cancel Delhivery shipment
const cancelDelhiveryShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  if (!order.delhivery || !order.delhivery.waybill) {
    res.status(400);
    throw new Error('No Delhivery shipment to cancel');
  }
  
  try {
    const cancelResponse = await delhiveryService.cancelShipment(order.delhivery.waybill);
    
    // Remove Delhivery data from order
    order.delhivery = {
      scans: [],
    };
    order.status = 'paid'; // Revert to paid status
    await order.save();
    
    res.json({
      message: 'Shipment cancelled successfully',
      order,
      cancelResponse,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to cancel Delhivery shipment: ' + error.message);
  }
});

// PUT /api/orders/:id/stage - update order stage (admin)
const updateOrderStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validStages = ['ordered', 'being_made', 'shipped', 'delivered', 'cancelled'];
  if (!validStages.includes(stage)) {
    res.status(400);
    throw new Error('Invalid stage');
  }

  // Update order stage
  order.orderStage = stage;
  
  // Add to stage history
  if (!order.stageHistory) {
    order.stageHistory = [];
  }
  order.stageHistory.push({
    stage,
    timestamp: new Date(),
    updatedBy: req.user.name || req.user.email || 'Admin'
  });

  // Auto-update status based on stage
  if (stage === 'shipped') {
    order.status = 'shipped';
  } else if (stage === 'delivered') {
    order.status = 'delivered';
  } else if (stage === 'cancelled') {
    order.status = 'cancelled';
  }

  await order.save();

  res.json({ message: 'Order stage updated', order });
});

export { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getOrders, 
  updateOrderStatus,
  updateOrderStage,
  addDelhiveryWaybill,
  trackOrder,
  createDelhiveryShipment,
  cancelDelhiveryShipment,
};
