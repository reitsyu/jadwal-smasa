import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { ScheduleItem, ParsedSchedule } from './types/schedule';
import './App.css';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function App() {
  const [scheduleData, setScheduleData] = useState<ParsedSchedule[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classList, setClassList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      // Uses Vite proxy (/api -> http://110.92.72.98:5002)
      const res = await fetch('/api/jadwal-info');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const rawData = await res.json();
      
      const arrayData: ScheduleItem[] = Array.isArray(rawData) ? rawData : rawData.data || [];
      
      const normalized: ParsedSchedule[] = arrayData.map((item) => ({
        kelas: item.kelas || item.class_name || 'Umum',
        hari: item.hari || item.day || 'Senin',
        jam_ke: String(item.jam_ke || item.period || '1'),
        mapel: item.mapel || item.subject || '-',
        guru: item.guru || item.teacher || '-',
        ruang: item.ruang || '',
      }));

      setScheduleData(normalized);

      // Extract unique sorted classes
      const uniqueClasses = Array.from(new Set(normalized.map((item) => item.kelas))).sort();
      setClassList(uniqueClasses);
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Gagal mengambil data jadwal dari server.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPNG = async () => {
    if (!scheduleRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 3, // High-resolution render
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Jadwal_SMASA_${selectedClass || 'Lengkap'}.png`;
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor gambar.');
    } finally {
      setExporting(false);
    }
  };

  const filteredSchedule = scheduleData.filter((item) => item.kelas === selectedClass);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">
          <span className="material-symbols-outlined icon">calendar_month</span>
          <h1>JADWAL SMASA</h1>
        </div>
        
        <div className="controls">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading || classList.length === 0}
          >
            {classList.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <button onClick={fetchSchedule} className="btn-secondary" disabled={loading}>
            <span className="material-symbols-outlined">refresh</span> Refresh
          </button>

          <button onClick={exportToPNG} className="btn-primary" disabled={loading || exporting}>
            <span className="material-symbols-outlined">download</span> {exporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </header>

      {loading && <div className="status-msg">Memuat data jadwal...</div>}
      {error && <div className="status-msg error">{error}</div>}

      {!loading && !error && (
        <main className="schedule-card" ref={scheduleRef}>
          <div className="card-header">
            <h2>SMA Negeri 1 Lumajang</h2>
            <h3>Kelas: {selectedClass || 'Pilih Kelas'}</h3>
          </div>

          <div className="days-grid">
            {DAYS.map((day) => {
              const dayItems = filteredSchedule.filter(
                (i) => i.hari.toLowerCase() === day.toLowerCase()
              );
              return (
                <div key={day} className="day-column">
                  <div className="day-header">{day}</div>
                  <div className="subjects-list">
                    {dayItems.length === 0 ? (
                      <div className="no-class">-</div>
                    ) : (
                      dayItems.map((item, idx) => (
                        <div key={idx} className="subject-box">
                          <span className="period-badge">Jam ke-{item.jam_ke}</span>
                          <div className="mapel-title">{item.mapel}</div>
                          <div className="guru-name">{item.guru}</div>
                          {item.ruang && <div className="ruang-tag">{item.ruang}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}
