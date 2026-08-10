import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            // Ensure all prices are numbers when loading from localStorage
            return parsedCart.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0
            }));
        }
        return [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [categories, setCategories] = useState(["All"]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Fetch categories from Supabase
    useEffect(() => {
        const fetchCategories = async () => {
            const { data: catData } = await supabase.from('categories').select('name');
            if (catData) {
                setCategories(["All", ...catData.map(c => c.name)]);
            }
        };
        fetchCategories();
    }, []);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.id === item.id);
            if (existingItem) {
                return prevCart.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            // Ensure price is a number when adding to cart
            return [...prevCart, { ...item, price: parseFloat(item.price), quantity: 1 }];
        });
        setIsCartOpen(true); // Open cart when item is added
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const cartTotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            addToCart,
            toggleCart,
            setIsCartOpen,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            searchQuery,
            setSearchQuery,
            activeCategory,
            setActiveCategory,
            categories,
            setCategories
        }}>
            {children}
        </CartContext.Provider>
    );
};
