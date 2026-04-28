import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [user]);

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Please login to view your orders.</div>;
    }

    if (loading) {
        return <div className="spinner"></div>;
    }

    if (orders.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>No Orders Yet</h2>
                <p>You haven't placed any orders.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'DELIVERED': return 'badge-success';
            case 'SHIPPED': return 'badge-primary';
            case 'CONFIRMED': return 'badge-warning';
            default: return 'badge-warning';
        }
    };

    return (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Order History</h2>
            <div className="grid grid-cols-1">
                {orders.map((order) => (
                    <div key={order.id} className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id}</span>
                                <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </span>
                            </div>
                            <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{item.quantity}x {item.medicine.name} ({item.dosage.dosageForm})</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                Total: <span style={{ color: 'var(--primary-color)' }}>${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <button 
                                className="btn btn-outline"
                                onClick={async () => {
                                    try {
                                        for (const item of order.orderItems) {
                                            await api.post('/cart/add', {
                                                medicineId: item.medicine.id,
                                                dosageId: item.dosage.id,
                                                quantity: item.quantity
                                            });
                                        }
                                        alert('Items added to cart successfully!');
                                        window.location.href = '/cart';
                                    } catch (err) {
                                        console.error('Reorder failed', err);
                                        alert('Could not add items to cart.');
                                    }
                                }}
                            >
                                Reorder
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
