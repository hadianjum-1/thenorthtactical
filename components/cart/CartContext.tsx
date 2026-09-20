"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "../ui/Toast";

export interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    price: number;
    compareAtPrice: number | null;
    sku: string;
    stock: number;
    product: {
      id: string;
      title: string;
      slug: string;
      images: {
        url: string;
        alt: string | null;
      }[];
    };
  };
}

export interface Cart {
  id: string;
  currency: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalItems: number;
  subtotal: number;
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  const loadCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadCart();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadCart]);

  const addToCart = async (variantId: string, quantity = 1): Promise<boolean> => {
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast(data.message || "Failed to add item", "error");
        return false;
      }

      if (data.cart) {
        setCart(data.cart);
      } else {
        await loadCart();
      }

      toast("Equipment added to loadout", "success");
      setIsDrawerOpen(true);
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      toast("Error adding item to cart", "error");
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast(data.message || "Failed to update quantity", "error");
        return false;
      }

      await loadCart();
      return true;
    } catch (error) {
      console.error("Update quantity error:", error);
      return false;
    }
  };

  const removeItem = async (itemId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast(data.message || "Failed to remove item", "error");
        return false;
      }

      await loadCart();
      toast("Item removed from loadout", "info");
      return true;
    } catch (error) {
      console.error("Remove item error:", error);
      return false;
    }
  };

  const totalItems =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const subtotal =
    cart?.items?.reduce(
      (acc, item) => acc + Number(item.variant.price) * item.quantity,
      0
    ) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
