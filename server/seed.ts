import { db } from './db';
import { categories, products } from '@shared/schema';

async function seedDatabase() {
  console.log('Seeding database...');

  // Insert categories
  const categoryData = [
    { name: 'Fresh Fruits', description: 'Fresh and organic fruits' },
    { name: 'Vegetables', description: 'Fresh vegetables and greens' },
    { name: 'Dairy Products', description: 'Milk, cheese, and dairy items' },
    { name: 'Meat & Poultry', description: 'Fresh meat and poultry' },
    { name: 'Bakery', description: 'Fresh bread and baked goods' },
    { name: 'Pantry Staples', description: 'Essential pantry items' }
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  // Insert products
  const productData = [
    // Fresh Fruits
    { name: 'Bananas', description: 'Fresh ripe bananas', price: '2.99', category: 1, unit: 'per bunch', weight: '1.5 lbs', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=400&h=300' },
    { name: 'Apples', description: 'Red delicious apples', price: '3.49', category: 1, unit: 'per lb', weight: '1 lb', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&h=300' },
    { name: 'Oranges', description: 'Fresh orange oranges', price: '4.99', category: 1, unit: 'per bag', weight: '3 lbs', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&h=300' },
    
    // Vegetables
    { name: 'Tomatoes', description: 'Fresh vine tomatoes', price: '3.99', category: 2, unit: 'per lb', weight: '1 lb', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=400&h=300' },
    { name: 'Lettuce', description: 'Fresh iceberg lettuce', price: '2.49', category: 2, unit: 'per head', weight: '1 head', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&h=300' },
    { name: 'Carrots', description: 'Fresh carrots', price: '1.99', category: 2, unit: 'per lb', weight: '1 lb', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=400&h=300' },
    
    // Dairy Products
    { name: 'Whole Milk', description: 'Fresh whole milk', price: '3.29', category: 3, unit: 'per gallon', weight: '1 gallon', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&h=300' },
    { name: 'Cheddar Cheese', description: 'Aged cheddar cheese', price: '5.99', category: 3, unit: 'per package', weight: '8 oz', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&h=300' },
    
    // Meat & Poultry
    { name: 'Chicken Breast', description: 'Boneless chicken breast', price: '7.99', category: 4, unit: 'per lb', weight: '1 lb', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&h=300' },
    { name: 'Ground Beef', description: 'Fresh ground beef', price: '6.99', category: 4, unit: 'per lb', weight: '1 lb', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=400&h=300' },
    
    // Bakery
    { name: 'White Bread', description: 'Fresh white bread', price: '2.99', category: 5, unit: 'per loaf', weight: '20 oz', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=300' },
    { name: 'Croissants', description: 'Buttery croissants', price: '4.49', category: 5, unit: 'per 6 pack', weight: '6 pieces', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-f8893d58f4d3?auto=format&fit=crop&w=400&h=300' },
    
    // Pantry Staples
    { name: 'Rice', description: 'Long grain white rice', price: '4.99', category: 6, unit: 'per 2 lb bag', weight: '2 lbs', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&h=300' },
    { name: 'Pasta', description: 'Spaghetti pasta', price: '1.99', category: 6, unit: 'per box', weight: '1 lb', featured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1551462147-37cbd8ab5967?auto=format&fit=crop&w=400&h=300' },
    { name: 'Olive Oil', description: 'Extra virgin olive oil', price: '8.99', category: 6, unit: 'per bottle', weight: '500ml', featured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&h=300' }
  ];

  const insertedProducts = await db.insert(products).values(productData).returning();
  console.log(`Inserted ${insertedProducts.length} products`);

  console.log('Database seeding completed successfully!');
}

// Auto-run when script is executed directly
seedDatabase()
  .then(() => {
    console.log('Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });

export { seedDatabase };