// ==============================
// Images
// ==============================
import shoe2 from '../assets/shoe2.jpg';
import airforce from '../assets/airforce.jpg';
import shoe3 from '../assets/shoe3.jpg';
import shoe4 from '../assets/shoe4.jpg';
import shoe5 from '../assets/shoe5.jpg';
import shoe7 from '../assets/shoe7.jpg';
import shoe8 from '../assets/shoe8.jpg';
import femaleshoe from '../assets/femaleshoe.jpg';
import menShoe1 from '../assets/menShoe1.jpg';
import drMartens from '../assets/drMartens.jpg';
import drMartens2 from '../assets/drMartens2.jpg';
import drMartens3 from '../assets/drMartens3.jpg';

import iphones from '../assets/iphones.jpg';
import iphone11 from '../assets/iphone11.jpg';
import iphone12 from '../assets/iphone12.jpg';
import iphone13 from '../assets/iphone13.jpg';
import iphone14 from '../assets/iphone14.jpg';
import iphone15 from '../assets/iphone15.jpg';
import jbl1 from '../assets/jbl1.jpg';
import jblbest from '../assets/jblbest.jpg';
import applemacbook from '../assets/applemacbook.jpg';
import mackbookAir from '../assets/mackbookAir.jpg';
import airpods from '../assets/airpods.jpg';
import airpodBest from '../assets/airpodBest.jpg';
import watch1 from '../assets/watch1.jpg';

import maleBest from '../assets/maleBest.jpg';
import shirtMen from '../assets/shirtMen.jpg';
import menCollection from '../assets/menCollection.jpg';
import hoodie from '../assets/hoodie.jpg';
import hoodie2 from '../assets/hoodie2.jpg';
import menshoe2 from '../assets/menshoe2.jpg';

import femaleBest from '../assets/female1.jpg';
import womenBest from '../assets/womenBest.jpg';
import womenShoe from '../assets/womenShoe.jpg';
import womenShoe2 from '../assets/womenShoe2.jpg';
import womenShoe3 from '../assets/womenShoe3.jpg';
import womenShoeBest from '../assets/womenShoeBest.jpg';
import shoeWomen from '../assets/shoeWomen.jpg';
import women_Shoes from '../assets/women_Shoes.jpg';

import baby1 from '../assets/baby1.jpg';
import baby2 from '../assets/baby2.jpg';
import baby3 from '../assets/baby3.jpg';
import babyshoe from '../assets/babyshoe.jpg';
import shoebaby1 from '../assets/shoebaby1.jpg';
import shoebaby2 from '../assets/shoebaby2.jpg';
import shoebaby3 from '../assets/shoebaby3.jpg';

// ==============================
// Helpers
// ==============================
const repeatToCount = (base, count) =>
  Array.from({ length: count }, (_, i) => ({
    ...base[i % base.length],
    variant: i + 1
  }));

