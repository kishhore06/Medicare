import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, User, Moon, Sun } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <nav className="navbar glass">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <span style={{color: 'var(--primary-color)'}}>Medi</span>Care
                </Link>

                <div className="nav-links">
                    <Link to="/" className="nav-link">Medicines</Link>
                    
                    {user && user.role === 'ADMIN' && (
                        <Link to="/admin" className="nav-link">Dashboard</Link>
                    )}

                    <button onClick={() => setDarkMode(!darkMode)} className="btn btn-outline" style={{padding: '0.25rem 0.5rem', border: 'none'}}>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <>
                            <Link to="/cart" className="nav-link" style={{position: 'relative'}}>
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-8px', right: '-8px', 
                                        backgroundColor: 'var(--danger-color)', color: 'white', 
                                        borderRadius: '50%', width: '20px', height: '20px', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem'}}>
                                <User size={20} color="var(--primary-color)" />
                                <span style={{fontWeight: 500}}>{user.name}</span>
                            </div>
                            <button onClick={handleLogout} className="btn" style={{color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
