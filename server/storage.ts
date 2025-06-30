import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(categoryId?: number, search?: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getBrands(): Promise<string[]>;
  getDietaryTags(): Promise<string[]>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Order operations
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrderById(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, orderItems: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Order | undefined>;

  // Admin operations
  getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(categoryId?: number, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    if (categoryId) {
      conditions.push(eq(products.category, categoryId));
    }
    if (search) {
      conditions.push(or(
        ilike(products.name, `%${search}%`),
        ilike(products.description, `%${search}%`)
      ));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(products.name);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(8);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getBrands(): Promise<string[]> {
    // Return empty for now - will add when brand column exists
    return [];
  }

  async getDietaryTags(): Promise<string[]> {
    // Return empty for now - will add when dietary_tags column exists
    return [];
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(results => 
        results.map(result => ({
          ...result.cart_items,
          product: result.products
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem.quantity + cartItem.quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount >= 0;
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    let ordersQuery = db.select().from(orders);
    
    if (userId) {
      ordersQuery = ordersQuery.where(eq(orders.userId, userId));
    }
    
    const ordersResult = await ordersQuery.orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(results => 
            results.map(result => ({
              ...result.order_items,
              product: result.products
            }))
          );
        
        return {
          ...order,
          orderItems: items
        };
      })
    );
    
    return ordersWithItems;
  }

  async getOrderById(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .then(results => 
        results.map(result => ({
          ...result.order_items,
          product: result.products
        }))
      );
    
    return {
      ...order,
      orderItems: items
    };
  }

  async createOrder(order: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order> {
    // Generate tracking number
    const trackingNumber = `GRS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Calculate estimated delivery if scheduling info provided
    let estimatedDelivery;
    if (order.deliveryDate && order.deliveryTimeSlot) {
      estimatedDelivery = this.calculateEstimatedDelivery(new Date(order.deliveryDate), order.deliveryTimeSlot);
    }
    
    const orderWithTracking = {
      ...order,
      trackingNumber,
      estimatedDelivery: estimatedDelivery?.toISOString()
    };
    
    const [newOrder] = await db.insert(orders).values(orderWithTracking).returning();
    
    // Insert order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  private calculateEstimatedDelivery(deliveryDate: Date, timeSlot: string): Date {
    const date = new Date(deliveryDate);
    switch (timeSlot) {
      case "morning":
        date.setHours(10, 0, 0, 0);
        break;
      case "afternoon":
        date.setHours(14, 0, 0, 0);
        break;
      case "evening":
        date.setHours(18, 0, 0, 0);
        break;
      case "asap":
        const now = new Date();
        now.setHours(now.getHours() + 2); // 2 hours from now
        return now;
      default:
        date.setHours(14, 0, 0, 0); // Default to afternoon
    }
    return date;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status, 
        updatedAt: new Date(),
        ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        paymentStatus,
        paymentIntentId,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Admin operations
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
  }> {
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(${orders.totalAmount})`
      })
      .from(orders);

    const [productStats] = await db
      .select({
        totalProducts: sql<number>`count(*)`
      })
      .from(products);

    const [customerStats] = await db
      .select({
        totalCustomers: sql<number>`count(*)`
      })
      .from(users);

    return {
      totalOrders: Number(orderStats.totalOrders) || 0,
      totalRevenue: Number(orderStats.totalRevenue) || 0,
      totalProducts: Number(productStats.totalProducts) || 0,
      totalCustomers: Number(customerStats.totalCustomers) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