const buildProducts = (category, baseProducts, count) =>
  repeatToCount(baseProducts, count).map((item, index) => ({
    _id: `${category.toLowerCase()}-${index + 1}`,
    sku: `${category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
    name: `${item.name} ${item.variant}`,
    category,
    image: item.image,
    price: item.price,
    originalPrice: item.originalPrice,
    currency: 'UGX',
    rating: item.rating,
    reviews: item.reviews + index,
    stockCount: 10 + (index % 50),
    inStock: true,
    description: item.description
  }));

// ==============================
// BASE PRODUCTS
// ==============================

// ---------- Shoes ----------
const SHOES_BASE = [
  { name: 'Nike Air Max', image: shoe2, price: 420000, originalPrice: 480000, rating: 4.6, reviews: 120, description: 'Premium Nike sneakers.' },
  { name: 'Air Force 1', image: airforce, price: 390000, originalPrice: 450000, rating: 4.5, reviews: 98, description: 'Classic Air Force sneakers.' },
  { name: 'Adidas Runner', image: shoe3, price: 360000, originalPrice: 420000, rating: 4.4, reviews: 87, description: 'Lightweight running shoes.' },
  { name: 'Vans Classic', image: shoe4, price: 280000, originalPrice: 330000, rating: 4.3, reviews: 75, description: 'Everyday casual sneakers.' },
  { name: 'Puma Street', image: shoe5, price: 310000, originalPrice: 360000, rating: 4.4, reviews: 69, description: 'Stylish Puma street wear.' },
  { name: 'Urban Sneakers', image: shoe7, price: 295000, originalPrice: 340000, rating: 4.3, reviews: 52, description: 'Urban lifestyle sneakers.' },
  { name: 'Sport Trainers', image: shoe8, price: 330000, originalPrice: 380000, rating: 4.4, reviews: 60, description: 'Comfort sport trainers.' },
  { name: 'Dr Martens Boot', image: drMartens, price: 680000, originalPrice: 750000, rating: 4.8, reviews: 54, description: 'Authentic leather boots.' },
  { name: 'Dr Martens Classic', image: drMartens2, price: 720000, originalPrice: 800000, rating: 4.9, reviews: 61, description: 'Premium Dr Martens boots.' },
  { name: 'Dr Martens Vintage', image: drMartens3, price: 760000, originalPrice: 850000, rating: 4.9, reviews: 48, description: 'Vintage Dr Martens boots.' },
  { name: 'Leather Casual Shoe', image: menShoe1, price: 340000, originalPrice: 390000, rating: 4.4, reviews: 66, description: 'Comfortable leather shoes.' },
  { name: 'Women Sneakers', image: femaleshoe, price: 260000, originalPrice: 300000, rating: 4.5, reviews: 82, description: 'Stylish women sneakers.' }
];

// ---------- Electronics ----------
const ELECTRONICS_BASE = [
  { name: 'iPhone 15 Pro', image: iphone15, price: 6800000, originalPrice: 7400000, rating: 4.9, reviews: 210, description: 'Latest Apple flagship phone.' },
  { name: 'iPhone 14', image: iphone14, price: 5200000, originalPrice: 5800000, rating: 4.8, reviews: 190, description: 'High performance iPhone.' },
  { name: 'iPhone 13', image: iphone13, price: 4300000, originalPrice: 4800000, rating: 4.7, reviews: 175, description: 'Reliable Apple smartphone.' },
  { name: 'iPhone 12', image: iphone12, price: 3800000, originalPrice: 4200000, rating: 4.6, reviews: 162, description: 'Apple iPhone 12.' },
  { name: 'iPhone 11', image: iphone11, price: 3200000, originalPrice: 3600000, rating: 4.5, reviews: 149, description: 'Apple iPhone 11.' },
  { name: 'MacBook Air M2', image: mackbookAir, price: 7500000, originalPrice: 8200000, rating: 4.8, reviews: 132, description: 'Powerful lightweight laptop.' },
  { name: 'MacBook Pro', image: applemacbook, price: 9200000, originalPrice: 9900000, rating: 4.9, reviews: 101, description: 'Professional Apple laptop.' },
  { name: 'JBL Speaker', image: jblbest, price: 680000, originalPrice: 750000, rating: 4.6, reviews: 144, description: 'Loud and clear JBL sound.' },
  { name: 'JBL Portable Speaker', image: jbl1, price: 540000, originalPrice: 610000, rating: 4.5, reviews: 117, description: 'Portable JBL speaker.' },
  { name: 'Apple AirPods Pro', image: airpods, price: 980000, originalPrice: 1150000, rating: 4.7, reviews: 185, description: 'Noise cancelling earbuds.' },
  { name: 'AirPods Max', image: airpodBest, price: 1850000, originalPrice: 2100000, rating: 4.8, reviews: 92, description: 'Premium Apple headphones.' },
  { name: 'Apple Watch', image: watch1, price: 1350000, originalPrice: 1500000, rating: 4.6, reviews: 120, description: 'Smart fitness watch.' },
  { name: 'Apple Devices Bundle', image: iphones, price: 8200000, originalPrice: 9000000, rating: 4.7, reviews: 88, description: 'Apple product bundle.' }
];

// ---------- Phones (explicit category) ----------
const PHONES_BASE = [
  { name: 'iPhone 15 Pro', image: iphone15, price: 6800000, originalPrice: 7400000, rating: 4.9, reviews: 210, description: 'Latest Apple flagship phone.' },
  { name: 'iPhone 14', image: iphone14, price: 5200000, originalPrice: 5800000, rating: 4.8, reviews: 190, description: 'High performance iPhone.' },
  { name: 'iPhone 13', image: iphone13, price: 4300000, originalPrice: 4800000, rating: 4.7, reviews: 175, description: 'Reliable Apple smartphone.' },
  { name: 'iPhone 12', image: iphone12, price: 3800000, originalPrice: 4200000, rating: 4.6, reviews: 162, description: 'Apple iPhone 12.' },
  { name: 'iPhone 11', image: iphone11, price: 3200000, originalPrice: 3600000, rating: 4.5, reviews: 149, description: 'Apple iPhone 11.' },
  { name: 'Phone Bundle', image: iphones, price: 9200000, originalPrice: 10000000, rating: 4.6, reviews: 64, description: 'Bundle of popular phones and accessories.' }
];

// ---------- Men ----------
const MEN_BASE = [
  { name: 'Casual Hoodie', image: hoodie, price: 95000, originalPrice: 120000, rating: 4.4, reviews: 64, description: 'Warm casual hoodie.' },
  { name: 'Classic Hoodie', image: hoodie2, price: 105000, originalPrice: 135000, rating: 4.5, reviews: 72, description: 'Premium cotton hoodie.' },
  { name: 'Oxford Shirt', image: shirtMen, price: 85000, originalPrice: 110000, rating: 4.3, reviews: 58, description: 'Formal men shirt.' },
  { name: 'Men Collection Wear', image: menCollection, price: 180000, originalPrice: 220000, rating: 4.4, reviews: 44, description: 'Modern men fashion.' },
  { name: 'Men Casual Shoe', image: menshoe2, price: 310000, originalPrice: 360000, rating: 4.5, reviews: 51, description: 'Casual men footwear.' },
  { name: 'Men Outfit', image: maleBest, price: 240000, originalPrice: 290000, rating: 4.5, reviews: 59, description: 'Complete men outfit.' }
];

// ---------- Accessories ----------
const ACCESSORIES_BASE = [
  { name: 'Apple AirPods Pro', image: airpods, price: 980000, originalPrice: 1150000, rating: 4.7, reviews: 185, description: 'Noise cancelling earbuds.' },
  { name: 'AirPods Max', image: airpodBest, price: 1850000, originalPrice: 2100000, rating: 4.8, reviews: 92, description: 'Premium Apple headphones.' },
  { name: 'JBL Portable Speaker', image: jbl1, price: 540000, originalPrice: 610000, rating: 4.5, reviews: 117, description: 'Portable JBL speaker.' },
  { name: 'JBL Best Speaker', image: jblbest, price: 680000, originalPrice: 750000, rating: 4.6, reviews: 144, description: 'Loud and clear JBL sound.' },
  { name: 'Smart Watch', image: watch1, price: 1350000, originalPrice: 1500000, rating: 4.6, reviews: 120, description: 'Smart fitness watch.' }
];

// ---------- Sportswear ----------
const SPORTS_BASE = [
  { name: 'Performance Hoodie', image: hoodie, price: 95000, originalPrice: 120000, rating: 4.4, reviews: 64, description: 'Moisture wicking performance hoodie.' },
  { name: 'Training Hoodie', image: hoodie2, price: 105000, originalPrice: 135000, rating: 4.5, reviews: 72, description: 'Premium training hoodie.' },
  { name: 'Running Tee', image: menCollection, price: 65000, originalPrice: 85000, rating: 4.3, reviews: 38, description: 'Lightweight running tee.' },
  { name: 'Sport Trainers', image: menshoe2, price: 330000, originalPrice: 380000, rating: 4.4, reviews: 60, description: 'Comfort sport trainers.' }
];

// ---------- Bags ----------
const BAGS_BASE = [
  { name: 'Travel Backpack', image: menCollection, price: 310000, originalPrice: 380000, rating: 4.5, reviews: 48, description: 'Durable travel backpack.' },
  { name: 'Messenger Bag', image: maleBest, price: 240000, originalPrice: 290000, rating: 4.4, reviews: 36, description: 'Stylish messenger bag.' },
  { name: 'Tote Bag', image: womenBest, price: 180000, originalPrice: 220000, rating: 4.3, reviews: 29, description: 'Spacious tote bag.' }
];

// ---------- Women ----------
const WOMEN_BASE = [
  { name: 'Summer Dress', image: femaleBest, price: 140000, originalPrice: 180000, rating: 4.6, reviews: 73, description: 'Light summer dress.' },
  { name: 'Women Best Wear', image: womenBest, price: 210000, originalPrice: 260000, rating: 4.5, reviews: 81, description: 'Elegant women outfit.' },
  { name: 'Women Sneakers', image: womenShoe, price: 280000, originalPrice: 330000, rating: 4.5, reviews: 89, description: 'Comfortable sneakers.' },
  { name: 'Women Sneakers Pro', image: womenShoe2, price: 300000, originalPrice: 350000, rating: 4.6, reviews: 77, description: 'Enhanced women sneakers.' },
  { name: 'Women Sport Shoes', image: womenShoe3, price: 290000, originalPrice: 340000, rating: 4.5, reviews: 69, description: 'Sporty women shoes.' },
  { name: 'Women Heels', image: womenShoeBest, price: 320000, originalPrice: 370000, rating: 4.6, reviews: 67, description: 'Stylish women heels.' },
  { name: 'Women Casual Shoes', image: shoeWomen, price: 250000, originalPrice: 300000, rating: 4.4, reviews: 58, description: 'Casual women footwear.' },
  { name: 'Women Shoe Collection', image: women_Shoes, price: 340000, originalPrice: 390000, rating: 4.6, reviews: 62, description: 'Women shoe collection.' }
];

// ---------- Baby ----------
const BABY_BASE = [
  { name: 'Baby Outfit', image: baby1, price: 55000, originalPrice: 70000, rating: 4.7, reviews: 41, description: 'Soft baby outfit.' },
  { name: 'Baby Wear', image: baby2, price: 48000, originalPrice: 65000, rating: 4.6, reviews: 38, description: 'Comfort baby wear.' },
  { name: 'Baby Set', image: baby3, price: 62000, originalPrice: 78000, rating: 4.7, reviews: 35, description: 'Baby clothing set.' },
  { name: 'Baby Shoes', image: babyshoe, price: 45000, originalPrice: 60000, rating: 4.7, reviews: 51, description: 'Soft baby shoes.' },
  { name: 'Infant Shoes', image: shoebaby1, price: 42000, originalPrice: 58000, rating: 4.6, reviews: 46, description: 'Infant footwear.' },
  { name: 'Toddler Shoes', image: shoebaby2, price: 47000, originalPrice: 62000, rating: 4.7, reviews: 49, description: 'Toddler walking shoes.' },
  { name: 'Baby Footwear', image: shoebaby3, price: 50000, originalPrice: 65000, rating: 4.7, reviews: 44, description: 'Soft baby footwear.' }
];

// ==============================
// BUILD PRODUCTS (NO EXCLUSIONS)
// ==============================
const SAMPLE_PRODUCTS = [
  ...buildProducts('Shoes', SHOES_BASE, 40),
  ...buildProducts('Electronics', ELECTRONICS_BASE, 40),
  ...buildProducts('Phones', PHONES_BASE, 40),
  ...buildProducts('Accessories', ACCESSORIES_BASE, 20),
  ...buildProducts('Sportswear', SPORTS_BASE, 20),
  ...buildProducts('Bags', BAGS_BASE, 20),
  ...buildProducts('Men', MEN_BASE, 40),
  ...buildProducts('Women', WOMEN_BASE, 40),
  ...buildProducts('Baby', BABY_BASE, 40)
];

export default SAMPLE_PRODUCTS;
