import React, { useState } from 'react';
import { Activity, Check, CheckSquare, Square, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function SymptomForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const symptomOptions = ['Batuk Kering', 'Batuk Berdahak', 'Sesak Napas', 'Sakit Tenggorokan', 'Hidung Meler', 'Nyeri Dada', 'Demam'];

  const [form, setForm] = useState({ symptoms: [], notes: '' });
  const [geoLoc, setGeoLoc] = useState({ lat: null, lng: null });
  const [weatherCtx, setWeatherCtx] = useState(null);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setGeoLoc({ lat, lng });
            
            try {
                const res = await axios.get(`/api/aqi?lat=${lat}&lon=${lng}`);
                if (res.data.success) {
                    setWeatherCtx(res.data.data);
                }
            } catch (e) {
                console.warn('Gagal memuat cuaca dari server.');
            }
        },
        error => console.warn("Geolocation denied/failed", error)
      );
    }
  }, []);

  const handleCheck = (s) => {
    setForm(prev => {
      if (prev.symptoms.includes(s)) {
        return { ...prev, symptoms: prev.symptoms.filter(x => x !== s) };
      } else {
        return { ...prev, symptoms: [...prev.symptoms, s] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        symptoms: form.symptoms,
        notes: form.notes,
        log_date: new Date().toISOString(),
        location_lat: geoLoc.lat,
        location_long: geoLoc.lng,
        aqi_recorded: weatherCtx ? weatherCtx.current.air_quality['us-epa-index'] : null,
        location_name: weatherCtx ? `${weatherCtx.location.name}, ${weatherCtx.location.region}` : null
      };
      
      const token = localStorage.getItem('token');
      await axios.post('/api/symptoms', payload, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setLoading(false);
      setSuccess(true);
      setForm({ symptoms: [], notes: '' });
    } catch (error) {
      console.error('Gagal memanggil backend', error);
      alert('Gagal terkoneksi ke backend port 5000.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6" /> Log Gejala (ISPA)
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Daftarkan kendala medis pernapasan Anda untuk dievaluasi oleh sistem.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {success ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Data Tersimpan</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Keluhan berhasil dicatat ke sistem dengan aman.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
            >
              Kembali Ke Form
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Widget Cuaca & Konteks */}
            {weatherCtx && (
               <div className="bg-secondary/30 p-4 rounded-lg flex md:flex-row flex-col max-md:gap-4 items-center justify-between border border-border">
                  <div className="flex items-center gap-4">
                     <img src={weatherCtx.current.condition.icon} alt="cuaca" className="w-12 h-12 rounded-full bg-background/50" />
                     <div>
                        <div className="text-sm font-semibold text-foreground">
                            {weatherCtx.location.name}, {weatherCtx.location.region}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Suhu: {weatherCtx.current.temp_c}°C ({weatherCtx.current.condition.text})
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-sm text-foreground font-medium flex items-center justify-end gap-2">
                        AQI EPA: <span className="px-2 py-0.5 rounded text-white bg-foreground">{weatherCtx.current.air_quality['us-epa-index']} / 6</span>
                     </div>
                     <div className="text-xs text-muted-foreground mt-1 text-right">
                        PM2.5: {weatherCtx.current.air_quality.pm2_5} µg/m³
                     </div>
                  </div>
               </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Keluhan Saat Ini</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomOptions.map(s => {
                  const isActive = form.symptoms.includes(s);
                  return (
                    <div 
                      key={s} 
                      onClick={() => handleCheck(s)}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background hover:bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {isActive ? <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" /> : <Square className="w-4 h-4 mt-0.5 shrink-0" />}
                      <span className="text-sm font-medium leading-none mt-0.5 select-none">{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Keterangan Tambahan</label>
              <textarea 
                className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed min-h-[100px] resize-none"
                placeholder="Apakah Anda kesulitan bernapas di malam hari?"
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || form.symptoms.length === 0}
              className="w-full h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Catatan Medis'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
