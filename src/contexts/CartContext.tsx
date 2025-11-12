import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Property } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  user_id: string;
  property_id: number;
  created_at: string;
  property: Property | null;
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
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      if (cartData && cartData.length > 0) {
        const propertyIds = cartData.map(item => item.property_id);

        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        if (propertiesError) throw propertiesError;

        const cartItemsWithDetails = cartData.map(cartItem => {
          const property = propertiesData?.find(p => p.id === cartItem.property_id) || null;
          return {
            ...cartItem,
            property
          };
        });

        setCartItems(cartItemsWithDetails);
      } else {
        setCartItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      toast.error(error.message || 'Failed to load cart items');
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
      if (isInCart(propertyId)) {
        toast.info('This property is already in your cart');
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      await fetchCartItems();
      toast.success('Property added to cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add property to cart');
    }
  }

  async function removeFromCart(propertyId: number) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setCartItems(cartItems.filter(item => item.property_id !== propertyId));
      toast.success('Property removed from cart');
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error(error.message || 'Failed to remove property from cart');
    }
  }

  async function clearCart() {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error(error.message || 'Failed to clear cart');
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