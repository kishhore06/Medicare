import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Package, Activity, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, prescriptionsRes] = await Promise.all([
                    api.get('/admin/orders'),
                    api.get('/admin/prescriptions')
                ]);
                setOrders(ordersRes.data);
                setPrescriptions(prescriptionsRes.data);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data", error);
            }
            setLoading(false);
        };
        if (user && user.role === 'ADMIN') {
            fetchDashboardData();
        }
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Access Denied. Admins only.</div>;
    }

    const handleOrderStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/admin/orders/${id}/status?status=${newStatus}`);
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Order status update failed", error);
            alert("Failed to update order status.");
        }
    };

    const handlePrescriptionStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/admin/prescriptions/${id}/status?status=${newStatus}`);
            setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch (error) {
            console.error("Prescription status update failed", error);
            alert("Failed to update prescription status.");
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '3rem auto' }}></div>;

    const pendingPrescriptionsCount = prescriptions.filter(p => p.status === 'PENDING').length;

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
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Medicines Catalog</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Manage &rarr;</div>
                    </div>
                </div>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', color: '#f59e0b' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pending Prescriptions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: pendingPrescriptionsCount > 0 ? 'var(--danger-color)' : 'inherit' }}>
                            {pendingPrescriptionsCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* Prescriptions Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Prescriptions</h3>
                {prescriptions.length === 0 ? (
                    <p>No prescriptions uploaded.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.75rem' }}>ID</th>
                                    <th style={{ padding: '0.75rem' }}>User</th>
                                    <th style={{ padding: '0.75rem' }}>Document</th>
                                    <th style={{ padding: '0.75rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>#{p.id}</td>
                                        <td style={{ padding: '0.75rem' }}>{p.user.email}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <a 
                                                href={`http://localhost:8080/uploads/${p.filePath}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
                                            >
                                                View File
                                            </a>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className={`badge ${
                                                p.status === 'APPROVED' ? 'badge-success' : 
                                                p.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <select 
                                                className="form-select" 
                                                style={{ width: '130px', padding: '0.25rem' }}
                                                value={p.status}
                                                onChange={(e) => handlePrescriptionStatusUpdate(p.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Orders Section */}
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
                                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
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
