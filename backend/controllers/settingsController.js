import Settings from '../models/Settings.js';

// Get dropdown options
export const getDropdownOptions = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'dropdown_options' });
    
    // If no settings exist, create default one
    if (!settings) {
      settings = new Settings({ key: 'dropdown_options' });
      await settings.save();
    }
    
    res.json(settings.dropdownOptions);
  } catch (error) {
    console.error('Error fetching dropdown options:', error);
    res.status(500).json({ message: 'Error fetching dropdown options', error: error.message });
  }
};

// Update dropdown options
export const updateDropdownOptions = async (req, res) => {
  try {
    const { dropdownOptions } = req.body;
    
    let settings = await Settings.findOne({ key: 'dropdown_options' });
    
    if (!settings) {
      settings = new Settings({ key: 'dropdown_options', dropdownOptions });
    } else {
      settings.dropdownOptions = dropdownOptions;
    }
    
    await settings.save();
    
    res.json({ message: 'Dropdown options updated successfully', dropdownOptions: settings.dropdownOptions });
  } catch (error) {
    console.error('Error updating dropdown options:', error);
    res.status(500).json({ message: 'Error updating dropdown options', error: error.message });
  }
};
