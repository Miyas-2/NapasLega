import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, FileText, Calendar, Building, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({ meta, setPage, limit, setLimit }) => {
  if (!meta) return null;
  
  return (
    <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Tampilkan:</span>
        <select 
          className="bg-background border border-input text-sm rounded-md px-2 py-1 focus:outline-none"
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={100}>Semua</option>
        </select>
        <span className="text-sm text-muted-foreground hidden sm:inline">dari total {meta.total} data</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={meta.page <= 1}
          className="p-1.5 rounded-md border border-input bg-background hover:bg-secondary disabled:opacity-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground px-2">
          Halaman {meta.page} / {meta.totalPages || 1}
        </span>
        <button 
          onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
          disabled={meta.page >= meta.totalPages}
          className="p-1.5 rounded-md border border-input bg-background hover:bg-secondary disabled:opacity-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const [symptoms, setSymptoms] = useState([]);
  const [symptomMeta, setSymptomMeta] = useState(null);
  const [sympPage, setSympPage] = useState(1);
  const [sympLimit, setSympLimit] = useState(5);

  const [bookings, setBookings] = useState([]);
  const [bookingMeta, setBookingMeta] = useState(null);
  const [bookPage, setBookPage] = useState(1);
  const [bookLimit, setBookLimit] = useState(5);

  const [loading, setLoading] = useState(true);

  // Fetch Symptoms
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/symptoms/history?page=${sympPage}&limit=${sympLimit}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
           setSymptoms(res.data.data);
           setSymptomMeta(res.data.meta);
        }
      } catch (err) { console.error("Symptom fetch error", err); }
    };
    fetchSymptoms();
  }, [sympPage, sympLimit]);

  // Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/bookings/history?page=${bookPage}&limit=${bookLimit}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
           setBookings(res.data.data);
           setBookingMeta(res.data.meta);
        }
      } catch (err) { console.error("Booking fetch error", err); }
    };
    fetchBookings();
  }, [bookPage, bookLimit]);

  // Handle first load delay simulation removal
  useEffect(() => { setLoading(false); }, []);

  if (loading) return <div className="text-muted-foreground animate-pulse">Memuat riwayat medis...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <History className="w-6 h-6" /> Riwayat Medis Saya
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Arsip seluruh rekam keluhan pernapasan dan pendaftaran klinik Anda.</p>
      </div>

      <div className="space-y-12">
        
        {/* Section Keluhan */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
            <FileText className="w-5 h-5 text-muted-foreground" /> Log Keluhan Gejala
          </h2>
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 bg-background rounded-md border border-border text-center">Belum ada riwayat keluhan yang tersimpan.</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {symptoms.map(log => (
                  <div key={log.id} className="bg-background border border-border p-4 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                     <div className="text-xs text-muted-foreground flex justify-between mb-2">
                         <span>{new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                         <span className="bg-secondary px-2 py-0.5 rounded-full">ID: #{log.id}</span>
                     </div>
                     <div className="flex flex-wrap gap-1 mb-3">
                         {log.symptoms.map(s => (
                            <span key={s} className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">{s}</span>
                         ))}
                     </div>
                     {log.aqi_recorded && (
                        <div className="bg-secondary/50 p-2 rounded text-xs mb-3 font-medium text-foreground border border-border inline-block mr-2">
                           Udara Sekitar: EPA {log.aqi_recorded}/6
                        </div>
                     )}
                     {log.location_name && (
                        <div className="bg-secondary/50 p-2 rounded text-xs mb-3 font-medium text-foreground border border-border inline-flex items-center gap-1">
                           📍 {log.location_name}
                        </div>
                     )}
                     {log.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 w-full">Catatan: {log.notes}</p>}
                  </div>
                ))}
              </div>
              <PaginationControls meta={symptomMeta} page={sympPage} setPage={setSympPage} limit={sympLimit} setLimit={setSympLimit} />
            </>
          )}
        </div>

        {/* Section Booking */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
            <Calendar className="w-5 h-5 text-muted-foreground" /> Reservasi Fasilitas Kesehatan
          </h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 bg-background rounded-md border border-border text-center">Belum ada riwayat reservasi klinik.</p>
          ) : (
            <>
              <div className="space-y-3">
                {bookings.map(book => (
                  <div key={book.id} className="bg-background border border-border p-4 rounded-xl flex max-sm:flex-col sm:items-center justify-between gap-4 shadow-sm hover:bg-secondary/20 transition-colors">
                      <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                             <Building className="w-4 h-4 text-muted-foreground" /> {book.Clinic?.name || 'Klinik Terhapus'}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> Tanggal Kunjungan: {new Date(book.booking_date).toLocaleString('id-ID')}
                          </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between max-sm:w-full gap-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${book.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                              {book.status}
                          </span>
                          {book.s3_photo_url && (
                            <a href={book.s3_photo_url} target="_blank" rel="noreferrer noopener" className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">
                              Lihat Dokumen
                            </a>
                          )}
                      </div>
                  </div>
                ))}
              </div>
              <PaginationControls meta={bookingMeta} page={bookPage} setPage={setBookPage} limit={bookLimit} setLimit={setBookLimit} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
