import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'dropdown_options'
  },
  dropdownOptions: {
    productType: {
      type: [String],
      default: ['Top', 'Skirt', 'Dress', 'Accessory', 'Pants', 'Kurti', 'Shirt', 'Shrug', 'Jacket', 'Shorts', 'Bottom']
    },
    color: {
      type: [String],
      default: ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Indigo', 'Brown', 'Teal', 'Off White', 'White', 'Brick Red', 'Orange', 'Pink', 'Multicolour']
    },
    fabricType: {
      type: [String],
      default: ['Modal', '60-60 Cambric Cotton', 'Mul Cotton', 'Cotton Blend Canderi Silk', 'Maheshwari Silk', 'Slub Cotton', 'cotton blend Linen', 'Cotton']
    },
    fabricPrint: {
      type: [String],
      default: ['Daboo (Mud Resist Technique)', 'block Print', 'Bagru', 'Kalamkari', 'Black and White', 'Ajrak', 'Tie and Dye', 'Patch Work with Kantha', 'Ikat', 'Solid Dye']
    },
    fabricPattern: {
      type: [String],
      default: ['Bandhani', 'Floral', 'Plain', 'Motif', 'Stripes', 'all over', 'Animal', 'Lahriya']
    },
    length: {
      type: [String],
      default: ['Full', 'Knee', 'Maxi', 'Mini', 'Midi', 'short', 'crop', 'midi', 'standard']
    },
    sleeves: {
      type: [String],
      default: ['Sleeveless', 'Full Sleeves', '3/4th Sleeves', 'Half Sleeves', 'Puff Sleeves', 'Flared Sleeves', 'NA']
    },
    closure: {
      type: [String],
      default: ['Touch Buttons', 'Buttons', 'Hooks', 'String', 'Zip', 'Elastic']
    }
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
