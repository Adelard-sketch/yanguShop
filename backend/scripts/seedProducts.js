const path = require('path');
const { connect } = require('../src/config/database');
const env = require('../src/config/env');
const Product = require('../src/models/Product');

const SAMPLE = [
  // ===== SHOES & SNEAKERS =====
  { name: 'Jordan Retro', description: 'Classic running silhouette', price: 420, originalPrice: 520, category: 'shoes', inventory: 12, image: '/assets/shoe2.jpg' },
  { name: 'Air Runner', description: 'Lightweight daily trainer', price: 320, originalPrice: 399, category: 'shoes', inventory: 20, image: '/assets/shoe4.jpg' },
  { name: 'Nike Court Legacy', description: 'Premium tennis-inspired sneaker', price: 380, originalPrice: 450, category: 'shoes', inventory: 15, image: '/assets/shoe3.jpg' },
  { name: 'Adidas Ultra Boost', description: 'Comfort running shoe with responsive cushioning', price: 390, originalPrice: 480, category: 'shoes', inventory: 18, image: '/assets/shoe5.jpg' },
  { name: 'Puma RS-X', description: 'Retro-inspired casual sneaker', price: 280, originalPrice: 350, category: 'shoes', inventory: 14, image: '/assets/shoe6.jpg' },
  { name: 'Converse Chuck Taylor', description: 'Iconic canvas high-top sneaker', price: 150, originalPrice: 200, category: 'shoes', inventory: 25, image: '/assets/airforce.jpg' },

  // ===== FASHION - MEN'S =====
  { name: 'Casual Tee', description: 'Soft cotton t-shirt', price: 55, originalPrice: 80, category: 'men', inventory: 40, image: '/assets/shirt.jpg' },
  { name: 'Classic Polo Shirt', description: 'Premium cotton polo with embroidered logo', price: 95, originalPrice: 130, category: 'men', inventory: 22, image: '/assets/maleBest.jpg' },
  { name: 'Denim Jacket', description: 'Blue wash trucker jacket', price: 180, originalPrice: 240, category: 'men', inventory: 10, image: '/assets/hoodie.jpg' },
  { name: 'Sports Hoodie', description: 'Comfortable pullover hoodie', price: 120, originalPrice: 160, category: 'men', inventory: 18, image: '/assets/hoodie2.jpg' },
  { name: 'Cargo Pants', description: 'Multi-pocket utility pants', price: 145, originalPrice: 190, category: 'men', inventory: 12, image: '/assets/hoodie3.png' },
  { name: 'Oxford Button-Up', description: 'Professional dress shirt', price: 110, originalPrice: 150, category: 'men', inventory: 16, image: '/assets/shirt.jpg' },

  // ===== FASHION - WOMEN'S =====
  { name: 'Summer Dress', description: 'Lightweight floral print dress', price: 130, originalPrice: 180, category: 'women', inventory: 14, image: '/assets/female1.jpg' },
  { name: 'Skinny Jeans', description: 'Classic blue denim with stretch', price: 105, originalPrice: 140, category: 'women', inventory: 20, image: '/assets/femaleshoe.jpg' },
  { name: 'Blazer Jacket', description: 'Tailored professional blazer', price: 185, originalPrice: 250, category: 'women', inventory: 8, image: '/assets/hoodie.jpg' },
  { name: 'Crop Top', description: 'Trendy fitted crop top', price: 45, originalPrice: 65, category: 'women', inventory: 30, image: '/assets/shirt.jpg' },
  { name: 'Maxi Skirt', description: 'Long flowing skirt with pattern', price: 115, originalPrice: 160, category: 'women', inventory: 12, image: '/assets/female1.jpg' },
  { name: 'Cardigan', description: 'Soft knit cardigan sweater', price: 95, originalPrice: 130, category: 'women', inventory: 18, image: '/assets/hoodie2.jpg' },

  // ===== ELECTRONICS =====
  { name: 'Wireless Headphones', description: 'Noise cancelling over-ear', price: 250, originalPrice: 320, category: 'electronics', inventory: 8, image: '/assets/iphones.jpg' },
  { name: 'iPhone 15 Pro', description: 'Latest Apple flagship phone', price: 1299, originalPrice: 1499, category: 'phones', inventory: 5, image: '/assets/iphones.jpg' },
  { name: 'Samsung Galaxy S24', description: 'Premium Android smartphone', price: 899, originalPrice: 1099, category: 'phones', inventory: 7, image: '/assets/iphones.jpg' },
  { name: 'Wireless Earbuds Pro', description: 'True wireless earbuds with active noise cancellation', price: 180, originalPrice: 250, category: 'electronics', inventory: 15, image: '/assets/iphones.jpg' },
  { name: 'Portable Charger', description: '20000mAh fast charging power bank', price: 45, originalPrice: 65, category: 'electronics', inventory: 25, image: '/assets/iphones.jpg' },
  { name: 'USB-C Cable', description: 'Durable fast-charging cable', price: 15, originalPrice: 25, category: 'electronics', inventory: 50, image: '/assets/iphones.jpg' },
  { name: 'Laptop Stand', description: 'Adjustable aluminum laptop riser', price: 55, originalPrice: 80, category: 'electronics', inventory: 12, image: '/assets/iphones.jpg' },

  // ===== BAGS & LUGGAGE =====
  { name: 'Leather Backpack', description: 'Premium leather travel backpack', price: 220, originalPrice: 300, category: 'bags', inventory: 10, image: '/assets/banner1.jpeg' },
  { name: 'Duffel Bag', description: 'Large capacity sports duffel', price: 135, originalPrice: 180, category: 'bags', inventory: 14, image: '/assets/banner1.jpeg' },
  { name: 'Crossbody Messenger', description: 'Compact crossbody shoulder bag', price: 85, originalPrice: 120, category: 'bags', inventory: 18, image: '/assets/banner1.jpeg' },
  { name: 'Luggage Set', description: '3-piece hardshell luggage set', price: 380, originalPrice: 500, category: 'bags', inventory: 6, image: '/assets/banner1.jpeg' },
  { name: 'Laptop Tote', description: 'Professional laptop carrying bag', price: 110, originalPrice: 150, category: 'bags', inventory: 12, image: '/assets/banner1.jpeg' },

  // ===== ACCESSORIES =====
  { name: 'Leather Wallet', description: 'Slim bi-fold wallet', price: 48, originalPrice: 65, category: 'accessories', inventory: 30, image: '/assets/iphones.jpg' },
  { name: 'Sunglasses', description: 'UV-protected aviator sunglasses', price: 95, originalPrice: 130, category: 'accessories', inventory: 20, image: '/assets/iphones.jpg' },
  { name: 'Leather Belt', description: 'Classic brown leather belt', price: 55, originalPrice: 75, category: 'accessories', inventory: 25, image: '/assets/iphones.jpg' },
  { name: 'Baseball Cap', description: 'Adjustable cotton cap', price: 30, originalPrice: 45, category: 'accessories', inventory: 35, image: '/assets/iphones.jpg' },
  { name: 'Scarf', description: 'Premium wool blend scarf', price: 65, originalPrice: 90, category: 'accessories', inventory: 15, image: '/assets/iphones.jpg' },
  { name: 'Watch Band', description: 'Replacement leather watch strap', price: 35, originalPrice: 50, category: 'accessories', inventory: 20, image: '/assets/iphones.jpg' },

  // ===== SPORTSWEAR =====
  { name: 'Running Shorts', description: 'Lightweight athletic shorts with pockets', price: 45, originalPrice: 65, category: 'sportswear', inventory: 22, image: '/assets/maleBest.jpg' },
  { name: 'Yoga Leggings', description: 'High-waist breathable yoga pants', price: 75, originalPrice: 100, category: 'sportswear', inventory: 18, image: '/assets/female1.jpg' },
  { name: 'Sports Bra', description: 'High-impact supportive sports bra', price: 65, originalPrice: 90, category: 'sportswear', inventory: 20, image: '/assets/female1.jpg' },
  { name: 'Moisture-Wicking Shirt', description: 'Performance athletic shirt', price: 55, originalPrice: 75, category: 'sportswear', inventory: 25, image: '/assets/shirt.jpg' },
  { name: 'Training Jacket', description: 'Lightweight windproof training jacket', price: 120, originalPrice: 160, category: 'sportswear', inventory: 14, image: '/assets/hoodie.jpg' },

  // ===== BEAUTY & PERSONAL CARE =====
  { name: 'Natural Face Cream', description: 'Hydrating day cream', price: 45, originalPrice: 60, category: 'beauty', inventory: 20, image: '/assets/iphones.jpg' },
  { name: 'Shampoo & Conditioner', description: 'Sulfate-free hair care duo', price: 35, originalPrice: 50, category: 'beauty', inventory: 25, image: '/assets/iphones.jpg' },
  { name: 'Face Mask', description: 'Charcoal detox face mask', price: 28, originalPrice: 40, category: 'beauty', inventory: 30, image: '/assets/iphones.jpg' },
  { name: 'Lipstick Set', description: '5-piece matte lipstick collection', price: 55, originalPrice: 75, category: 'beauty', inventory: 15, image: '/assets/iphones.jpg' },
  { name: 'Perfume', description: 'Premium unisex fragrance 100ml', price: 85, originalPrice: 120, category: 'beauty', inventory: 12, image: '/assets/iphones.jpg' },
  { name: 'Moisturizer SPF', description: 'Daily moisturizer with SPF 30', price: 52, originalPrice: 70, category: 'beauty', inventory: 18, image: '/assets/iphones.jpg' },

  // ===== HOME & LIVING =====
  { name: 'Modern Lamp', description: 'Minimal desk lamp', price: 120, originalPrice: 150, category: 'home', inventory: 10, image: '/assets/banner1.jpeg' },
  { name: 'Throw Pillow', description: 'Decorative cushion 16x16', price: 35, originalPrice: 50, category: 'home', inventory: 18, image: '/assets/banner1.jpeg' },
  { name: 'Coffee Maker', description: 'Automatic drip coffee machine', price: 95, originalPrice: 130, category: 'home', inventory: 8, image: '/assets/banner1.jpeg' },
  { name: 'Wall Clock', description: 'Modern minimalist wall clock', price: 55, originalPrice: 75, category: 'home', inventory: 12, image: '/assets/banner1.jpeg' },
  { name: 'Bed Sheets Set', description: 'Soft cotton queen size sheet set', price: 65, originalPrice: 90, category: 'home', inventory: 15, image: '/assets/banner1.jpeg' },

  // ===== WATCHES =====
  { name: 'Classic Watch', description: 'Elegant analog watch', price: 210, originalPrice: 260, category: 'watches', inventory: 8, image: '/assets/iphones.jpg' },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch', price: 180, originalPrice: 250, category: 'watches', inventory: 10, image: '/assets/iphones.jpg' },
  { name: 'Dive Watch', description: 'Water-resistant sports watch', price: 250, originalPrice: 330, category: 'watches', inventory: 6, image: '/assets/iphones.jpg' },
  { name: 'Dress Watch', description: 'Formal occasion timepiece', price: 300, originalPrice: 400, category: 'watches', inventory: 5, image: '/assets/iphones.jpg' },

  // ===== GROCERIES & FOOD =====
  { name: 'Organic Honey', description: 'Pure Ghanaian honey 500g', price: 30, originalPrice: 35, category: 'groceries', inventory: 40, image: '/assets/iphones.jpg' },
  { name: 'Coffee Beans', description: 'Premium roasted coffee 1kg', price: 45, originalPrice: 60, category: 'groceries', inventory: 20, image: '/assets/iphones.jpg' },
  { name: 'Olive Oil', description: 'Extra virgin olive oil 500ml', price: 28, originalPrice: 40, category: 'groceries', inventory: 30, image: '/assets/iphones.jpg' },
  { name: 'Dark Chocolate', description: '72% cocoa dark chocolate bar', price: 12, originalPrice: 18, category: 'groceries', inventory: 50, image: '/assets/iphones.jpg' },
  { name: 'Tea Selection', description: 'Assorted premium tea collection', price: 35, originalPrice: 50, category: 'groceries', inventory: 18, image: '/assets/iphones.jpg' },

  // ===== FOOTWEAR (KIDS) =====
  { name: 'Blue Kids Shoe', description: 'Comfort fit for kids', price: 90, originalPrice: 110, category: 'footwear', inventory: 16, image: '/assets/shoe7.jpg' },
  { name: 'Pink Kids Sneaker', description: 'Lightweight kids sneaker', price: 85, originalPrice: 110, category: 'footwear', inventory: 14, image: '/assets/shoe8.jpg' },
  { name: 'School Shoes', description: 'Durable black school shoe', price: 75, originalPrice: 100, category: 'footwear', inventory: 20, image: '/assets/shoe4.jpg' }
];

const seed = async () => {
  try {
    const mongoUri = env.MONGO_URI;
    await connect(mongoUri);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(SAMPLE);
    console.log(`✓ Inserted ${result.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seed();
