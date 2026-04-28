import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ManageMedicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'ORAL',
        manufacturer: '',
        requiresPrescription: false,
        dosages: [{ dosageForm: '', price: 0, stock: 0 }]
    });

    const fetchMedicines = async () => {
        try {
            const res = await api.get('/medicines/public');
            setMedicines(res.data);
        } catch (error) {
            console.error("Failed to fetch medicines", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchMedicines();
        }
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Access Denied. Admins only.</div>;
    }

    const handleDosageChange = (index, field, value) => {
        const updatedDosages = [...formData.dosages];
        updatedDosages[index][field] = value;
        setFormData({ ...formData, dosages: updatedDosages });
    };

    const addDosageField = () => {
        setFormData({ ...formData, dosages: [...formData.dosages, { dosageForm: '', price: 0, stock: 0 }] });
    };

    const removeDosageField = (index) => {
        const updatedDosages = formData.dosages.filter((_, i) => i !== index);
        setFormData({ ...formData, dosages: updatedDosages });
    };

    const openModalForAdd = () => {
        setEditingId(null);
        setFormData({
            name: '', description: '', category: 'ORAL', manufacturer: '', requiresPrescription: false,
            dosages: [{ dosageForm: '', price: 0, stock: 0 }]
        });
        setShowModal(true);
    };

    const openModalForEdit = (medicine) => {
        setEditingId(medicine.id);
        setFormData({
            name: medicine.name,
            description: medicine.description,
            category: medicine.category,
            manufacturer: medicine.manufacturer,
            requiresPrescription: medicine.requiresPrescription,
            dosages: medicine.dosages ? medicine.dosages.map(d => ({ dosageForm: d.dosageForm, price: d.price, stock: d.stock })) : []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this medicine?")) {
            try {
                await api.delete(`/medicines/admin/${id}`);
                setMedicines(medicines.filter(m => m.id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Could not delete medicine. It might be linked to existing orders.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/medicines/admin/${editingId}`, formData);
            } else {
                await api.post('/medicines/admin', formData);
            }
            setShowModal(false);
            fetchMedicines();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save medicine");
        }
    };

    return (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary-color)' }}>Manage Medicines</h2>
                <button className="btn btn-primary" onClick={openModalForAdd} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Plus size={18} /> Add Medicine
                </button>
            </div>

            {loading ? <div className="spinner"></div> : (
                <div className="card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '0.75rem' }}>Name</th>
                                <th style={{ padding: '0.75rem' }}>Category</th>
                                <th style={{ padding: '0.75rem' }}>Stock</th>
                                <th style={{ padding: '0.75rem' }}>Rx Req</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.map(medicine => {
                                const totalStock = medicine.dosages?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
                                return (
                                    <tr key={medicine.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{medicine.name}</td>
                                        <td style={{ padding: '0.75rem' }}><span className="badge badge-primary">{medicine.category}</span></td>
                                        <td style={{ padding: '0.75rem' }}>{totalStock} units</td>
                                        <td style={{ padding: '0.75rem' }}>{medicine.requiresPrescription ? 'Yes' : 'No'}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }} onClick={() => openModalForEdit(medicine)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(medicine.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, overflowY: 'auto', padding: '2rem 1rem', display: 'flex' }}>
                    <div className="card glass" style={{ width: '100%', maxWidth: '600px', margin: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
                        <h3 style={{ marginBottom: '1.5rem', flexShrink: 0 }}>{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                        <div style={{ overflowY: 'auto', paddingRight: '0.5rem', flexGrow: 1 }}>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2">
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                            <option value="ORAL">Oral</option>
                                            <option value="TOPICAL">Topical</option>
                                            <option value="PARENTERAL">Parenteral</option>
                                            <option value="INHALED">Inhaled</option>
                                            <option value="TRANSDERMAL">Transdermal</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows="3" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="form-group">
                                        <label className="form-label">Manufacturer</label>
                                        <input type="text" className="form-input" required value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '2rem' }}>
                                        <input type="checkbox" id="rxReq" checked={formData.requiresPrescription} onChange={(e) => setFormData({...formData, requiresPrescription: e.target.checked})} />
                                        <label htmlFor="rxReq" style={{ marginLeft: '0.5rem', fontWeight: 500 }}>Requires Prescription</label>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                                    <h4>Dosages</h4>
                                    <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={addDosageField}>Add Dosage</button>
                                </div>

                                {formData.dosages.map((dosage, index) => (
                                    <div key={index} className="grid grid-cols-4" style={{ gap: '0.5rem', marginBottom: '1rem', alignItems: 'end' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Form (e.g., 500mg Tablet)</label>
                                            <input type="text" className="form-input" required value={dosage.dosageForm} onChange={(e) => handleDosageChange(index, 'dosageForm', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Price ($)</label>
                                            <input type="number" step="0.01" min="0" className="form-input" required value={dosage.price} onChange={(e) => handleDosageChange(index, 'price', e.target.value)} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ flexGrow: 1 }}>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Stock</label>
                                                <input type="number" min="0" className="form-input" required value={dosage.stock} onChange={(e) => handleDosageChange(index, 'stock', e.target.value)} />
                                            </div>
                                            {formData.dosages.length > 1 && (
                                                <button type="button" className="btn btn-danger" style={{ padding: '0.5rem', height: 'max-content' }} onClick={() => removeDosageField(index)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Medicine</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMedicines;
