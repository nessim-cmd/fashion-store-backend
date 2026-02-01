import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create Admin User
  const password = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { isAdmin: true },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password,
      isAdmin: true,
    },
  });

  // Create Categories
  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel for everyone',
      image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800',
    },
  });

  const shoes = await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: {},
    create: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for every occasion',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Complete your look',
      image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=80&w=800',
    },
  });

  // Create Subcategories
  const mensClothing = await prisma.subcategory.upsert({
    where: { slug: 'men-clothing' },
    update: {},
    create: {
      name: 'Men',
      slug: 'men-clothing',
      categoryId: clothing.id,
    },
  });

  const womensClothing = await prisma.subcategory.upsert({
    where: { slug: 'women-clothing' },
    update: {},
    create: {
      name: 'Women',
      slug: 'women-clothing',
      categoryId: clothing.id,
    },
  });
  
  const mensShoes = await prisma.subcategory.upsert({
      where: { slug: 'men-shoes' },
      update: {},
      create: {
          name: 'Men Shoes',
          slug: 'men-shoes',
          categoryId: shoes.id
      }
  });

  // Create Products
  const products = [
      {
          name: 'Classic Cotton T-Shirt',
          price: 29.99,
          slug: 'classic-cotton-t-shirt',
          categoryId: clothing.id,
          subcategoryId: mensClothing.id,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Oversized Denim Jacket',
        price: 89.99,
        slug: 'oversized-denim-jacket',
        categoryId: clothing.id,
        subcategoryId: womensClothing.id,
        image: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Leather Weekend Bag',
        price: 149.99,
        slug: 'leather-weekend-bag',
        categoryId: accessories.id,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'
      },
      {
          name: 'Minimalist Sneakers',
          price: 119.50,
          slug: 'minimalist-sneakers',
          categoryId: shoes.id,
          subcategoryId: mensShoes.id,
          image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800'
      },
      {
          name: 'Wool Blend Coat',
          price: 299.00,
          slug: 'wool-blend-coat',
          categoryId: clothing.id,
          subcategoryId: womensClothing.id,
          image: 'https://images.unsplash.com/photo-1539533018447-63fcce6a25e8?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Aviator Sunglasses',
        price: 159.00,
        slug: 'aviator-sunglasses',
        categoryId: accessories.id,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800'
      },
      // New Items
      {
        name: 'Slim Fit Chinos',
        price: 69.99,
        slug: 'slim-fit-chinos',
        categoryId: clothing.id,
        subcategoryId: mensClothing.id,
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Silk Evening Dress',
        price: 189.99,
        slug: 'silk-evening-dress',
        categoryId: clothing.id,
        subcategoryId: womensClothing.id,
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
      },
      {
        name: 'Running Performance Shoes',
        price: 129.99,
        slug: 'running-performance-shoes',
        categoryId: shoes.id,
        subcategoryId: mensShoes.id,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
      }
  ];

  for (const p of products) {
      await prisma.product.upsert({
          where: { slug: p.slug },
          update: {},
          create: {
              name: p.name,
              description: `This is a premium high-quality ${p.name.toLowerCase()} designed for modern living. Crafted with attention to detail and superior materials.`,
              price: p.price,
              slug: p.slug,
              categoryId: p.categoryId,
              subcategoryId: p.subcategoryId,
              images: {
                  create: [
                      { url: p.image },
                      { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800' }
                  ]
              },
              inStock: true,
              featured: true,
              rating: 4 + Math.random(),
              reviewCount: Math.floor(Math.random() * 50),
              productSizes: {
                  create: ['XS', 'S', 'M', 'L', 'XL'].map(s => ({ size: s }))
              },
              productColors: {
                  create: [
                      { name: 'Black', hex: '#000000' },
                      { name: 'White', hex: '#FFFFFF' }
                  ]
              }
          }
      });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
