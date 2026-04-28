import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Package, Activity, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/admin/orders');
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch admin orders", error);
            }
            setLoading(false);
        };
        if (user && user.role === 'ADMIN') {
            fetchOrders();
        }
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Access Denied. Admins only.</div>;
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/admin/orders/${id}/status?status=${newStatus}`);
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Status update failed", error);
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Admin Dashboard</h2>
            
            <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Orders</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{orders.length}</div>
                    </div>
                </div>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => window.location.href='/admin/medicines'}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: '#10b981' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Medicines</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Manage &rarr;</div>
                    </div>
                </div>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', color: '#f59e0b' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Prescriptions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Review</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Orders</h3>
                {orders.length === 0 ? (
                    <p>No orders in the system.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.75rem' }}>ID</th>
                                    <th style={{ padding: '0.75rem' }}>User</th>
                                    <th style={{ padding: '0.75rem' }}>Amount</th>
                                    <th style={{ padding: '0.75rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>#{order.id}</td>
                                        <td style={{ padding: '0.75rem' }}>{order.user.email}</td>
                                        <td style={{ padding: '0.75rem' }}>${order.totalAmount.toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className={`badge ${
                                                order.status === 'DELIVERED' ? 'badge-success' : 
                                                order.status === 'SHIPPED' ? 'badge-primary' : 'badge-warning'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <select 
                                                className="form-select" 
                                                style={{ width: '130px', padding: '0.25rem' }}
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            >
                                                <option value="PLACED">Placed</option>
                                                <option value="CONFIRMED">Confirmed</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
