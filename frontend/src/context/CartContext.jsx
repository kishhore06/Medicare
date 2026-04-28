import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState({ cartItems: [] });
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/cart');
            setCart(res.data);
        } catch (error) {
            console.error("Error fetching cart", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart({ cartItems: [] });
        }
    }, [user]);

    const addToCart = async (medicineId, dosageId, quantity) => {
        try {
            const res = await api.post('/cart/add', { medicineId, dosageId, quantity });
            setCart(res.data);
            return true;
        } catch (error) {
            console.error("Error adding to cart", error);
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const res = await api.delete(`/cart/remove/${itemId}`);
            setCart(res.data);
        } catch (error) {
            console.error("Error removing from cart", error);
        }
    };
    
    const clearCartContext = () => {
        setCart({ cartItems: [] });
    };

    return (
        <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, removeFromCart, clearCartContext }}>
            {children}
        </CartContext.Provider>
    );
};
