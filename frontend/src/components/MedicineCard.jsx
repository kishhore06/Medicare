import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Pill, Activity, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MedicineCard = ({ medicine }) => {
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const lowestPriceDosage = medicine.dosages?.reduce((prev, curr) => 
        (curr.price < prev.price ? curr : prev), medicine.dosages[0]);

    return (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', color: 'var(--primary-color)' }}>
                    {medicine.category === 'ORAL' ? <Pill size={32} /> : 
                     medicine.category === 'TOPICAL' ? <Activity size={32} /> : <Stethoscope size={32} />}
                </div>
                <span className={`badge ${medicine.requiresPrescription ? 'badge-danger' : 'badge-success'}`}>
                    {medicine.requiresPrescription ? 'Rx Required' : 'OTC'}
                </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{medicine.name}</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1 }}>{medicine.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Starting from</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        ${lowestPriceDosage?.price.toFixed(2)}
                    </div>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/medicines/${medicine.id}`)}
                >
                    View Options
                </button>
            </div>
        </div>
    );
};

export default MedicineCard;
