import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Wind, AlertTriangle, CheckCircle, Info, Activity, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [mapLogs, setMapLogs] = useState([]);
  const [insights, setInsights] = useState({ count: 0, avgAqi: 0, recent: [] });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState({ lat: -6.8117, lng: 107.6175 }); // Default Lembang

  useEffect(() => {
    const loadData = async (lat, lng) => {
      try {
        const resAqi = axios.get(`/api/aqi?lat=${lat}&lon=${lng}`);
        const resMap = axios.get('/api/symptoms/map');
        const resInsights = axios.get('/api/symptoms/insights');
        const resStats = axios.get('/api/symptoms/stats');

        const [weather, map, insight, stats] = await Promise.all([resAqi, resMap, resInsights, resStats]);
        if (weather.data.success) setWeatherData(weather.data.data);
        if (map.data.success) setMapLogs(map.data.data);
        if (insight.data.success) setInsights({ count: insight.data.count, avgAqi: insight.data.avgAqi, recent: insight.data.recent });
        if (stats.data.success) {
          const formatted = stats.data.data.map(d => ({ name: `EPA ${d.aqi_recorded}`, total: parseInt(d.count) }));
          setChartData(formatted);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });
          loadData(lat, lng);
        },
        () => loadData(userLoc.lat, userLoc.lng) // fallback default Lembang
      );
    } else {
      loadData(userLoc.lat, userLoc.lng);
    }
  }, []);

  const getAqiStatus = (usEpa) => {
    // Berdasarkan US-EPA Index dari WeatherAPI (1-6)
    if (usEpa <= 2) return { label: 'Baik', color: 'text-aqi-good', bg: 'bg-aqi-good/10', border: 'border-aqi-good/20' };
    if (usEpa <= 3) return { label: 'Sedang', color: 'text-aqi-moderate', bg: 'bg-aqi-moderate/10', border: 'border-aqi-moderate/20' };
    return { label: 'Tidak Sehat', color: 'text-aqi-unhealthyBg', bg: 'bg-aqi-unhealthyBg/10', border: 'border-aqi-unhealthyBg/20' };
  };

  const getSymptomColor = (symptomsArr) => {
    if (symptomsArr.includes('Sesak Napas') || symptomsArr.includes('Nyeri Dada')) return 'rgb(220 38 38)'; // Destructive red
    if (symptomsArr.includes('Demam')) return 'rgb(234 88 12)'; // Orange
    return 'rgb(234 179 8)'; // Yellow for mild
  };

  if (loading) {
    return <div className="text-muted-foreground animate-pulse flex space-x-4">Loading Dashboard Data...</div>;
  }

  const aqiValue = weatherData?.current?.air_quality?.pm2_5 ? Math.round(weatherData.current.air_quality.pm2_5) : 0;
  const usEpa = weatherData?.current?.air_quality?.['us-epa-index'] || 1;
  const status = getAqiStatus(usEpa);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pemantauan ISPA & Kualitas Udara By Moh Ilyas NRP 152023193</h1>
        <p className="text-muted-foreground mt-1">
          Data real-time PM2.5 dan sebaran laporan gejala medis.
          (Lokasi: {weatherData?.location?.name}, {weatherData?.location?.region})
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Minimalist AQI Card */}
        <div className={`bg-card rounded-xl p-8 flex flex-col justify-center items-center text-center border-2 ${status.border} shadow-sm overflow-hidden`}>
          <Wind className={`w-8 h-8 mb-4 ${status.color}`} />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aktual PM2.5</h2>
          <div className="text-6xl font-bold tracking-tighter my-2 text-foreground">
            {aqiValue}
          </div>
          <div className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </div>
        </div>

        {/* Info Card */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-8 flex flex-col justify-center shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-foreground">
            <Info className="w-4 h-4 text-muted-foreground" /> Area Terdampak
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Peta interaktif menampilkan penyebaran warga yang melapor keluhan ISPA (berbasis geolokasi). Perhatikan zona merah intensif.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg text-sm text-foreground">
              <div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0"></div> <span className="font-medium">Ringan:</span> Batuk, hidung meler, sakit tenggorokan.
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg text-sm text-foreground">
              <div className="w-3 h-3 rounded-full bg-orange-600 shrink-0"></div> <span className="font-medium">Sedang:</span> Disertai demam panjang.
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg text-sm text-foreground">
              <div className="w-3 h-3 rounded-full bg-red-600 shrink-0"></div> <span className="font-medium">Berat:</span> Sesak napas kritis / Nyeri Dada terdeteksi.
            </div>
          </div>
        </div>
      </div>

      {/* Map Interactive Section */}
      <div className="bg-card rounded-xl border border-border p-1 overflow-hidden shadow-sm h-[400px]">
        {/* We focus somewhere near the seeders: Dago */}
        <MapContainer center={[-6.895, 107.625]} zoom={14} scrollWheelZoom={false} className="w-full h-full rounded-lg z-10">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={[userLoc.lat, userLoc.lng]}>
            <Popup>
              <div className="font-bold text-xs uppercase text-foreground">Lokasi Visualisasi Cuaca ({weatherData?.location?.name || 'Saat Ini'})</div>
            </Popup>
          </Marker>

          {/* Plotting User ISPA Data */}
          {mapLogs.map((log) => {
            const pos = [parseFloat(log.location_lat), parseFloat(log.location_long)];
            const colorHex = getSymptomColor(log.symptoms);
            return (
              <CircleMarker
                key={log.id}
                center={pos}
                radius={5}
                pathOptions={{ color: colorHex, fillColor: colorHex, fillOpacity: 0.6, weight: 1 }}
              >
                <Popup>
                  <div className="text-sm font-semibold mb-1">Kasus ISPA:</div>
                  <ul className="text-xs list-disc pl-3 text-muted-foreground">
                    {log.symptoms.map(s => <li key={s}>{s}</li>)}
                  </ul>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      {/* Insights Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-foreground">
          <Activity className="w-5 h-5" /> Live Insights ({insights.count} Total Pelaporan, Rata-rata Udara: EPA {insights.avgAqi}/6)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.recent.map((item, i) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                  <span>{new Date(item.log_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="font-semibold px-2 rounded bg-secondary">Kasus #{item.id}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.symptoms.map(s => (
                    <span key={s} className="bg-destructive/10 text-destructive text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              {item.aqi_recorded && (
                <div className="text-xs font-medium border-t border-border mt-2 pt-2 text-foreground">
                  Tercatat pada AQI EPA: <span className="p-0.5 rounded bg-foreground text-background">{item.aqi_recorded}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visualisasi Data Bar Chart */}
      {chartData.length > 0 && (
        <div className="mt-8 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-foreground">
            <BarChart2 className="w-5 h-5 text-primary" /> Visualisasi Demografi Polusi (AQI) Pasien
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} name="Jumlah Pelapor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
