# Database Image Display Setup - Quick Start Guide

## What Was Set Up

You now have a complete image upload and display system that allows database images to show on your website.

## How It Works

### Backend (Node.js/Express)
1. **File Upload Handler** (`config/upload.js`)
   - Uses `multer` to handle image file uploads
   - Stores images in `/backend/uploads` directory
   - Accepts JPEG, PNG, GIF, and WebP formats (max 5MB)

2. **Static File Serving** (Updated `app.js`)
   - Express serves images from `/uploads` route
   - Images accessible via: `http://localhost:5000/uploads/image-filename.jpg`

3. **Product Controller** (Updated `controllers/product.controller.js`)
   - When creating a product with an image, stores the path as `/uploads/filename`
   - This path is saved in the database

4. **Product Routes** (Updated `routes/product.routes.js`)
   - Added `upload.single('image')` middleware to POST endpoint
   - Allows file uploads when creating products

### Frontend (React)
1. **Image URL Resolver** (Updated `services/product.service.js`)
   - New `resolveImageUrl()` function converts relative paths to full URLs
   - Handles different URL formats automatically

2. **Component Updates**
   - `Home.jsx` - Uses `resolveImageUrl()` for product images
   - `ProductCard.jsx` - Uses `resolveImageUrl()` for product images
   - `Cart.jsx` - Uses `resolveImageUrl()` for cart item images
   - `HomePage.jsx` - Uses `resolveImageUrl()` for product images

## How to Upload Images

### Using the Admin Interface
When creating a new product via the API:

```javascript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('description', 'Description');
formData.append('price', 100);
formData.append('category', 'shoes');
formData.append('image', fileInputElement.files[0]); // Select file from input

fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Using curl (for testing)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Product" \
  -F "description=Test Description" \
  -F "price=100" \
  -F "category=shoes" \
  -F "image=@/path/to/image.jpg"
```

## Image Storage Structure

```
backend/
├── uploads/
│   ├── image-1735689600000-123456789.jpg
│   ├── image-1735689601000-987654321.jpg
│   └── ... (more uploaded images)
├── src/
├── package.json
└── ...
```

## Database Storage

In MongoDB, product documents now store:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Nike Shoe",
  "description": "Comfortable shoe",
  "price": 150,
  "category": "shoes",
  "image": "/uploads/image-1735689600000-123456789.jpg",
  "inventory": 10
}
```

## Troubleshooting

### Images not displaying?
1. Check browser console for 404 errors on image URLs
2. Verify backend is running on `http://localhost:5000`
3. Check that images exist in `/backend/uploads` directory
4. Ensure `REACT_APP_API_URL` environment variable is correctly set in frontend

### Upload failing?
1. Check file size (max 5MB)
2. Verify file format is allowed (JPEG, PNG, GIF, WebP)
3. Ensure you have authentication token (Bearer token in header)
4. Check backend console for error messages

### Images show old fallback placeholder?
1. The system automatically falls back to placeholder URLs if image is undefined
2. Make sure new products have the `image` field populated during creation
3. Clear browser cache (Ctrl+Shift+Delete) to force reload of images

## Next Steps

1. **Add image upload UI** - Create a component for selecting and uploading images when creating products
2. **Image optimization** - Consider compressing images on upload or using CDN
3. **Image deletion** - Add functionality to delete old images when products are updated
4. **Multiple images** - Extend to support multiple images per product using array fields

## Important Notes

- Images are stored on the server filesystem, not in the database
- In production, consider using cloud storage (AWS S3, Cloudinary, etc.) instead of local filesystem
- The `/uploads` directory should be backed up as part of your backup strategy
- Windows file path compatibility is handled automatically by Node.js
