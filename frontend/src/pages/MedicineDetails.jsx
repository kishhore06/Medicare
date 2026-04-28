import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Pill, Activity, Stethoscope, ArrowLeft, ShoppingCart, CreditCard } from 'lucide-react';

const MedicineDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedDosage, setSelectedDosage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                const res = await api.get(`/medicines/public/${id}`);
                setMedicine(res.data);
                if (res.data.dosages && res.data.dosages.length > 0) {
                    setSelectedDosage(res.data.dosages[0]);
                }
            } catch (error) {
                console.error("Failed to fetch medicine details", error);
            }
            setLoading(false);
        };
        fetchMedicine();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            alert("Please login first.");
            navigate('/login');
            return;
        }
        if (!selectedDosage) return;

        if (selectedDosage.stock < quantity) {
            alert("Not enough stock available.");
            return;
        }

        const success = await addToCart(medicine.id, selectedDosage.id, quantity);
        if (success) {
            alert("Added to cart successfully!");
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            alert("Please login first.");
            navigate('/login');
            return;
        }
        if (!selectedDosage) return;
        
        if (selectedDosage.stock < quantity) {
            alert("Not enough stock available.");
            return;
        }

        const success = await addToCart(medicine.id, selectedDosage.id, quantity);
        if (success) {
            navigate('/cart');
        }
    };

    if (loading) return <div className="spinner"></div>;
    if (!medicine) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Medicine not found.</div>;

    return (
        <div className="animate-fade-in" style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
                <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', minHeight: '300px' }}>
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                        {medicine.category === 'ORAL' ? <Pill size={64} /> : 
                         medicine.category === 'TOPICAL' ? <Activity size={64} /> : <Stethoscope size={64} />}
                    </div>
                    <span className={`badge ${medicine.requiresPrescription ? 'badge-danger' : 'badge-success'}`}>
                        {medicine.requiresPrescription ? 'Prescription Required' : 'Over the Counter'}
                    </span>
                </div>

                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{medicine.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{medicine.manufacturer}</p>
                    
                    <p style={{ marginBottom: '2rem', lineHeight: 1.6 }}>{medicine.description}</p>

                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Select Dosage</h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {medicine.dosages.map(dosage => (
                                <div 
                                    key={dosage.id}
                                    onClick={() => setSelectedDosage(dosage)}
                                    style={{ 
                                        padding: '1rem', 
                                        border: `2px solid ${selectedDosage?.id === dosage.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedDosage?.id === dosage.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                                    }}
                                >
                                    <div style={{ fontWeight: 500 }}>{dosage.dosageForm}</div>
                                    <div style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginTop: '0.25rem' }}>${dosage.price.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {dosage.stock > 0 ? `${dosage.stock} in stock` : 'Out of stock'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <label style={{ fontWeight: 500 }}>Quantity:</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '80px' }} 
                            min="1" 
                            max={selectedDosage?.stock || 1} 
                            value={quantity} 
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" style={{ flexGrow: 1, padding: '1rem', fontSize: '1.1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onClick={handleAddToCart} disabled={!selectedDosage || selectedDosage.stock === 0}>
                            <ShoppingCart size={20} /> Add to Cart
                        </button>
                        <button className="btn btn-primary" style={{ flexGrow: 1, padding: '1rem', fontSize: '1.1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onClick={handleBuyNow} disabled={!selectedDosage || selectedDosage.stock === 0}>
                            <CreditCard size={20} /> Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetails;
