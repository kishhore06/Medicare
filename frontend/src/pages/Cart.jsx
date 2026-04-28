import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutPayment from '../components/CheckoutPayment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const Cart = () => {
    const { cart, removeFromCart, clearCartContext, fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [placingOrder, setPlacingOrder] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const [clientSecret, setClientSecret] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [showPayment, setShowPayment] = useState(false);

    // Check if any item in cart requires prescription
    const requiresPrescription = cart?.cartItems?.some(item => item.medicine.requiresPrescription) || false;

    useEffect(() => {
        if (requiresPrescription && user) {
            fetchPrescriptions();
        }
    }, [requiresPrescription, user]);

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/prescriptions');
            setPrescriptions(res.data);
            // Default select the first approved prescription if available
            const approved = res.data.find(p => p.status === 'APPROVED');
            if (approved) {
                setSelectedPrescriptionId(approved.id);
            }
        } catch (error) {
            console.error("Error fetching prescriptions", error);
        }
    };

    const handlePrescriptionUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        setUploading(true);
        try {
            const res = await api.post('/prescriptions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPrescriptions([...prescriptions, res.data]);
            setSelectedPrescriptionId(res.data.id);
            alert("Prescription uploaded! Please wait for admin approval.");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Prescription upload failed. Please try again.");
        }
        setUploading(false);
    };

    const handleCheckout = async () => {
        if (requiresPrescription) {
            if (!selectedPrescriptionId) {
                alert("Please select or upload a prescription for the Rx required items.");
                return;
            }
            
            const selectedPrescription = prescriptions.find(p => p.id === parseInt(selectedPrescriptionId) || p.id === selectedPrescriptionId);
            if (!selectedPrescription || selectedPrescription.status !== 'APPROVED') {
                alert("The selected prescription must be APPROVED by an admin before you can proceed.");
                return;
            }
        }

        setPlacingOrder(true);
        try {
            const res = await api.post('/payment/create-payment-intent');
            setClientSecret(res.data.clientSecret);
            setPaymentAmount(res.data.amount);
            setShowPayment(true);
        } catch (error) {
            console.error("Payment initialization failed", error);
            alert(error.response?.data?.error || "Failed to initialize payment.");
        }
        setPlacingOrder(false);
    };

    const handlePaymentSuccess = async () => {
        setPlacingOrder(true);
        try {
            await api.post('/orders', { 
                fromCart: true,
                prescriptionId: selectedPrescriptionId || null
            });
            alert("Payment successful! Order placed.");
            clearCartContext();
            fetchCart();
            navigate('/orders');
        } catch (error) {
            console.error("Order failed", error);
            alert(error.response?.data?.message || "Checkout failed after payment.");
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
                
                <div style={{ alignSelf: 'start', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {requiresPrescription && (
                        <div className="card glass" style={{ border: '2px solid var(--danger-color)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>Prescription Required</h3>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                One or more items in your cart require a valid medical prescription to be approved by an admin.
                            </p>
                            
                            {prescriptions.length > 0 && (
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">Select Saved Prescription</label>
                                    <select 
                                        className="form-input" 
                                        value={selectedPrescriptionId} 
                                        onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                                    >
                                        <option value="">-- Select Prescription --</option>
                                        {prescriptions.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.status === 'REJECTED'}>
                                                Prescription #{p.id} - Status: {p.status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label className="form-label">{prescriptions.length > 0 ? "Or Upload New" : "Upload Prescription"}</label>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf"
                                    onChange={handlePrescriptionUpload}
                                    disabled={uploading}
                                    className="form-input"
                                    style={{ padding: '0.5rem' }}
                                />
                                {uploading && <small style={{ color: 'var(--primary-color)', marginTop: '0.5rem', display: 'block' }}>Uploading...</small>}
                            </div>
                        </div>
                    )}

                    <div className="card glass">
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

                        {!showPayment ? (
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                                onClick={handleCheckout}
                                disabled={placingOrder}
                            >
                                {placingOrder ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                        ) : (
                            clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutPayment 
                                        amount={paymentAmount} 
                                        onSuccess={handlePaymentSuccess} 
                                        onCancel={() => setShowPayment(false)} 
                                    />
                                </Elements>
                            )
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
