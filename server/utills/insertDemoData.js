// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/../.env' });

const { PrismaClient } = require("@prisma/client");
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Number of records to create
const NUM_USERS = 10;
const NUM_PRODUCTS = 50;
const NUM_ORDERS = 20;
const NUM_WISHLISTS = 15;

// Original demo data - keep for reference
const demoCategories = [
  "speakers", "trimmers", "laptops", "watches", "headphones",
  "juicers", "earbuds", "tablet-keyboards", "phone-gimbals", 
  "mixer-grinders", "cameras", "smart-phones", "gaming", "televisions", "home-appliances"
];

const manufacturers = [
  "Samsung", "Apple", "Sony", "LG", "Bosch", "Canon", "Nikon",
  "HP", "Dell", "Lenovo", "Asus", "Acer", "Microsoft", "Philips",
  "Panasonic", "ZunVolt", "SOWO", "Gillete"
];

/**
 * Delete all existing data from the database
 */
async function deleteAllExistingData() {
  console.log("🗑️ Starting database cleanup...");
  
  try {
    // Delete data in the correct order to respect foreign key constraints
    console.log("Deleting wishlist records...");
    const deletedWishlists = await prisma.wishlist.deleteMany({});
    console.log(`Successfully deleted ${deletedWishlists.count} wishlist records`);
    
    console.log("Deleting customer order product records...");
    const deletedOrderProducts = await prisma.customer_order_product.deleteMany({});
    console.log(`Successfully deleted ${deletedOrderProducts.count} order product records`);
    
    console.log("Deleting customer order records...");
    const deletedOrders = await prisma.customer_order.deleteMany({});
    console.log(`Successfully deleted ${deletedOrders.count} customer order records`);
    
    console.log("Deleting product image records...");
    const deletedImages = await prisma.image.deleteMany({});
    console.log(`Successfully deleted ${deletedImages.count} image records`);
    
    console.log("Deleting product records...");
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`Successfully deleted ${deletedProducts.count} product records`);
    
    console.log("Deleting category records...");
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`Successfully deleted ${deletedCategories.count} category records`);
    
    console.log("Deleting user records...");
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Successfully deleted ${deletedUsers.count} user records`);
    
    console.log("✅ Database cleanup completed successfully");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    throw error; // Re-throw to stop the process
  }
}

/**
 * Generate fake users
 */
async function generateUsers() {
  console.log("Generating users...");
  
  // Create admin user
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin"
    }
  });
  
  // Create regular users
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    users.push({
      email: faker.internet.email(),
      password: await bcrypt.hash("password123", 10),
      role: "user"
    });
  }
  
  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
  
  console.log(`Created ${NUM_USERS + 1} users`);
}

/**
 * Generate categories
 */
async function generateCategories() {
  console.log("Generating categories...");
  
  const categories = demoCategories.map(name => ({ name }));
  
  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
  
  console.log(`Created ${demoCategories.length} categories`);
}

/**
 * Generate products with images
 */
async function generateProducts() {
  console.log("Generating products...");
  
  // Get all categories
  const categories = await prisma.category.findMany();
  
  // Generate products
  for (let i = 0; i < NUM_PRODUCTS; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const title = faker.commerce.productName();
    const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + faker.string.alphanumeric(5);
    
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        mainImage: `product${i + 1}.webp`,
        price: parseInt(faker.commerce.price({ min: 10, max: 1000 })),
        rating: faker.number.int({ min: 1, max: 5 }),
        description: faker.commerce.productDescription(),
        manufacturer: faker.helpers.arrayElement(manufacturers),
        inStock: faker.number.int({ min: 0, max: 100 }),
        categoryId: category.id,
      }
    });
    
    // Create additional images for each product (0-4 images)
    const numImages = faker.number.int({ min: 0, max: 4 });
    const images = [];
    
    for (let j = 0; j < numImages; j++) {
      images.push({
        productID: product.id,
        image: `${slug}-image-${j + 1}.webp`,
      });
    }
    
    if (images.length > 0) {
      await prisma.image.createMany({
        data: images
      });
    }
  }
  
  console.log(`Created ${NUM_PRODUCTS} products with additional images`);
}

/**
 * Generate customer orders with order products
 */
async function generateOrders() {
  console.log("Generating customer orders...");
  
  // Get all products
  const products = await prisma.product.findMany();
  
  // Generate orders
  for (let i = 0; i < NUM_ORDERS; i++) {
    // Select random products for this order (1-5 products)
    const numOrderProducts = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = [];
    let total = 0;
    
    // Ensure we don't select the same product twice
    while (selectedProducts.length < numOrderProducts) {
      const product = faker.helpers.arrayElement(products);
      if (!selectedProducts.find(p => p.id === product.id)) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        selectedProducts.push({
          product,
          quantity
        });
        total += product.price * quantity;
      }
    }
    
    // Create order
    const order = await prisma.customer_order.create({
      data: {
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        company: faker.company.name(),
        adress: faker.location.streetAddress(),
        apartment: faker.location.secondaryAddress(),
        postalCode: faker.location.zipCode(),
        city: faker.location.city(),
        country: faker.location.country(),
        orderNotice: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        total: total
      }
    });
    
    // Create order products
    const orderProducts = selectedProducts.map(({ product, quantity }) => ({
      customerOrderId: order.id,
      productId: product.id,
      quantity
    }));
    
    await prisma.customer_order_product.createMany({
      data: orderProducts
    });
  }
  
  console.log(`Created ${NUM_ORDERS} customer orders`);
}

/**
 * Generate wishlists
 */
async function generateWishlists() {
  console.log("Generating wishlists...");
  
  const users = await prisma.user.findMany({ where: { role: "user" } });
  const products = await prisma.product.findMany();
  
  for (let i = 0; i < NUM_WISHLISTS; i++) {
    await prisma.wishlist.create({
      data: {
        userId: faker.helpers.arrayElement(users).id,
        productId: faker.helpers.arrayElement(products).id
      }
    });
  }
  
  console.log(`Created ${NUM_WISHLISTS} wishlist items`);
}

/**
 * Main function to insert all demo data
 */
async function insertDemoData() {
  try {
    console.log("🚀 Starting demo data generation process...");
    
    // First, delete all existing data
    await deleteAllExistingData();
    
    // Generate new data
    await generateUsers();
    await generateCategories();
    await generateProducts();
    await generateOrders();
    await generateWishlists();
    
    console.log("✅ All demo data inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting demo data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed");
  }
}

// Run the script
insertDemoData();
