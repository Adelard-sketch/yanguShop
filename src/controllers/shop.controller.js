const Shop = require('../models/Shop');

exports.create = async (req, res, next) => {
  try {
    const shop = await Shop.create({ ...req.body, owner: req.user.id });
    res.status(201).json(shop);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) { next(err); }
};
