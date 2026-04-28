import { useState, useEffect } from 'react';
import api from '../api';
import MedicineCard from '../components/MedicineCard';

const Home = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const fetchMedicines = async () => {
            setLoading(true);
            try {
                const url = categoryFilter ? `/medicines/public/category/${categoryFilter}` : '/medicines/public';
                const res = await api.get(url);
                setMedicines(res.data);
            } catch (error) {
                console.error("Failed to fetch medicines", error);
            }
            setLoading(false);
        };
        fetchMedicines();
    }, [categoryFilter]);

    return (
        <div>
            <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Welcome to MediCare</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Your trusted online pharmacy. Browse our extensive catalog of medicines and get them delivered right to your door.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Our Medicines</h2>
                <select 
                    className="form-select" 
                    style={{ width: 'auto' }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="ORAL">Oral</option>
                    <option value="TOPICAL">Topical</option>
                    <option value="PARENTERAL">Parenteral</option>
                    <option value="INHALED">Inhaled</option>
                    <option value="TRANSDERMAL">Transdermal</option>
                </select>
            </div>

            {loading ? (
                <div className="spinner"></div>
            ) : medicines.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No medicines found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-4">
                    {medicines.map((medicine) => (
                        <MedicineCard key={medicine.id} medicine={medicine} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
