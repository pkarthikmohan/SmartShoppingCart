import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { CartItem, Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

interface UseCartOptions {
  sessionId: string;
  onCartUpdate?: (cart: CartSummary) => void;
}

export function useCart({ sessionId, onCartUpdate }: UseCartOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    items: [],
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart', sessionId],
    enabled: !!sessionId,
  });

  // Add item to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (params: {
      productId: number;
      quantity: number;
      weight?: number;
      unitPrice: number;
    }) => {
      const totalPrice = params.weight 
        ? parseFloat((params.unitPrice * params.weight).toFixed(2))
        : parseFloat((params.unitPrice * params.quantity).toFixed(2));

      const cartItem = {
        sessionId,
        productId: params.productId,
        quantity: params.quantity.toString(),
        weight: params.weight?.toString() || null,
        unitPrice: params.unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
      };

      const response = await apiRequest('POST', '/api/cart', cartItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Item Added",
        description: "Product has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async (params: { id: number; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${params.id}`, {
        quantity: params.quantity
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    }
  });

  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Item Removed",
        description: "Product has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/cart/session/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  });

  // Calculate cart summary
  const calculateCartSummary = useCallback((items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const tax = subtotal * 0.05; // 5% GST
    const discount = subtotal > 500 ? subtotal * 0.15 : 0; // 15% discount for orders over ₹500
    const total = subtotal + tax - discount;
    const itemCount = items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);

    return {
      items,
      itemCount: Math.round(itemCount),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }, []);

  // Update cart summary when items change
  useEffect(() => {
    const summary = calculateCartSummary(cartItems);
    setCartSummary(summary);
    onCartUpdate?.(summary);
  }, [cartItems, calculateCartSummary, onCartUpdate]);

  // Helper function to add product to cart
  const addProduct = useCallback(async (product: Product, quantity: number = 1, weight?: number) => {
    await addToCartMutation.mutateAsync({
      productId: product.id,
      quantity: weight ? weight : quantity,
      weight: product.isWeighable ? weight : undefined,
      unitPrice: parseFloat(product.price)
    });
  }, [addToCartMutation]);

  // Helper function to add scanned product
  const addScannedProduct = useCallback(async (product: Product) => {
    await addProduct(product, 1);
  }, [addProduct]);

  // Helper function to add weighed product
  const addWeighedProduct = useCallback(async (product: Product, weight: number) => {
    await addProduct(product, 1, weight);
  }, [addProduct]);

  // Helper function to update quantity
  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeCartItemMutation.mutateAsync(itemId);
    } else {
      await updateCartItemMutation.mutateAsync({ id: itemId, quantity });
    }
  }, [updateCartItemMutation, removeCartItemMutation]);

  // Helper function to remove item
  const removeItem = useCallback(async (itemId: number) => {
    await removeCartItemMutation.mutateAsync(itemId);
  }, [removeCartItemMutation]);

  // Helper function to clear cart
  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
  }, [clearCartMutation]);

  return {
    cartSummary,
    isLoading,
    addProduct,
    addScannedProduct,
    addWeighedProduct,
    updateQuantity,
    removeItem,
    clearCart,
    isAddingItem: addToCartMutation.isPending,
    isUpdatingItem: updateCartItemMutation.isPending,
    isRemovingItem: removeCartItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending
  };
}
