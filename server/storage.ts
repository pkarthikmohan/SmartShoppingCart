import {
  users, products, cartItems, promotions, stores, lifiPositions,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Promotion, type InsertPromotion,
  type Store, type InsertStore,
  type LiFiPosition, type InsertLiFiPosition
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;

  // Cart operations
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Promotion operations
  getActivePromotions(): Promise<Promotion[]>;
  getApplicablePromotions(categoryIds: string[], productIds: number[]): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;

  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  getStoreLayout(storeId: number): Promise<any>;

  // Li-Fi positioning
  updatePosition(position: InsertLiFiPosition): Promise<LiFiPosition>;
  getCurrentPosition(sessionId: string): Promise<LiFiPosition | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private promotions: Map<number, Promotion>;
  private stores: Map<number, Store>;
  private lifiPositions: Map<string, LiFiPosition>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.promotions = new Map();
    this.stores = new Map();
    this.lifiPositions = new Map();
    this.currentId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize with comprehensive Indian grocery products
    const indianProducts: InsertProduct[] = [
      // Rice & Grains
      { name: "Basmati Rice Premium", nameHindi: "बासमती चावल", barcode: "8901030724569", category: "grains", subcategory: "rice", price: "450.00", unit: "5kg", brand: "India Gate", description: "Premium aged basmati rice", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c", stockQuantity: 50, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Toor Dal", nameHindi: "तूर दाल", barcode: "8901030724570", category: "grains", subcategory: "dal", price: "120.00", unit: "1kg", brand: "Organic Valley", description: "Pure toor dal", imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b", stockQuantity: 30, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Moong Dal", nameHindi: "मूंग दाल", barcode: "8901030724571", category: "grains", subcategory: "dal", price: "140.00", unit: "1kg", brand: "Patanjali", description: "Yellow moong dal", imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b", stockQuantity: 25, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      
      // Oils & Ghee
      { name: "Sunflower Oil", nameHindi: "सूरजमुखी तेल", barcode: "8901030724572", category: "oils", subcategory: "cooking-oil", price: "165.00", unit: "1L", brand: "Fortune", description: "Refined sunflower oil", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5", stockQuantity: 40, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Mustard Oil", nameHindi: "सरसों का तेल", barcode: "8901030724573", category: "oils", subcategory: "cooking-oil", price: "180.00", unit: "1L", brand: "Emami", description: "Pure mustard oil", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5", stockQuantity: 35, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Pure Ghee", nameHindi: "शुद्ध घी", barcode: "8901030724574", category: "dairy", subcategory: "ghee", price: "580.00", unit: "1kg", brand: "Amul", description: "Pure cow ghee", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 20, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      
      // Fresh Vegetables (minimum 5 items)
      { name: "Fresh Tomatoes", nameHindi: "ताजा टमाटर", barcode: "FRESH001", category: "vegetables", subcategory: "fresh", price: "40.00", unit: "kg", brand: "", description: "Fresh red tomatoes", imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea", stockQuantity: 100, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Onions", nameHindi: "ताजा प्याज", barcode: "FRESH002", category: "vegetables", subcategory: "fresh", price: "25.00", unit: "kg", brand: "", description: "Fresh red onions", imageUrl: "https://images.unsplash.com/photo-1582515073490-39981397c445", stockQuantity: 120, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Potatoes", nameHindi: "ताजा आलू", barcode: "FRESH003", category: "vegetables", subcategory: "fresh", price: "30.00", unit: "kg", brand: "", description: "Fresh potatoes", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655", stockQuantity: 80, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Green Chilies", nameHindi: "हरी मिर्च", barcode: "FRESH004", category: "vegetables", subcategory: "fresh", price: "80.00", unit: "kg", brand: "", description: "Fresh green chilies", imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8", stockQuantity: 15, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Carrots", nameHindi: "ताजा गाजर", barcode: "FRESH005", category: "vegetables", subcategory: "fresh", price: "35.00", unit: "kg", brand: "", description: "Fresh orange carrots", imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37", stockQuantity: 60, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Spinach", nameHindi: "ताजा पालक", barcode: "FRESH006", category: "vegetables", subcategory: "leafy", price: "20.00", unit: "bunch", brand: "", description: "Fresh green spinach", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb", stockQuantity: 40, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Cauliflower", nameHindi: "ताजा फूलगोभी", barcode: "FRESH007", category: "vegetables", subcategory: "fresh", price: "30.00", unit: "piece", brand: "", description: "Fresh white cauliflower", imageUrl: "https://images.unsplash.com/photo-1568584711271-4b8b0fd7d3c9", stockQuantity: 25, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Cabbage", nameHindi: "ताजा पत्तागोभी", barcode: "FRESH008", category: "vegetables", subcategory: "fresh", price: "25.00", unit: "piece", brand: "", description: "Fresh green cabbage", imageUrl: "https://images.unsplash.com/photo-1594282319060-5d1460c6d581", stockQuantity: 30, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      
      // Fruits (minimum 5 items)
      { name: "Fresh Apples", nameHindi: "ताजा सेब", barcode: "FRUIT001", category: "fruits", subcategory: "fresh", price: "120.00", unit: "kg", brand: "", description: "Fresh red apples", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6", stockQuantity: 50, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Bananas", nameHindi: "ताजा केला", barcode: "FRUIT002", category: "fruits", subcategory: "fresh", price: "60.00", unit: "kg", brand: "", description: "Fresh bananas", imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e", stockQuantity: 40, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Oranges", nameHindi: "ताजा संतरा", barcode: "FRUIT003", category: "fruits", subcategory: "citrus", price: "80.00", unit: "kg", brand: "", description: "Fresh juicy oranges", imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0", stockQuantity: 45, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Grapes", nameHindi: "ताजा अंगूर", barcode: "FRUIT004", category: "fruits", subcategory: "fresh", price: "100.00", unit: "kg", brand: "", description: "Fresh green grapes", imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f", stockQuantity: 30, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Mangoes", nameHindi: "ताजा आम", barcode: "FRUIT005", category: "fruits", subcategory: "fresh", price: "150.00", unit: "kg", brand: "", description: "Fresh sweet mangoes", imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078", stockQuantity: 25, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      { name: "Fresh Pomegranate", nameHindi: "ताजा अनार", barcode: "FRUIT006", category: "fruits", subcategory: "fresh", price: "180.00", unit: "kg", brand: "", description: "Fresh red pomegranate", imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371", stockQuantity: 20, isWeighable: true, isAvailable: true, nutritionalInfo: null },
      
      // Spices (minimum 5 items)
      { name: "Turmeric Powder", nameHindi: "हल्दी पाउडर", barcode: "8901030724580", category: "spices", subcategory: "powder", price: "45.00", unit: "200g", brand: "MDH", description: "Pure turmeric powder", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", stockQuantity: 60, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Red Chili Powder", nameHindi: "लाल मिर्च पाउडर", barcode: "8901030724581", category: "spices", subcategory: "powder", price: "55.00", unit: "200g", brand: "Everest", description: "Spicy red chili powder", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", stockQuantity: 45, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Garam Masala", nameHindi: "गरम मसाला", barcode: "8901030724582", category: "spices", subcategory: "blend", price: "65.00", unit: "100g", brand: "MDH", description: "Aromatic garam masala", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", stockQuantity: 35, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Coriander Powder", nameHindi: "धनिया पाउडर", barcode: "8901030724583", category: "spices", subcategory: "powder", price: "40.00", unit: "200g", brand: "Everest", description: "Fresh coriander powder", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", stockQuantity: 50, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Cumin Powder", nameHindi: "जीरा पाउडर", barcode: "8901030724584", category: "spices", subcategory: "powder", price: "70.00", unit: "200g", brand: "MDH", description: "Pure cumin powder", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", stockQuantity: 40, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Black Pepper", nameHindi: "काली मिर्च", barcode: "8901030724585", category: "spices", subcategory: "whole", price: "150.00", unit: "100g", brand: "Everest", description: "Premium black pepper", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d", stockQuantity: 25, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      
      // Dairy Products (minimum 5 items)
      { name: "Fresh Milk", nameHindi: "ताजा दूध", barcode: "8901030724590", category: "dairy", subcategory: "milk", price: "60.00", unit: "1L", brand: "Amul", description: "Fresh full cream milk", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 30, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Paneer", nameHindi: "पनीर", barcode: "8901030724591", category: "dairy", subcategory: "cheese", price: "90.00", unit: "200g", brand: "Amul", description: "Fresh cottage cheese", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 25, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Greek Yogurt", nameHindi: "ग्रीक दही", barcode: "8901030724592", category: "dairy", subcategory: "yogurt", price: "80.00", unit: "500g", brand: "Epigamia", description: "Thick Greek yogurt", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 20, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Butter", nameHindi: "मक्खन", barcode: "8901030724593", category: "dairy", subcategory: "butter", price: "110.00", unit: "500g", brand: "Amul", description: "Fresh white butter", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 35, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Cheese Slices", nameHindi: "चीज़ स्लाइस", barcode: "8901030724594", category: "dairy", subcategory: "cheese", price: "95.00", unit: "200g", brand: "Britannia", description: "Processed cheese slices", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 40, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Lassi", nameHindi: "लस्सी", barcode: "8901030724595", category: "dairy", subcategory: "yogurt", price: "25.00", unit: "200ml", brand: "Amul", description: "Sweet lassi drink", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b", stockQuantity: 50, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      
      // Snacks (minimum 5 items)
      { name: "Namkeen Mix", nameHindi: "नमकीन मिक्स", barcode: "8901030724600", category: "snacks", subcategory: "savory", price: "45.00", unit: "200g", brand: "Haldiram's", description: "Spicy namkeen mix", imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652e8f", stockQuantity: 40, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Biscuits", nameHindi: "बिस्कुट", barcode: "8901030724601", category: "snacks", subcategory: "sweet", price: "35.00", unit: "200g", brand: "Parle-G", description: "Glucose biscuits", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35", stockQuantity: 50, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Potato Chips", nameHindi: "आलू चिप्स", barcode: "8901030724602", category: "snacks", subcategory: "chips", price: "40.00", unit: "150g", brand: "Lays", description: "Crispy potato chips", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b", stockQuantity: 60, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Cookies", nameHindi: "कुकीज़", barcode: "8901030724603", category: "snacks", subcategory: "sweet", price: "55.00", unit: "200g", brand: "Britannia", description: "Chocolate chip cookies", imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e", stockQuantity: 35, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Peanuts", nameHindi: "मूंगफली", barcode: "8901030724604", category: "snacks", subcategory: "nuts", price: "120.00", unit: "500g", brand: "", description: "Roasted peanuts", imageUrl: "https://images.unsplash.com/photo-1568097449713-7e02299386e9", stockQuantity: 45, isWeighable: false, isAvailable: true, nutritionalInfo: null },
      { name: "Murukku", nameHindi: "मुरुक्कू", barcode: "8901030724605", category: "snacks", subcategory: "traditional", price: "60.00", unit: "250g", brand: "Haldiram's", description: "Crispy rice flour snack", imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652e8f", stockQuantity: 30, isWeighable: false, isAvailable: true, nutritionalInfo: null }
    ];

    indianProducts.forEach(product => {
      const id = this.currentId++;
      this.products.set(id, { id, ...product, createdAt: new Date() });
    });

    // Initialize promotions
    const currentPromotions: InsertPromotion[] = [
      {
        title: "Buy 2 Get 1 Free",
        description: "On all cooking oils",
        discountType: "bogo",
        discountValue: "33.33",
        minPurchase: null,
        applicableCategories: ["oils"],
        applicableProducts: null,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: "15% Off Fresh Produce",
        description: "Minimum purchase ₹500",
        discountType: "percentage",
        discountValue: "15.00",
        minPurchase: "500.00",
        applicableCategories: ["vegetables", "fruits"],
        applicableProducts: null,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    ];

    currentPromotions.forEach(promo => {
      const id = this.currentId++;
      this.promotions.set(id, { id, ...promo });
    });

    // Initialize store layout
    const storeLayout = {
      sections: [
        { id: "produce", name: "Fresh Produce", nameHindi: "सब्जी", x: 0, y: 0, width: 1, height: 2, color: "green" },
        { id: "dairy", name: "Dairy", nameHindi: "डेयरी", x: 1, y: 0, width: 1, height: 1, color: "blue" },
        { id: "spices", name: "Spices", nameHindi: "मसाले", x: 2, y: 0, width: 1, height: 1, color: "yellow" },
        { id: "snacks", name: "Snacks", nameHindi: "नाश्ता", x: 0, y: 2, width: 1, height: 1, color: "purple" },
        { id: "care", name: "Personal Care", nameHindi: "व्यक्तिगत देखभाल", x: 1, y: 1, width: 1, height: 1, color: "pink" },
        { id: "checkout", name: "Checkout", nameHindi: "बिलिंग", x: 2, y: 1, width: 1, height: 1, color: "orange" }
      ],
      lifiZones: [
        { section: "produce", x: 0.5, y: 1, range: 2 },
        { section: "dairy", x: 1.5, y: 0.5, range: 1.5 },
        { section: "spices", x: 2.5, y: 0.5, range: 1.5 },
        { section: "snacks", x: 0.5, y: 2.5, range: 1.5 },
        { section: "care", x: 1.5, y: 1.5, range: 1.5 },
        { section: "checkout", x: 2.5, y: 1.5, range: 1.5 }
      ]
    };

    this.stores.set(1, {
      id: 1,
      name: "Smart Grocery Store",
      layout: storeLayout,
      sections: storeLayout.sections
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.barcode === barcode);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.nameHindi?.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm)
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { ...insertProduct, id, createdAt: new Date() };
    this.products.set(id, product);
    return product;
  }

  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      product.stockQuantity = quantity;
      this.products.set(id, product);
      return product;
    }
    return undefined;
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentId++;
    const cartItem: CartItem = { ...insertCartItem, id, addedAt: new Date() };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (cartItem) {
      cartItem.quantity = quantity.toString();
      cartItem.totalPrice = (parseFloat(cartItem.unitPrice) * quantity).toFixed(2);
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
    return undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId);
    
    cartItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  // Promotion operations
  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return Array.from(this.promotions.values()).filter(promo => 
      promo.isActive && 
      new Date(promo.validFrom) <= now && 
      new Date(promo.validUntil) >= now
    );
  }

  async getApplicablePromotions(categoryIds: string[], productIds: number[]): Promise<Promotion[]> {
    const activePromotions = await this.getActivePromotions();
    return activePromotions.filter(promo => {
      if (promo.applicableCategories && categoryIds.some(cat => promo.applicableCategories!.includes(cat))) {
        return true;
      }
      if (promo.applicableProducts && productIds.some(id => promo.applicableProducts!.includes(id))) {
        return true;
      }
      return false;
    });
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const id = this.currentId++;
    const promotion: Promotion = { ...insertPromotion, id };
    this.promotions.set(id, promotion);
    return promotion;
  }

  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoreLayout(storeId: number): Promise<any> {
    const store = this.stores.get(storeId);
    return store?.layout || null;
  }

  // Li-Fi positioning
  async updatePosition(insertPosition: InsertLiFiPosition): Promise<LiFiPosition> {
    const position: LiFiPosition = { 
      id: this.currentId++, 
      ...insertPosition, 
      timestamp: new Date() 
    };
    this.lifiPositions.set(insertPosition.sessionId, position);
    return position;
  }

  async getCurrentPosition(sessionId: string): Promise<LiFiPosition | undefined> {
    return this.lifiPositions.get(sessionId);
  }
}

export const storage = new MemStorage();
