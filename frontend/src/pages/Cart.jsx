import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, clearCartContext, fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [placingOrder, setPlacingOrder] = useState(false);

    const handleCheckout = async () => {
        setPlacingOrder(true);
        try {
            await api.post('/orders', { fromCart: true });
            alert("Order placed successfully!");
            clearCartContext();
            fetchCart();
            navigate('/orders');
        } catch (error) {
            console.error("Order failed", error);
            alert("Checkout failed. Check stock or prescription requirements.");
        }
        setPlacingOrder(false);
    };

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Please login to view your cart.</div>;
    }

    if (!cart?.cartItems?.length) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h2>
                <p>Browse medicines and add them to your cart.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
                    Browse Medicines
                </button>
            </div>
        );
    }

    const totalAmount = cart.cartItems.reduce((total, item) => total + (item.quantity * item.dosage.price), 0);

    return (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Your Shopping Cart</h2>
            <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    {cart.cartItems.map((item) => (
                        <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.medicine.name}</h3>
                                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item.dosage.dosageForm}</p>
                                <span className={`badge ${item.medicine.requiresPrescription ? 'badge-danger' : 'badge-success'}`}>
                                    {item.medicine.requiresPrescription ? 'Rx Required' : 'OTC'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty</div>
                                    <div style={{ fontWeight: 'bold' }}>{item.quantity}</div>
                                </div>
                                <div style={{ textAlign: 'center', width: '80px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Price</div>
                                    <div style={{ fontWeight: 'bold' }}>${(item.dosage.price * item.quantity).toFixed(2)}</div>
                                </div>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="card glass" style={{ alignSelf: 'start', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>Order Summary</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                        <span style={{ fontWeight: 500 }}>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                        <span style={{ fontWeight: 500 }}>$5.00</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary-color)' }}>${(totalAmount + 5).toFixed(2)}</span>
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                        onClick={handleCheckout}
                        disabled={placingOrder}
                    >
                        {placingOrder ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
