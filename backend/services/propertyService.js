const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');

class PropertyService {
  async getProperties(queryParams) {
    let query = { isVerified: true }; // Only show verified listings by default

    // Keyword Search across title, description, and location
    if (queryParams.search) {
      const searchRegex = { $regex: queryParams.search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ];
    }

    // Exact Location search (if specific location param is passed)
    if (queryParams.location) {
      query.location = { $regex: queryParams.location, $options: 'i' };
    }

    // Property Type
    if (queryParams.type) {
      query.type = queryParams.type;
    }

    // Rent filtering
    if (queryParams.maxRent) {
      query.rent = { $lte: Number(queryParams.maxRent) };
    }
    if (queryParams.minRent) {
      query.rent = { ...query.rent, $gte: Number(queryParams.minRent) };
    }

    // Bedrooms / Bathrooms filtering
    if (queryParams.bedrooms) {
      query.bedrooms = Number(queryParams.bedrooms);
    }
    if (queryParams.bathrooms) {
      query.bathrooms = Number(queryParams.bathrooms);
    }

    // Availability status
    if (queryParams.status) {
      query.status = queryParams.status;
    }

    // Sorting configuration mapping
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (queryParams.sort) {
      const sortMap = {
        'newest': { createdAt: -1 },
        'oldest': { createdAt: 1 },
        'price-asc': { rent: 1 },
        'price-desc': { rent: -1 },
        'rating-desc': { averageRating: -1 }
      };
      if (sortMap[queryParams.sort]) {
        sortOption = sortMap[queryParams.sort];
      }
    }

    // Pagination Calculation
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Execute queries concurrently
    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('ownerId', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(query)
    ]);

    return {
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit
      }
    };
  }

  async getProperty(id) {
    const property = await Property.findById(id).populate('ownerId', 'name email phone');
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }
    return property;
  }

  async createProperty(propertyData) {
    return await Property.create(propertyData);
  }

  async updateProperty(id, propertyData, userId, userRole) {
    let property = await Property.findById(id);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }

    if (property.ownerId.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(401, 'Not authorized to edit this listing');
    }

    return await Property.findByIdAndUpdate(id, propertyData, {
      new: true,
      runValidators: true
    });
  }

  async deleteProperty(id, userId, userRole) {
    const property = await Property.findById(id);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }

    if (property.ownerId.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(401, 'Not authorized to delete this listing');
    }

    await property.deleteOne();
    return true;
  }
}

module.exports = new PropertyService();
