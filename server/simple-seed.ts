import { db } from './db';
import { categories, products } from '@shared/schema';

async function simpleSeeder() {
  console.log('Starting simple seeding...');

  // Clear existing data first
  await db.delete(products);
  await db.delete(categories);

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

  // Insert simple products without complex fields first
  const simpleProducts = [
    { name: 'Bananas', description: 'Fresh ripe bananas', price: '2.99', category: insertedCategories[0].id, unit: 'per bunch', weight: '1.5 lbs', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=400&h=300' },
    { name: 'Apples', description: 'Red delicious apples', price: '3.49', category: insertedCategories[0].id, unit: 'per lb', weight: '1 lb', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&h=300' },
    { name: 'Oranges', description: 'Fresh orange oranges', price: '4.99', category: insertedCategories[0].id, unit: 'per bag', weight: '3 lbs', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&h=300' },
    { name: 'Tomatoes', description: 'Fresh vine tomatoes', price: '3.99', category: insertedCategories[1].id, unit: 'per lb', weight: '1 lb', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=400&h=300' },
    { name: 'Lettuce', description: 'Fresh iceberg lettuce', price: '2.49', category: insertedCategories[1].id, unit: 'per head', weight: '1 head', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&h=300' },
    { name: 'Carrots', description: 'Fresh carrots', price: '1.99', category: insertedCategories[1].id, unit: 'per lb', weight: '1 lb', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=400&h=300' },
    { name: 'Whole Milk', description: 'Fresh whole milk', price: '3.29', category: insertedCategories[2].id, unit: 'per gallon', weight: '1 gallon', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&h=300' },
    { name: 'Cheddar Cheese', description: 'Aged cheddar cheese', price: '5.99', category: insertedCategories[2].id, unit: 'per package', weight: '8 oz', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&h=300' },
    { name: 'Chicken Breast', description: 'Boneless chicken breast', price: '7.99', category: insertedCategories[3].id, unit: 'per lb', weight: '1 lb', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&h=300' },
    { name: 'Ground Beef', description: 'Fresh ground beef', price: '6.99', category: insertedCategories[3].id, unit: 'per lb', weight: '1 lb', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=400&h=300' },
    { name: 'White Bread', description: 'Fresh white bread', price: '2.99', category: insertedCategories[4].id, unit: 'per loaf', weight: '20 oz', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=300' },
    { name: 'Croissants', description: 'Buttery croissants', price: '4.49', category: insertedCategories[4].id, unit: 'per 6 pack', weight: '6 pieces', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-f8893d58f4d3?auto=format&fit=crop&w=400&h=300' },
    { name: 'Rice', description: 'Long grain white rice', price: '4.99', category: insertedCategories[5].id, unit: 'per 2 lb bag', weight: '2 lbs', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&h=300' },
    { name: 'Pasta', description: 'Spaghetti pasta', price: '1.99', category: insertedCategories[5].id, unit: 'per box', weight: '1 lb', isFeatured: false, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1551462147-37cbd8ab5967?auto=format&fit=crop&w=400&h=300' },
    { name: 'Olive Oil', description: 'Extra virgin olive oil', price: '8.99', category: insertedCategories[5].id, unit: 'per bottle', weight: '500ml', isFeatured: true, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&h=300' }
  ];

  const insertedProducts = await db.insert(products).values(simpleProducts).returning();
  console.log(`Inserted ${insertedProducts.length} products`);

  console.log('Simple seeding completed successfully!');
}

// Auto-run when script is executed directly
simpleSeeder()
  .then(() => {
    console.log('Simple seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in simple seeding:', error);
    process.exit(1);
  });

export { simpleSeeder };