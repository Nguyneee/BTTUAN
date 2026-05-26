/**
 * seed.js — Seed database with sample data for TechStore
 * Run: node seed.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const connectDB = require("./db");

const categories = [
  { name: "Điện thoại", slug: "dien-thoai", icon: "📱", description: "Điện thoại thông minh các thương hiệu", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
  { name: "Laptop", slug: "laptop", icon: "💻", description: "Máy tính xách tay cho công việc và gaming", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
  { name: "Tai nghe", slug: "tai-nghe", icon: "🎧", description: "Tai nghe có dây và không dây", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
  { name: "Máy tính bảng", slug: "may-tinh-bang", icon: "📟", description: "iPad và các tablet Android", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
  { name: "Phụ kiện", slug: "phu-kien", icon: "🔌", description: "Ốp lưng, cáp sạc, pin dự phòng...", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400" },
];

const getProducts = (categoryMap) => [
  // ── Điện thoại ──
  {
    name: "iPhone 15 Pro Max 256GB",
    price: 32990000,
    originalPrice: 35990000,
    discount: 8,
    description: "iPhone 15 Pro Max với chip A17 Pro, màn hình Super Retina XDR 6.7 inch ProMotion 120Hz, camera 48MP tiên tiến, Dynamic Island. Khung titan Grade 5 cao cấp.",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
    category: categoryMap["dien-thoai"],
    stock: 45,
    sold: 312,
    isNew: false,
    tags: ["apple", "iphone", "5g", "pro"],
    specs: new Map([["Bộ nhớ", "256GB"], ["RAM", "8GB"], ["Pin", "4422mAh"], ["Màn hình", "6.7 inch ProMotion 120Hz"]]),
  },
  {
    name: "Samsung Galaxy S24 Ultra 512GB",
    price: 31990000,
    originalPrice: 33990000,
    discount: 6,
    description: "Samsung Galaxy S24 Ultra với bút S Pen tích hợp, chip Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X 6.8 inch, camera 200MP zoom 100x.",
    images: [
      "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600",
      "https://images.unsplash.com/photo-1551355738-1875e3ced45a?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600",
    category: categoryMap["dien-thoai"],
    stock: 28,
    sold: 245,
    isNew: false,
    tags: ["samsung", "galaxy", "android", "s-pen"],
    specs: new Map([["Bộ nhớ", "512GB"], ["RAM", "12GB"], ["Pin", "5000mAh"], ["Màn hình", "6.8 inch QHD+"]]),
  },
  {
    name: "Xiaomi 14 Ultra 512GB",
    price: 24990000,
    originalPrice: 26990000,
    discount: 7,
    description: "Xiaomi 14 Ultra với hệ thống camera Leica Summilux, chip Snapdragon 8 Gen 3, màn hình LTPO AMOLED 120Hz, sạc nhanh HyperCharge 90W.",
    images: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600",
    category: categoryMap["dien-thoai"],
    stock: 0,
    sold: 189,
    isNew: true,
    tags: ["xiaomi", "leica", "android", "flagship"],
    specs: new Map([["Bộ nhớ", "512GB"], ["RAM", "16GB"], ["Pin", "5000mAh"]]),
  },
  {
    name: "OPPO Find X7 Pro 256GB",
    price: 19990000,
    originalPrice: null,
    discount: 0,
    description: "OPPO Find X7 Pro với camera Hasselblad, chip Dimensity 9300, sạc nhanh SuperVOOC 100W, pin 5000mAh.",
    images: [
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600",
    category: categoryMap["dien-thoai"],
    stock: 15,
    sold: 78,
    isNew: true,
    tags: ["oppo", "hasselblad", "android"],
    specs: new Map([["Bộ nhớ", "256GB"], ["RAM", "12GB"], ["Pin", "5000mAh"]]),
  },

  // ── Laptop ──
  {
    name: "MacBook Pro 16 M3 Max 1TB",
    price: 89990000,
    originalPrice: 95990000,
    discount: 6,
    description: "MacBook Pro 16 inch với chip M3 Max đột phá, màn hình Liquid Retina XDR, pin 22 giờ, hỗ trợ tối đa 128GB unified memory. Lý tưởng cho sáng tạo nội dung chuyên nghiệp.",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      "https://images.unsplash.com/photo-1611186871525-b1e44ef0e519?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
    category: categoryMap["laptop"],
    stock: 12,
    sold: 95,
    isNew: false,
    tags: ["apple", "macbook", "m3", "pro"],
    specs: new Map([["CPU", "Apple M3 Max"], ["RAM", "36GB"], ["Lưu trữ", "1TB SSD"], ["Màn hình", "16.2 inch Liquid Retina XDR"]]),
  },
  {
    name: "ASUS ROG Zephyrus G16 RTX 4080",
    price: 62990000,
    originalPrice: 67990000,
    discount: 7,
    description: "Laptop gaming cao cấp với RTX 4080, màn hình OLED QHD 240Hz, chip Intel i9-14900HX, RAM 32GB DDR5, thiết kế mỏng nhẹ đột phá.",
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
    category: categoryMap["laptop"],
    stock: 8,
    sold: 67,
    isNew: false,
    tags: ["asus", "rog", "gaming", "rtx4080"],
    specs: new Map([["CPU", "Intel i9-14900HX"], ["GPU", "RTX 4080 12GB"], ["RAM", "32GB DDR5"], ["Màn hình", "16 inch OLED 240Hz"]]),
  },
  {
    name: "Dell XPS 15 OLED i9 RTX 4070",
    price: 52990000,
    originalPrice: null,
    discount: 0,
    description: "Dell XPS 15 với màn hình OLED 3.5K cảm ứng, chip Intel Core i9-13900H, RTX 4070, thiết kế premium anodized aluminum.",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600",
    category: categoryMap["laptop"],
    stock: 5,
    sold: 43,
    isNew: true,
    tags: ["dell", "xps", "oled", "creative"],
    specs: new Map([["CPU", "Intel i9-13900H"], ["GPU", "RTX 4070 8GB"], ["RAM", "32GB"], ["Màn hình", "15.6 inch OLED 3.5K"]]),
  },

  // ── Tai nghe ──
  {
    name: "Apple AirPods Pro 2 (USB-C)",
    price: 6290000,
    originalPrice: 6990000,
    discount: 10,
    description: "AirPods Pro 2 với Active Noise Cancellation nâng cao, Transparency mode, chip H2, spatial audio động, sạc MagSafe USB-C.",
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600",
      "https://images.unsplash.com/photo-1588423771073-b8903fead56c?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600",
    category: categoryMap["tai-nghe"],
    stock: 80,
    sold: 520,
    isNew: false,
    tags: ["apple", "airpods", "anc", "wireless"],
    specs: new Map([["Kết nối", "Bluetooth 5.3"], ["Pin", "6h + 30h case"], ["Chống ồn", "ANC H2"]]),
  },
  {
    name: "Sony WH-1000XM5 Wireless",
    price: 7490000,
    originalPrice: 8490000,
    discount: 12,
    description: "Sony WH-1000XM5 với chống ồn Industry-leading ANC, Multipoint connection, LDAC Hi-Res, pin 30 giờ, thoải mái đeo cả ngày.",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600",
    category: categoryMap["tai-nghe"],
    stock: 35,
    sold: 380,
    isNew: false,
    tags: ["sony", "anc", "over-ear", "hires"],
    specs: new Map([["Kết nối", "Bluetooth 5.2 + LDAC"], ["Pin", "30 giờ"], ["Driver", "30mm"]]),
  },
  {
    name: "Samsung Galaxy Buds3 Pro",
    price: 4290000,
    originalPrice: 4990000,
    discount: 14,
    description: "Galaxy Buds3 Pro với thiết kế bud mới hoàn toàn, ANC thích ứng thông minh, 360 Audio, kết nối 3 thiết bị cùng lúc.",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    category: categoryMap["tai-nghe"],
    stock: 60,
    sold: 210,
    isNew: true,
    tags: ["samsung", "tws", "anc", "wireless"],
    specs: new Map([["Kết nối", "Bluetooth 5.4"], ["Pin", "6h + 21h case"], ["Driver", "10.5mm + 6.1mm"]]),
  },

  // ── Máy tính bảng ──
  {
    name: "iPad Pro 13 M4 Wi-Fi 256GB",
    price: 28990000,
    originalPrice: 30990000,
    discount: 6,
    description: "iPad Pro 13 inch với chip M4 mạnh mẽ, màn hình Ultra Retina XDR OLED 2 lớp, mỏng nhất từ trước đến nay chỉ 5.1mm, hỗ trợ Apple Pencil Pro.",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
      "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
    category: categoryMap["may-tinh-bang"],
    stock: 20,
    sold: 145,
    isNew: true,
    tags: ["apple", "ipad", "m4", "pro"],
    specs: new Map([["Chip", "Apple M4"], ["Màn hình", "13 inch OLED Ultra Retina XDR"], ["Lưu trữ", "256GB"]]),
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra 512GB",
    price: 26990000,
    originalPrice: 29990000,
    discount: 10,
    description: "Galaxy Tab S9 Ultra màn hình AMOLED 14.6 inch, S Pen đi kèm, chip Snapdragon 8 Gen 2 for Galaxy, RAM 12GB, camera selfie kép.",
    images: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600",
    category: categoryMap["may-tinh-bang"],
    stock: 10,
    sold: 88,
    isNew: false,
    tags: ["samsung", "galaxy-tab", "s-pen", "android"],
    specs: new Map([["Chip", "Snapdragon 8 Gen 2"], ["Màn hình", "14.6 inch AMOLED"], ["Lưu trữ", "512GB"]]),
  },

  // ── Phụ kiện ──
  {
    name: "Anker 140W GaN 3-Port Charger",
    price: 1290000,
    originalPrice: 1590000,
    discount: 19,
    description: "Củ sạc Anker 140W GaN với 3 cổng (2x USB-C + 1x USB-A), công nghệ PowerIQ 4.0, tương thích MacBook Pro, laptop, điện thoại.",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
    category: categoryMap["phu-kien"],
    stock: 150,
    sold: 820,
    isNew: false,
    tags: ["anker", "sac-nhanh", "gan", "usb-c"],
    specs: new Map([["Công suất", "140W"], ["Cổng", "2x USB-C + 1x USB-A"], ["Công nghệ", "GaN + PowerIQ 4.0"]]),
  },
  {
    name: "Baseus PowerBank 20000mAh 65W",
    price: 890000,
    originalPrice: 1190000,
    discount: 25,
    description: "Pin dự phòng Baseus 20000mAh sạc nhanh 65W, có thể sạc laptop, hỗ trợ PD 3.0 + QC 4+, 2 cổng USB-C + 1 USB-A.",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600",
    category: categoryMap["phu-kien"],
    stock: 200,
    sold: 1205,
    isNew: false,
    tags: ["baseus", "pin-du-phong", "65w", "pd"],
    specs: new Map([["Dung lượng", "20000mAh"], ["Sạc ra tối đa", "65W"], ["Cổng", "2x USB-C + 1x USB-A"]]),
  },
  {
    name: "Spigen Ultra Hybrid Case iPhone 15 Pro",
    price: 390000,
    originalPrice: 490000,
    discount: 20,
    description: "Ốp lưng Spigen Ultra Hybrid trong suốt chống vàng, bảo vệ 4 góc airbag, tương thích MagSafe.",
    images: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600",
    ],
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600",
    category: categoryMap["phu-kien"],
    stock: 300,
    sold: 2450,
    isNew: false,
    tags: ["spigen", "op-lung", "iphone", "magsafe"],
    specs: new Map([["Chất liệu", "PC + TPU"], ["Tương thích", "iPhone 15 Pro"], ["MagSafe", "Có"]]),
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("🔌 Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Build slug → _id map
    const categoryMap = {};
    createdCategories.forEach((c) => {
      categoryMap[c.slug] = c._id;
    });

    // Create products
    const products = getProducts(categoryMap);
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create users — passwords are plain text here; pre-save hook will hash them
    await User.create([
      {
        email: "admin@techstore.vn",
        username: "admin",
        password: "Admin@123",
        role: "admin",
        lastLoginAt: new Date(),
      },
      {
        email: "member@techstore.vn",
        username: "nguyenvana",
        password: "Member@123",
        role: "member",
        lastLoginAt: new Date(),
      },
    ]);
    console.log("✅ Created 2 users");
    console.log("   👤 Admin:  admin@techstore.vn / Admin@123");
    console.log("   👤 Member: member@techstore.vn / Member@123");

    console.log("\n🎉 Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
