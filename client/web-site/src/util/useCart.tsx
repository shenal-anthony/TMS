import { createSignal, onMount } from "solid-js";

export function useCart() {
  const [cartItems, setCartItems] = createSignal<CartItem[]>([]);
  
  onMount(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  });

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem = { 
      ...item, 
      id: Date.now()
    };
    saveCart([...cartItems(), newItem]);
  };

  const removeFromCart = (id: number) => {
    saveCart(cartItems().filter(item => item.id !== id));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalPrice = () => {
    return cartItems().reduce((sum, item) => sum + (item.price * item.headCount), 0);
  };

  const itemExists = (packageId: number) => {
    return cartItems().some(item => item.packageId === packageId);
  };

  const updateQuantity = (id: number, newCount: number) => {
    if (newCount < 1) return;
    saveCart(cartItems().map(item => 
      item.id === id ? { ...item, headCount: newCount } : item
    ));
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    totalPrice,
    itemExists,
    updateQuantity
  };
}

type CartItem = {
  id: number;
  packageId: number;
  name: string;
  price: number;
  headCount: number;
  date: string;
  duration: string;
};