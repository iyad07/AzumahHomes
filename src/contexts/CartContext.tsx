import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Property } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  user_id: string;
  property_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  property: Property;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (propertyId: number) => Promise<void>;
  removeFromCart: (propertyId: number) => Promise<void>;
  updateQuantity: (propertyId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (propertyId: number) => boolean;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user && !isAdmin) {
      fetchCartItems();
    } else {
      // For admin users or no user, set empty cart and stop loading
      setCartItems([]);
      setLoading(false);
    }
  }, [user, isAdmin]);

  async function fetchCartItems() {
    if (!user) return;

    try {
      setLoading(true);
      // First get the cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cartError) throw cartError;

      if (cartData && cartData.length > 0) {
        // Get all property IDs from cart
        const propertyIds = cartData.map(item => item.property_id);
        
        // Fetch the property details for all items in the cart
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        if (propertiesError) throw propertiesError;

        // Combine cart items with their property details
        const cartItemsWithDetails = cartData.map(cartItem => {
          const property = propertiesData?.find(p => p.id === cartItem.property_id);
          return {
            ...cartItem,
            property: property as Property
          };
        });

        setCartItems(cartItemsWithDetails);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(propertyId: number) {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      return;
    }

    if (isAdmin) {
      toast.info('Admins cannot add properties to cart');
      return;
    }

    try {
      // Check if the property is already in the cart
      if (isInCart(propertyId)) {
        // If already in cart, increment quantity
        const existingItem = cartItems.find(item => item.property_id === propertyId);
        if (existingItem) {
          await updateQuantity(propertyId, existingItem.quantity + 1);
          return;
        }
      }

      // Add to cart in Supabase
      const { error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          quantity: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Refresh cart items
      await fetchCartItems();
      toast.success('Property added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add property to cart');
    }
  }

  async function removeFromCart(propertyId: number) {
    if (!user || isAdmin) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Update the UI by removing the property from the list
      setCartItems(cartItems.filter(item => item.property_id !== propertyId));
      toast.success('Property removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove property from cart');
    }
  }

  async function updateQuantity(propertyId: number, quantity: number) {
    if (!user || isAdmin) return;

    try {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        await removeFromCart(propertyId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Update the UI
      setCartItems(cartItems.map(item => 
        item.property_id === propertyId 
          ? { ...item, quantity, updated_at: new Date().toISOString() }
          : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  }

  async function clearCart() {
    if (!user || isAdmin) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  }

  function isInCart(propertyId: number) {
    return cartItems.some(item => item.property_id === propertyId);
  }

  function getTotalItems() {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}