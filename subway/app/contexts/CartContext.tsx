import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export type CartItem = {
  id?: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  total_price: number;
};

type CartState = {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<string>;
  clearCart: () => void;
  loadCart: () => void;
};

const CartContext = createContext<CartState | undefined>(undefined);

const cartReducer = (state: CartItem[], action: { type: string; payload?: CartItem | CartItem[] }) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const item = action.payload as CartItem;
      const existingItemIndex = state.findIndex(cartItem => cartItem.name === item.name);

      if (existingItemIndex !== -1) {
        const updatedCart = [...state];
        const existingItem = updatedCart[existingItemIndex];

        const newQuantity = (existingItem.quantity || 1) + (item.quantity || 1);
        const newTotalPrice = item.price * newQuantity;

        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          total_price: newTotalPrice,
        };

        return updatedCart;
      }

      return [
        ...state,
        {
          ...item,
          quantity: item.quantity || 1,
          total_price: item.price * (item.quantity || 1),
        },
      ];
    }

    case 'CLEAR_CART':
      return [];
    case 'LOAD_CART':
      return action.payload as CartItem[];
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const loadCart = async () => {
    try {
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse?.user;

      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        dispatch({ type: 'LOAD_CART', payload: data || [] });
      } else {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (item: CartItem): Promise<string> => {
    try {
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse?.user;
  
      if (!user) {
        return 'login_required';
      }
  
      // Check if the item exists in the cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', item.name);
  
      if (fetchError) throw fetchError;
  
      if (existingItems && existingItems.length > 0) {
        const existingItem = existingItems[0];
        const newQuantity = (existingItem.quantity || 1) + (item.quantity || 1);
        const newTotalPrice = item.price * newQuantity;
  
        console.log('Existing item:', existingItem);
        console.log('New Quantity:', newQuantity, 'New Total Price:', newTotalPrice);
  
        // Update the item in Supabase
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity, total_price: newTotalPrice })
          .eq('id', existingItem.id);
  
        if (updateError) throw updateError;
      } else {
        const totalPrice = item.price * (item.quantity || 1);
  
        // Insert the new item into Supabase
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{ ...item, quantity: item.quantity || 1, total_price: totalPrice, user_id: user.id }]);
  
        if (insertError) throw insertError;
      }
  
      // Reload the cart from Supabase to ensure accurate state
      await loadCart();
  
      return 'success';
    } catch (error) {
      console.error('Error adding to cart:', error);
      return 'error';
    }
  };
  

  const clearCart = async () => {
    try {
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse?.user;

      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      }

      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadCart();
      } else if (event === 'SIGNED_OUT') {
        clearCart();
      }
    });
  
    // Access data.subscription for the unsubscribe function
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
