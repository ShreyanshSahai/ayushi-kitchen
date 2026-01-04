"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

type Ingredient = {
    id: number;
    name: string;
};

type FoodImage = {
    id: number;
    path: string;
};

type FoodItem = {
    id: number;
    name: string;
    description: string | null;
    originalPrice: number;
    discountedPrice: number | null;
    isFeatured: boolean;
    isSoldOut: boolean;
    isWeekendOnly: boolean;
    isActive: boolean;
    type: {
        id: number;
        name: string;
    } | null;
    madeWith: Array<{
        id: number;
        quantity: string;
        ingredient: Ingredient;
    }>;
    images: FoodImage[];
};

type CartItem = {
    food: FoodItem;
    quantity: number;
};

interface CartContextType {
    cart: CartItem[];
    addToCart: (food: FoodItem) => void;
    updateQuantity: (foodId: number, quantity: number) => void;
    removeFromCart: (foodId: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((food: FoodItem) => {
        setCart((current) => {
            const existing = current.find((entry) => entry.food.id === food.id);
            if (existing) {
                return current.map((entry) =>
                    entry.food.id === food.id
                        ? { ...entry, quantity: entry.quantity + 1 }
                        : entry
                );
            }
            return [...current, { food, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((foodId: number, quantity: number) => {
        setCart((current) =>
            current
                .map((entry) =>
                    entry.food.id === foodId ? { ...entry, quantity } : entry
                )
                .filter((entry) => entry.quantity > 0)
        );
    }, []);

    const removeFromCart = useCallback((foodId: number) => {
        setCart((current) =>
            current.filter((entry) => entry.food.id !== foodId)
        );
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
