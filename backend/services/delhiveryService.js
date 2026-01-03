import axios from "axios";

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY || "";
// Use production API for shipment creation
const DELHIVERY_CREATE_URL = process.env.DELHIVERY_CREATE_URL || "https://track.delhivery.com/api/cmu/create.json";
const DELHIVERY_TRACK_URL = process.env.DELHIVERY_TRACK_URL || "https://track.delhivery.com/api/v1/packages/json/";

const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    Authorization: `Token ${DELHIVERY_API_KEY}`,
  },
});

export const trackShipment = async (waybill) => {
  try {
    const { data } = await axiosInstance.get(DELHIVERY_TRACK_URL, {
      params: {
        waybill,
        verbose: 3,
      },
    });

    return data;
  } catch (error) {
    console.error(
      "Delhivery tracking error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to track shipment");
  }
};

/**
 * Create a shipment/order in Delhivery
 */
export const createShipment = async (orderData) => {
  try {
    const {
      orderId,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      weightKg = 0.5,
      codAmount = 0,
      productDescription = "Product",
      totalAmount,
      pickupLocationName,
      sellerName,
      sellerAddress,
      sellerGST = "",
    } = orderData;

    // Format date properly for Delhivery (YYYY-MM-DD format)
    const orderDate = new Date().toISOString().split('T')[0];

    const shipmentPayload = {
      shipments: [
        {
          name: name,
          add: address,
          pin: String(pincode),
          city: city,
          state: state,
          country: "India",
          phone: String(phone),
          order: String(orderId),
          payment_mode: codAmount > 0 ? "COD" : "Prepaid",
          return_pin: String(pincode),
          return_city: city,
          return_phone: String(phone),
          return_add: sellerAddress || address,
          return_state: state,
          return_country: "India",
          products_desc: productDescription,
          hsn_code: "",
          cod_amount: String(codAmount),
          order_date: orderDate,
          total_amount: String(totalAmount),
          seller_add: sellerAddress || address,
          seller_name: sellerName || "Store",
          seller_inv: "",
          quantity: "1",
          waybill: "",
          shipment_width: "10",
          shipment_height: "10",
          weight: String(weightKg * 1000), // Convert kg to grams
          seller_gst_tin: sellerGST || "",
          shipping_mode: "Surface",
          address_type: "home",
        },
      ],
    };

    // Only add pickup_location if warehouse name is provided and not empty
    if (pickupLocationName && pickupLocationName.trim() && pickupLocationName !== 'Primary' && pickupLocationName !== 'Default Location') {
      shipmentPayload.pickup_location = {
        name: pickupLocationName.trim(),
      };
    }

    const payload = `format=json&data=${encodeURIComponent(
      JSON.stringify(shipmentPayload)
    )}`;

    console.log('Creating Delhivery shipment with payload:', JSON.stringify(shipmentPayload, null, 2));

    const { data } = await axios.post(DELHIVERY_CREATE_URL, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Token ${DELHIVERY_API_KEY}`,
      },
      timeout: 15000,
    });

    console.log('Delhivery API Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error(
      "Delhivery shipment creation error:",
      error.response?.data || error.message
    );
    if (error.response?.data) {
      console.error("Full error response:", JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(error.response?.data?.rmk || "Failed to create shipment");
  }
};

export const checkServiceability = async (pincode) => {
  try {
    const { data } = await axiosInstance.get(
      "https://track.delhivery.com/c/api/pin-codes/json/",
      {
        params: {
          filter_codes: pincode,
        },
      }
    );

    return data;
  } catch (error) {
    console.error(
      "Delhivery serviceability error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to check serviceability");
  }
};

export const cancelShipment = async (waybill) => {
  try {
    const payload = `waybill=${waybill}`;

    const { data } = await axios.post(
      "https://track.delhivery.com/api/p/edit",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Token ${DELHIVERY_API_KEY}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.error(
      "Delhivery cancellation error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to cancel shipment");
  }
};

export default {
  trackShipment,
  createShipment,
  checkServiceability,
  cancelShipment,
};
