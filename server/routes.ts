import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCartItemSchema, insertLiFiPositionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const sessionId = req.url?.split('sessionId=')[1] || `session_${Date.now()}`;
    clients.set(sessionId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'lifi_position':
            const position = await storage.updatePosition({
              sessionId,
              section: message.section,
              x: message.x,
              y: message.y
            });
            
            // Broadcast position update to all clients
            const positionUpdate = {
              type: 'position_updated',
              sessionId,
              position
            };
            
            clients.forEach((client, clientSessionId) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(positionUpdate));
              }
            });
            break;

          case 'cart_updated':
            // Broadcast cart updates to all clients for the same session
            const cartUpdate = {
              type: 'cart_sync',
              sessionId,
              cart: message.cart
            };
            
            const client = clients.get(sessionId);
            if (client && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(cartUpdate));
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(sessionId);
    });

    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      message: 'Li-Fi tracking active'
    }));
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query required" });
      }
      
      const products = await storage.searchProducts(q);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product by barcode" });
    }
  });

  // Cart routes
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addCartItem(cartItemData);
      
      // Notify WebSocket clients of cart update
      const client = clients.get(cartItemData.sessionId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'item_added',
          cartItem
        }));
      }
      
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || isNaN(parseFloat(quantity))) {
        return res.status(400).json({ error: "Valid quantity required" });
      }
      
      const cartItem = await storage.updateCartItem(parseInt(id), parseFloat(quantity));
      
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeCartItem(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Promotion routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions/applicable", async (req, res) => {
    try {
      const { categories, productIds } = req.body;
      const promotions = await storage.getApplicablePromotions(
        categories || [], 
        productIds || []
      );
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applicable promotions" });
    }
  });

  // Store routes
  app.get("/api/store/:id/layout", async (req, res) => {
    try {
      const { id } = req.params;
      const layout = await storage.getStoreLayout(parseInt(id));
      
      if (!layout) {
        return res.status(404).json({ error: "Store layout not found" });
      }
      
      res.json(layout);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store layout" });
    }
  });

  // Li-Fi positioning routes
  app.get("/api/position/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const position = await storage.getCurrentPosition(sessionId);
      res.json(position);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current position" });
    }
  });

  app.post("/api/position", async (req, res) => {
    try {
      const positionData = insertLiFiPositionSchema.parse(req.body);
      const position = await storage.updatePosition(positionData);
      res.json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update position" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/cart-usage", async (req, res) => {
    try {
      // Mock analytics data for demonstration
      const analytics = {
        totalCarts: 45,
        activeNow: 12,
        averageItems: 8.5,
        popularCategories: [
          { category: "vegetables", count: 120 },
          { category: "grains", count: 95 },
          { category: "dairy", count: 78 },
          { category: "spices", count: 65 }
        ],
        peakHours: [
          { hour: 10, usage: 35 },
          { hour: 18, usage: 42 },
          { hour: 20, usage: 28 }
        ]
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}
