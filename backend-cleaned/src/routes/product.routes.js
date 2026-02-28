const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product.controller');
const reviewCtrl = require('../controllers/review.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../config/upload');

router.post('/', auth, upload.single('image'), productCtrl.create);
router.get('/', productCtrl.list);
// Related products and reviews routes should come before the generic ':id' route
router.get('/:id/related', productCtrl.related);
router.get('/:id/ratings', productCtrl.ratings);
router.get('/:id/reviews', reviewCtrl.list);
router.post('/:id/reviews', auth, reviewCtrl.create);

router.get('/:id', productCtrl.get);

module.exports = router;
