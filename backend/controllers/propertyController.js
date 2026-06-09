const Property = require('../models/Property');

// @desc    Get all properties (with filtering & search)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    let query = { isVerified: true }; // Only show verified listings by default

    // Location search (case-insensitive)
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // Rent filtering
    if (req.query.maxRent) {
      query.rent = { $lte: Number(req.query.maxRent) };
    }
    if (req.query.minRent) {
      query.rent = { ...query.rent, $gte: Number(req.query.minRent) };
    }

    // Bedrooms / Bathrooms filtering
    if (req.query.bedrooms) {
      query.bedrooms = Number(req.query.bedrooms);
    }
    if (req.query.bathrooms) {
      query.bathrooms = Number(req.query.bathrooms);
    }

    // If request includes status query (e.g., 'available')
    if (req.query.status) {
      query.status = req.query.status;
    }

    const properties = await Property.find(query).populate('ownerId', 'name email phone');

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property details
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('ownerId', 'name email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a property listing
// @route   POST /api/properties
// @access  Private (Landlord only)
exports.createProperty = async (req, res, next) => {
  try {
    // Attach ownerId from auth middleware
    req.body.ownerId = req.user.id;

    // By default, listings must be verified by admin
    req.body.isVerified = false;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Ensure user is property owner
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this listing' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Ensure user is property owner
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await property.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
