const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create colored placeholder PNG images (200x200)
const createPlaceholderImage = (color) => {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // Width and height (200x200)
  const width = Buffer.alloc(4);
  width.writeUInt32BE(200);
  const height = Buffer.alloc(4);
  height.writeUInt32BE(200);

  // IHDR chunk
  const ihdr = Buffer.concat([
    Buffer.from([0x49, 0x48, 0x44, 0x52]),
    width,
    height,
    Buffer.from([0x08, 0x02, 0x00, 0x00, 0x00]) // bit depth, color type, compression, filter, interlace
  ]);

  // Calculate CRC for IHDR
  const crc32 = (buf) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(ihdr));

  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(ihdr.length - 4);

  // Simple image data - 200x200 solid color
  const [r, g, b] = color;
  const imageData = [];
  for (let y = 0; y < 200; y++) {
    imageData.push(0); // filter type
    for (let x = 0; x < 200; x++) {
      imageData.push(r, g, b);
    }
  }
  const imageBuffer = Buffer.from(imageData);
  const compressedData = zlib.deflateSync(imageBuffer);

  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([Buffer.from([0x49, 0x44, 0x41, 0x54]), compressedData])));

  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(compressedData.length);

  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

  return Buffer.concat([
    signature,
    ihdrLength,
    ihdr,
    ihdrCrc,
    idatLength,
    Buffer.from([0x49, 0x44, 0x41, 0x54]),
    compressedData,
    idatCrc,
    iend
  ]);
};

const assetsDir = path.join(__dirname, '../../frontend/public/assets');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log(`Created directory: ${assetsDir}`);
}

// Color palette for different image types
const colors = {
  shoes: [255, 200, 100],      // Orange
  shirt: [100, 150, 255],      // Blue
  hoodie: [150, 100, 200],     // Purple
  female: [255, 150, 200],     // Pink
  male: [100, 200, 150],       // Teal
  phones: [50, 50, 50],        // Dark gray
  banner: [220, 220, 220],     // Light gray
  default: [180, 180, 180]     // Medium gray
};

// Map files to colors
const imageFiles = {
  'shoe2.jpg': colors.shoes,
  'shoe3.jpg': colors.shoes,
  'shoe4.jpg': colors.shoes,
  'shoe5.jpg': colors.shoes,
  'shoe6.jpg': colors.shoes,
  'shoe7.jpg': colors.shoes,
  'shoe8.jpg': colors.shoes,
  'airforce.jpg': colors.shoes,
  'shirt.jpg': colors.shirt,
  'maleBest.jpg': colors.male,
  'hoodie.jpg': colors.hoodie,
  'hoodie2.jpg': colors.hoodie,
  'hoodie3.png': colors.hoodie,
  'female1.jpg': colors.female,
  'femaleshoe.jpg': colors.female,
  'iphones.jpg': colors.phones,
  'banner1.jpeg': colors.banner
};

Object.entries(imageFiles).forEach(([file, color]) => {
  const filePath = path.join(assetsDir, file);
  const placeholder = createPlaceholderImage(color);
  fs.writeFileSync(filePath, placeholder);
  console.log(`✓ Created placeholder: ${file}`);
});

console.log('\n✓ All placeholder images created successfully!');
