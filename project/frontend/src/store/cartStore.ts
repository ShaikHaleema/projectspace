import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          let newItems;
          
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity: 1 }];
          }
          
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, total };
        }),
        
      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, total };
        }),
        
      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return get().removeItem(id) as any;
          }
          
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, total };
        }),
        
      clearCart: () => set({ items: [], total: 0 }),
      
      getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);