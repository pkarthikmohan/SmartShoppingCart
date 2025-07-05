export const STORE_SECTIONS = {
  produce: { name: "Fresh Produce", nameHindi: "सब्जी", color: "bg-green-200 hover:bg-green-300" },
  dairy: { name: "Dairy", nameHindi: "डेयरी", color: "bg-blue-200 hover:bg-blue-300" },
  spices: { name: "Spices", nameHindi: "मसाले", color: "bg-yellow-200 hover:bg-yellow-300" },
  snacks: { name: "Snacks", nameHindi: "नाश्ता", color: "bg-purple-200 hover:bg-purple-300" },
  care: { name: "Personal Care", nameHindi: "व्यक्तिगत देखभाल", color: "bg-pink-200 hover:bg-pink-300" },
  checkout: { name: "Checkout", nameHindi: "बिलिंग", color: "bg-orange-200 hover:bg-orange-300" }
} as const;

export const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", icon: "fas fa-mobile-alt" },
  { id: "card", name: "Card", icon: "fas fa-credit-card" },
  { id: "wallet", name: "Wallet", icon: "fas fa-wallet" },
  { id: "cash", name: "Cash", icon: "fas fa-money-bill-wave" }
] as const;

export const CATEGORIES = [
  { id: "vegetables", name: "Vegetables", nameHindi: "सब्जियां" },
  { id: "fruits", name: "Fruits", nameHindi: "फल" },
  { id: "grains", name: "Grains & Dal", nameHindi: "अनाज और दाल" },
  { id: "spices", name: "Spices", nameHindi: "मसाले" },
  { id: "dairy", name: "Dairy", nameHindi: "डेयरी" },
  { id: "oils", name: "Oils & Ghee", nameHindi: "तेल और घी" },
  { id: "snacks", name: "Snacks", nameHindi: "नाश्ता" }
] as const;

export const SAMPLE_STOCK_IMAGES = {
  vegetables: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  snacks: "https://pixabay.com/get/g173c7e8e2b04b3eee8aebb79a9302d05849d05c09efc6705802810f932384fb1afac66cbfdbac91d02bf93596278e941_1280.jpg",
  care: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  checkout: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
} as const;

export const WEBSOCKET_EVENTS = {
  CONNECTED: 'connected',
  LIFI_POSITION: 'lifi_position',
  POSITION_UPDATED: 'position_updated',
  CART_UPDATED: 'cart_updated',
  CART_SYNC: 'cart_sync',
  ITEM_ADDED: 'item_added',
  PROMOTION_ALERT: 'promotion_alert'
} as const;

export const DEFAULT_SESSION_ID = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
