import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Property } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  user_id: string;
  property_id: number;
  created_at: string;
  property: Property;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (propertyId: number) => Promise<void>;
  removeFromCart: (propertyId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (propertyId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchCartItems() {
    if (!user) return;

    try {
      setLoading(true);
      // First get the cart items
      const { data: cartData, error: cartError } = await supabase
        .from('user_cart')
        .select('*')
        .eq('user_id', user.id);

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

    try {
      // Check if the property is already in the cart
      if (isInCart(propertyId)) {
        toast.info('This property is already in your cart');
        return;
      }

      // Add to cart in Supabase
      const { error } = await supabase
        .from('user_cart')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          created_at: new Date().toISOString()
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_cart')
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

  async function clearCart() {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_cart')
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

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart
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