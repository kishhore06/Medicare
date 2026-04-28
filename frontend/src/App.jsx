import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import ManageMedicines from './pages/ManageMedicines';
import MedicineDetails from './pages/MedicineDetails';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <div className="container" style={{ padding: '2rem 20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/medicines/:id" element={<MedicineDetails />} />
          <Route path="/admin" element={user && user.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/medicines" element={user && user.role === 'ADMIN' ? <ManageMedicines /> : <Navigate to="/" />} />
          {/* Add more routes later */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
