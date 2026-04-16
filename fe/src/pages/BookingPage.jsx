import React, { useState } from 'react';
import { UploadCloud, Building2, MapPin, File, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function BookingPage() {
  const [file, setFile] = useState(null);
  const [clinic, setClinic] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [clinics, setClinics] = useState([]);

  React.useEffect(() => {
     axios.get('http://localhost:5000/api/clinics')
       .then(res => {
         if (res.data.success) {
           setClinics(res.data.data);
         }
       })
       .catch(err => console.error("Gagal memuat daftar klinik"));
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('clinic_id', clinic);
      formData.append('ktpFile', file);
      formData.append('booking_date', bookingDate ? new Date(bookingDate).toISOString() : new Date().toISOString());

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings', formData, {
         headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
         }
      });

      setLoading(false);
      setSuccess(true);
    } catch (error) {
      console.error('Error menghubungkan ke API:', error);
      alert('Gagal menyambungkan ke backend. Pastikan server Node.js di post 5000 berjalan dan database siap.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6" /> Registrasi Booking
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Buat jadwal temu medik dengan mengunggah persyaratan (KTP/Resep).</p>
      </div>

      {success ? (
         <div className="bg-card border border-border rounded-xl p-10 text-center shadow-sm">
             <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center rounded-full mx-auto mb-4">
               <File className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold text-foreground">File Terupload SecureS3!</h2>
             <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">Reservasi berhasil dikirim. File anda telah terunggah ke AWS S3 bucket.</p>
             <button 
                 onClick={() => { setSuccess(false); setFile(null); setClinic(''); }}
                 className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
             >
                 Reservasi Baru
             </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Pilih Faskes
              </h3>
            </div>
            <div className="space-y-2">
              {clinics.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setClinic(c.id)}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${clinic === c.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-secondary/30'}`}
                >
                  <h4 className="text-sm font-semibold text-foreground">{c.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{c.address}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Waktu & Berkas Persyaratan (KTP/Resep)</h3>
            <div className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
              
              <div className="space-y-2 mb-4">
                 <label className="text-sm font-medium text-muted-foreground block">Tanggal Kunjungan</label>
                 <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                 />
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-muted-foreground bg-background hover:bg-secondary/10 transition-colors rounded-lg cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  {file ? (
                     <div className="flex flex-col items-center text-primary">
                         <File className="w-6 h-6 mb-2" />
                         <span className="text-sm font-medium">{file.name}</span>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center text-muted-foreground">
                        <UploadCloud className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Klik untuk telusuri PDF / JPG</span>
                     </div>
                  )}
              </label>

              <button 
                type="submit"
                disabled={!clinic || !file || loading}
                className="w-full h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi & Konfirmasi"}
              </button>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}
