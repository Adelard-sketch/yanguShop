const Product = require('../models/Product');
const Review = require('../models/Review');

exports.create = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    
    // If a file was uploaded, add the image URL
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    
    const p = await Product.create(productData);
    res.status(201).json(p);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    // Category filter
    if (category) filter.category = category;

    // Search filter by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    let sortOrder = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOrder = { price: 1 };
          break;
        case 'price_desc':
          sortOrder = { price: -1 };
          break;
        case 'newest':
          sortOrder = { createdAt: -1 };
          break;
        case 'oldest':
          sortOrder = { createdAt: 1 };
          break;
        case 'name_asc':
          sortOrder = { name: 1 };
          break;
        case 'name_desc':
          sortOrder = { name: -1 };
          break;
      }
    }

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Fetch paginated products
    const items = await Product.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const id = req.params.id;

    let p;
    if (mongoose.Types.ObjectId.isValid(id)) {
      p = await Product.findById(id);
    } else {
      // try to find by SKU or slug-like id (avoid cast error)
      p = await Product.findOne({ $or: [{ sku: id }, { _id: id }, { slug: id }] });
    }

    if (!p) return res.status(404).json({ message: 'Not found' });
    
    // compute rating summary and fetch a few recent reviews
    const productId = p._id;
    
    try {
      const ratingAgg = await Review.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: '$product',
            average: { $avg: '$rating' },
            count: { $sum: 1 },
            distribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      // compute distribution counts from the pushed ratings
      let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let ratingData = { average: 0, count: 0 };
      
      if (ratingAgg && ratingAgg.length > 0) {
        const agg = ratingAgg[0];
        ratingData.average = agg.average ? Number(agg.average.toFixed(2)) : 0;
        ratingData.count = agg.count || 0;
        
        if (Array.isArray(agg.distribution)) {
          for (const r of agg.distribution) {
            const key = String(Math.max(1, Math.min(5, Math.round(r))));
            distribution[key] = (distribution[key] || 0) + 1;
          }
        }
      }

      const recentReviews = await Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name');

      res.json({
        product: p,
        rating: {
          average: ratingData.average,
          count: ratingData.count,
          distribution
        },
        recentReviews: recentReviews || []
      });
    } catch (reviewErr) {
      // If review aggregation fails, still return product without reviews
      res.json({
        product: p,
        rating: {
          average: 0,
          count: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        recentReviews: []
      });
    }
  } catch (err) { next(err); }
};

// Ratings summary endpoint
exports.ratings = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Not found' });
    const productId = new mongoose.Types.ObjectId(id);
    const pipeline = [
      { $match: { product: productId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ];

    const rows = await Review.aggregate(pipeline);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let weighted = 0;
    for (const r of rows) {
      const rating = Number(r._id);
      distribution[String(rating)] = r.count;
      total += r.count;
      weighted += rating * r.count;
    }

    const average = total ? Number((weighted / total).toFixed(2)) : 0;

    res.json({ average, count: total, distribution });
  } catch (err) { next(err); }
};

// Return related products (same category) excluding the current product
exports.related = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Not found' });

    const productId = id;
    const current = await Product.findById(productId);
    if (!current) return res.status(404).json({ message: 'Not found' });

    const items = await Product.find({
      category: current.category,
      _id: { $ne: current._id }
    })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({ data: items });
  } catch (err) { next(err); }
};
