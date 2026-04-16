import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register', form);
      if (res.data.success) {
        alert('Registrasi sukses! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-foreground text-background">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-foreground uppercase tracking-wider mb-2">Daftar Akun</h2>
        <p className="text-center text-muted-foreground text-sm mb-6">Bergabung dengan platform NapasLega</p>
        
        {error && <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-10 px-4 py-2 mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat Akun'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun? <Link to="/login" className="text-foreground font-semibold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
