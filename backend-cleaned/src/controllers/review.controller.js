const Review = require('../models/Review');
const Product = require('../models/Product');

exports.create = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, title, comment } = req.body;

    // basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = await Review.create({
      product: productId,
      user: req.user ? req.user._id : null,
      rating,
      title,
      comment
    });

    res.status(201).json(review);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { product: productId };
    const total = await Review.countDocuments(filter);
    const items = await Review.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({ data: items, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};
