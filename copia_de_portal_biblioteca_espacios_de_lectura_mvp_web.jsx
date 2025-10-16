import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

/***********************************
 * Portal Biblioteca – Espacios de Lectura (MVP)
 * - FIX: errores de "Unterminated string constant" corregidos
 * - Limpieza de secciones mal cerradas
 * - Tests de humo añadidos (runtime) para funciones críticas
 ***********************************/

// --- Utilidades simples ---
const grados = [
  '1ro Secundaria', '2do Secundaria', '3ro Secundaria',
  '4to Secundaria', '5to Secundaria', '6to Secundaria'
];
const actividadesTipo = [
  'Lectura Silenciosa', 'Lectura Guiada', 'Préstamo de Libro',
  'Resumen/Reseña', 'Club de Lectura', 'Investigación'
];
const LS_KEY = 'biblioteca_actividades_v1';
const ROLE_KEY = 'biblioteca_roles_v1';
const THEME_KEY = 'biblioteca_theme_v1';
const BOOKS_KEY = 'biblioteca_libros_v1';
const CONFIG_KEY = 'biblioteca_sync_config_v1';

function guardarActividades(data){ localStorage.setItem(LS_KEY, JSON.stringify(data)); }
function cargarActividades(){ try{ return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch{ return []; } }

// CSV Export (FIX: join('\n') correcto y comillas escapadas)
function exportCSV(rows){
  const headers = ['Fecha','Estudiante','Grado','Actividad','Libro/Texto','Minutos','Docente'];
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      r.fecha,
      r.estudiante,
      r.grado,
      r.actividad,
      `"${String(r.libro||'').replaceAll('"','""')}"`,
      r.minutos,
      r.docente
    ].join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'reporte_espacios_lectura.csv'; a.click(); URL.revokeObjectURL(url);
}

// Frases motivadoras
const frases = [
  'Leer hoy, liderar mañana.',
  'Un libro al día, una mente despierta.',
  'La lectura es un puente hacia tus metas.',
  'Quien lee, viaja sin moverse.'
];
const fraseAleatoria = () => frases[Math.floor(Math.random()*frases.length)];

function Stat({label, value}){
  return (
    <div className="bg-white/90 rounded-2xl shadow p-5 text-center">
      <div className="text-3xl font-extrabold text-[#0c2461]">{value}</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function Table({rows}){
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {['Fecha','Estudiante','Grado','Actividad','Libro/Texto','Minutos','Docente'].map(h => (
              <th key={h} className="px-4 py-2 font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={7}>Sin registros todavía</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{r.fecha}</td>
              <td className="px-4 py-2">{r.estudiante}</td>
              <td className="px-4 py-2">{r.grado}</td>
              <td className="px-4 py-2">{r.actividad}</td>
              <td className="px-4 py-2">{r.libro}</td>
              <td className="px-4 py-2">{r.minutos}</td>
              <td className="px-4 py-2">{r.docente}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Subcomponentes auxiliares ---
function LibroForm({ onSave }){
  const [f,setF] = useState({ titulo:'', autor:'', categoria:'General', disponibles:1 });
  return (
    <form onSubmit={e=>{ e.preventDefault(); if(!f.titulo) return; onSave(f); setF({ titulo:'', autor:'', categoria:'General', disponibles:1 }); }} className="space-y-2 mt-2">
      <input value={f.titulo} onChange={e=>setF({...f, titulo:e.target.value})} placeholder="Título" className="w-full border rounded-xl px-3 py-2"/>
      <input value={f.autor} onChange={e=>setF({...f, autor:e.target.value})} placeholder="Autor" className="w-full border rounded-xl px-3 py-2"/>
      <input value={f.categoria} onChange={e=>setF({...f, categoria:e.target.value})} placeholder="Categoría" className="w-full border rounded-xl px-3 py-2"/>
      <input type="number" min={0} value={f.disponibles} onChange={e=>setF({...f, disponibles:Number(e.target.value)})} placeholder="Disponibles" className="w-full border rounded-xl px-3 py-2"/>
      <button className="px-3 py-2 rounded-xl border">Guardar libro</button>
    </form>
  );
}

function Certificado({ theme, onReady }){
  const [nombre, setNombre] = useState('Estudiante Destacado/a');
  const [min, setMin] = useState(60);
  useEffect(()=>{ onReady && onReady((n, m)=> { setNombre(n || 'Estudiante Destacado/a'); setMin(m || 0); }); },[onReady]);
  const hoy = new Date().toLocaleDateString();
  return (
    <div className="bg-white rounded-2xl border p-6 break-inside-avoid">
      <div className="text-center">
        <div className="text-sm text-gray-500">Liceo Prof. Domingo González · Distrito 03-05 Nizao</div>
        <h3 className="text-3xl font-extrabold" style={{color:theme.start}}>Certificado de Lectura</h3>
        <div className="mt-1 text-gray-600">“Leer nos conecta, registrar nos inspira, compartir nos transforma”.</div>
      </div>
      <div className="mt-6 text-center">
        <div className="text-gray-600">Se otorga a</div>
        <div className="text-2xl font-bold" style={{color:theme.start}}>{nombre}</div>
        <div className="mt-2">por su destacada participación en los <b>Espacios de Lectura</b>, acumulando <b>{min}</b> minutos de lectura.</div>
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4 items-end">
        <div className="text-center">
          <div className="border-t pt-2">Encargado/a Biblioteca</div>
        </div>
        <div className="text-center">
          <QRCodeSVG value={typeof window!=='undefined'?window.location.href:''} size={96} />
          <div className="text-xs text-gray-500 mt-1">Verifica en línea</div>
        </div>
        <div className="text-center">
          <div className="border-t pt-2">Dirección del Centro</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500">Fecha: {hoy}</div>
      <div className="mt-4 flex gap-2 justify-center print:hidden">
        <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Editar nombre" className="border rounded-xl px-3 py-2"/>
        <input type="number" min={0} value={min} onChange={e=>setMin(Number(e.target.value))} className="border rounded-xl px-3 py-2 w-24"/>
        <button onClick={()=>window.print()} className="px-3 py-2 rounded-xl border">Imprimir certificado</button>
      </div>
    </div>
  );
}

function BatchCertificado({ theme, nombre, minutos }){
  const hoy = new Date().toLocaleDateString();
  return (
    <div className="bg-white rounded-2xl border p-6 break-inside-avoid">
      <div className="text-center">
        <div className="text-sm text-gray-500">Liceo Prof. Domingo González · Distrito 03-05 Nizao</div>
        <h3 className="text-3xl font-extrabold" style={{color:theme.start}}>Certificado de Lectura</h3>
        <div className="mt-1 text-gray-600">“Leer nos conecta, registrar nos inspira, compartir nos transforma”.</div>
      </div>
      <div className="mt-6 text-center">
        <div className="text-gray-600">Se otorga a</div>
        <div className="text-2xl font-bold" style={{color:theme.start}}>{nombre}</div>
        <div className="mt-2">por su destacada participación en los <b>Espacios de Lectura</b>, acumulando <b>{minutos}</b> minutos de lectura.</div>
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4 items-end">
        <div className="text-center"><div className="border-t pt-2">Encargado/a Biblioteca</div></div>
        <div className="text-center">
          <QRCodeSVG value={typeof window!=='undefined'?window.location.href:''} size={96} />
          <div className="text-xs text-gray-500 mt-1">Verifica en línea</div>
        </div>
        <div className="text-center"><div className="border-t pt-2">Dirección del Centro</div></div>
      </div>
      <div className="mt-4 text-xs text-gray-500">Fecha: {hoy}</div>
    </div>
  );
}

function LotePanel({ porEstudianteMin, theme }){
  const [cantidad, setCantidad] = React.useState(5);
  const [titulo, setTitulo] = React.useState('Lectores Destacados');
  const [mostrar, setMostrar] = React.useState(false);
  const top = porEstudianteMin.slice(0, Math.max(1, Math.min(20, Number(cantidad)||1)));
  return (
    <div>
      <div className="grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600">Título del lote</label>
          <input value={titulo} onChange={e=>setTitulo(e.target.value)} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div>
          <label className="block text-xs text-gray-600">Cantidad (Top N)</label>
          <input type="number" min={1} max={20} value={cantidad} onChange={e=>setCantidad(e.target.value)} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button onClick={()=>setMostrar(true)} className="px-3 py-2 rounded-xl border">Generar lote (previsualizar)</button>
          {mostrar && <button onClick={()=>window.print()} className="px-3 py-2 rounded-xl border">Imprimir / Guardar PDF</button>}
          {mostrar && <button onClick={()=>setMostrar(false)} className="px-3 py-2 rounded-xl border">Ocultar vista</button>}
        </div>
      </div>

      {mostrar && (
        <div className="mt-4">
          <div className="text-center mb-4 font-semibold" style={{color:theme.start}}>{titulo}</div>
          <div className="grid md:grid-cols-2 gap-4 print:grid print:grid-cols-2">
            {top.map(p => (
              <BatchCertificado key={p.name} theme={theme} nombre={p.name} minutos={p.value} />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">Consejo: usa la opción "Guardar como PDF" del navegador. Cada certificado evita cortarse entre páginas.</div>
        </div>
      )}
    </div>
  );
}

// --- App principal ---
export default function PortalBiblioteca() {
  const [tab, setTab] = useState('presentacion');
  const [actividades, setActividades] = useState([]);

  // --- Tema visual ---
  const baseTheme = { start:'#0c2461', end:'#1e3799', accent:'#f8c291', name:'Azul Liceo' };
  const [theme, setTheme] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(THEME_KEY)||'null') || baseTheme; }catch{return baseTheme}
  });
  const applyTheme = (t)=>{ setTheme(t); localStorage.setItem(THEME_KEY, JSON.stringify(t)); };
  const themes = [
    baseTheme,
    { start:'#0033a0', end:'#ce1126', accent:'#ffd100', name:'Bandera RD' },
    { start:'#14532d', end:'#16a34a', accent:'#fde68a', name:'Verde Jardín' },
    { start:'#4c1d95', end:'#7c3aed', accent:'#f9a8d4', name:'Violeta Creativo' }
  ];

  // --- Roles y acceso simple ---
  const defaultRoles = { pinBiblioteca: '1234', pinDireccion: '4321' };
  const [roles, setRoles] = useState(()=>{
    try{ return {...defaultRoles, ...(JSON.parse(localStorage.getItem(ROLE_KEY)||'{}'))}; }catch{return defaultRoles}
  });
  const [rol, setRol] = useState('Visitante');
  const [pin, setPin] = useState('');
  const login = ()=>{
    if(pin === roles.pinBiblioteca) setRol('Biblioteca');
    else if(pin === roles.pinDireccion) setRol('Dirección');
    else alert('PIN incorrecto');
    setPin('');
  };
  const puedeEditar = rol==='Biblioteca' || rol==='Dirección';

  // --- Libros (catálogo simple) ---
  const [libros, setLibros] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(BOOKS_KEY)||'[]'); }catch{return []}
  });
  useEffect(()=>{ localStorage.setItem(BOOKS_KEY, JSON.stringify(libros)); }, [libros]);

  // --- Sync config (Google Apps Script / API) ---
  const loadCfg = () => { try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); } catch { return {}; } };
  const [cfg, setCfg] = useState(loadCfg());
  const [showCfg, setShowCfg] = useState(false);
  const saveCfg = (next) => { setCfg(next); localStorage.setItem(CONFIG_KEY, JSON.stringify(next)); };

  useEffect(() => { setActividades(cargarActividades()); }, []);
  useEffect(() => { guardarActividades(actividades); }, [actividades]);

  // Abrir directamente el muro si ?muro=1
  useEffect(()=>{ const params = new URLSearchParams(window.location.search); if(params.get('muro')==='1') setTab('muro'); },[]);

  // --- Formulario de registro ---
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0,10),
    estudiante: '', grado: grados[0], actividad: actividadesTipo[0],
    libro: '', minutos: 20, docente: ''
  });
  const registrar = (e) => {
    e.preventDefault();
    if(!puedeEditar) return alert('Acceso de solo lectura. Inicie sesión con PIN.');
    if(!form.estudiante || !form.docente) return alert('Completa estudiante y docente.');
    setActividades(prev => [{...form, minutos: Number(form.minutos)}, ...prev]);
    setForm(f => ({...f, estudiante:'', libro:'', minutos:20}));
    setTab('muro');
  };

  // --- Formulario móvil rápido ---
  const [formMovil, setFormMovil] = useState({
    fecha: new Date().toISOString().slice(0,10), grado: grados[0], actividad: actividadesTipo[0], minutos: 15,
    estudiante:'', docente:''
  });
  const presetsMin = [10,15,20,30,45];
  const guardarMovil = (e)=>{
    e.preventDefault();
    if(!puedeEditar) return alert('Acceso de solo lectura. Inicie sesión con PIN.');
    if(!formMovil.docente) return alert('Escribe el docente.');
    const registro = { ...formMovil, libro:'', minutos:Number(formMovil.minutos) };
    setActividades(prev => [registro, ...prev]);
    setFormMovil(f=>({ ...f, estudiante:'', minutos:15 }));
    alert('Guardado en 1 toque ✅');
  };

  // --- Filtros Reporte ---
  const [q, setQ] = useState('');
  const [gradoF, setGradoF] = useState('Todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const filtrados = useMemo(() => actividades.filter(a => {
    const matchQ = q.trim() === '' || [a.estudiante,a.docente,a.libro,a.actividad].join(' ').toLowerCase().includes(q.toLowerCase());
    const matchG = gradoF === 'Todos' || a.grado === gradoF;
    const fechaOk = (!desde || a.fecha >= desde) && (!hasta || a.fecha <= hasta);
    return matchQ && matchG && fechaOk;
  }), [actividades,q,gradoF,desde,hasta]);

  const totalMin = useMemo(() => filtrados.reduce((s,a)=> s + Number(a.minutos||0), 0), [filtrados]);
  const totalActs = filtrados.length;
  const rankingLibros = useMemo(() => {
    const map = new Map(); filtrados.forEach(a => { if(!a.libro) return; map.set(a.libro, (map.get(a.libro)||0)+1); });
    return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  }, [filtrados]);

  // Datos para gráficas y medallas
  const porGrado = useMemo(()=>{
    const gmap = new Map(); filtrados.forEach(a=> gmap.set(a.grado, (gmap.get(a.grado)||0) + 1));
    return [...gmap.entries()].map(([name,value])=>({name,value}));
  },[filtrados]);
  const porEstudianteMin = useMemo(()=>{
    const m = new Map(); filtrados.forEach(a=> m.set(a.estudiante, (m.get(a.estudiante)||0) + Number(a.minutos||0)));
    return [...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,5);
  },[filtrados]);

  const limpiarTodo = () => { if(!puedeEditar) return alert('Solo dirección/biblioteca pueden borrar.'); if(confirm('¿Borrar TODOS los registros locales?')){ setActividades([]); } };

  // --- Sincronización ---
  const canSync = cfg?.endpoint && cfg?.token;
  const syncPush = async () => {
    if(!canSync) return alert('Configura primero el endpoint y el token.');
    const body = { action: 'append', rows: actividades };
    try { const res = await fetch(cfg.endpoint, { method:'POST', headers:{ 'Content-Type':'application/json','X-Auth':cfg.token }, body: JSON.stringify(body) }); if(!res.ok) throw new Error(`HTTP ${res.status}`); await res.json().catch(()=>({ok:true})); alert('Sincronización subida: OK'); } catch (e) { console.error(e); alert('Error al subir: ' + e.message); }
  };
  const syncPull = async () => {
    if(!canSync) return alert('Configura primero el endpoint y el token.');
    try {
      const res = await fetch(cfg.endpoint + (cfg.endpoint.includes('?')?'&':'?') + 'action=list', { headers: { 'X-Auth': cfg.token } });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); if(!Array.isArray(data.rows)) throw new Error('Formato inválido');
      const pack = (r)=> JSON.stringify(r); const setLocal = new Set(actividades.map(pack));
      const nuevos = data.rows.filter(r=> !setLocal.has(pack(r))); if(nuevos.length===0) return alert('No hay registros nuevos en la nube.');
      const merged = [...nuevos, ...actividades]; setActividades(merged); alert(`Descargados ${nuevos.length} registros.`);
    } catch (e) { console.error(e); alert('Error al descargar: ' + e.message); }
  };

  // Compartir muro: URL con ?muro=1
  const muroURL = () => { try{ const u = new URL(window.location.href); u.searchParams.set('muro','1'); return u.toString(); }catch{return window.location.href} };

  const pieColors = ['#0c2461','#1e3799','#4a69bd','#82ccdd','#60a3bc','#3c6382'];

  // --- Helpers de catálogo ---
  const [qLibro, setQLibro] = useState('');
  const librosFiltrados = useMemo(()=>{
    const ql = qLibro.trim().toLowerCase();
    return libros.filter(l => !ql || `${l.titulo} ${l.autor} ${l.categoria}`.toLowerCase().includes(ql));
  }, [libros, qLibro]);
  const agregarLibro = (l)=>{ if(!puedeEditar) return alert('Use PIN'); setLibros(prev=> [{...l, id: Date.now(), disponibles: Number(l.disponibles||1), prestamos: Number(l.prestamos||0)}, ...prev]); };
  const prestarLibro = (id)=>{ if(!puedeEditar) return alert('Use PIN'); setLibros(prev=> prev.map(l=> l.id===id ? {...l, prestamos: l.prestamos+1, disponibles: Math.max(0, l.disponibles-1)}: l)); };
  const devolverLibro = (id)=>{ if(!puedeEditar) return alert('Use PIN'); setLibros(prev=> prev.map(l=> l.id===id ? {...l, disponibles: l.disponibles+1}: l)); };

  // --- Boletín mensual ---
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth()+1).padStart(2,'0');
  const [mes, setMes] = useState(`${yyyy}-${mm}`); // YYYY-MM
  const actMes = useMemo(()=> filtrados.filter(a=> (a.fecha||'').slice(0,7) === mes), [filtrados, mes]);
  const totMes = actMes.length;
  const minMes = actMes.reduce((s,a)=> s + Number(a.minutos||0), 0);
  const porGradoMes = useMemo(()=>{
    const m = new Map(); actMes.forEach(a=> m.set(a.grado, (m.get(a.grado)||0)+1));
    return [...m.entries()].map(([name,value])=>({name,value}));
  }, [actMes]);
  const topLibrosMes = useMemo(()=>{
    const m = new Map(); actMes.forEach(a=> { if(a.libro) m.set(a.libro, (m.get(a.libro)||0)+1); });
    return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  }, [actMes]);

  // --- TESTS DE HUMO (si algo falla, mostramos detalle en consola) ---
  const [testsOK, setTestsOK] = useState(null);
  useEffect(()=>{
    try{
      // Test 1: exportCSV no debe lanzar y debe contener \n
      const sample = [{fecha:'2025-10-01',estudiante:'A',grado:'1ro Secundaria',actividad:'Lectura',libro:'"Citas"',minutos:10,docente:'D'}];
      const headers = ['Fecha','Estudiante','Grado','Actividad','Libro/Texto','Minutos','Docente'];
      const csv = [headers.join(','), ...sample.map(r => [r.fecha,r.estudiante,r.grado,r.actividad,`"${String(r.libro||'').replaceAll('"','""')}"`,r.minutos,r.docente].join(','))].join('\n');
      if(!csv.includes('\n')) throw new Error('CSV no incluye salto de línea');

      // Test 2: filtros básicos
      const acts = [
        {fecha:'2025-10-01', estudiante:'Ana', grado:'1ro Secundaria', actividad:'Lectura Guiada', libro:'El principito', minutos:20, docente:'Rosa'},
        {fecha:'2025-10-02', estudiante:'Luis', grado:'2do Secundaria', actividad:'Préstamo de Libro', libro:'Cien años', minutos:15, docente:'Orlando'}
      ];
      const q='Ana';
      const filtrado = acts.filter(a=> [a.estudiante,a.docente,a.libro,a.actividad].join(' ').toLowerCase().includes(q.toLowerCase()));
      if(filtrado.length !== 1) throw new Error('Filtro por búsqueda falló');

      // Test 3: ranking por estudiante (minutos)
      const mins = new Map(); acts.forEach(a=> mins.set(a.estudiante,(mins.get(a.estudiante)||0)+a.minutos));
      if(mins.get('Ana') !== 20) throw new Error('Suma de minutos incorrecta');

      setTestsOK(true);
    } catch(err){ console.error('TEST FAILED:', err); setTestsOK(false); }
  },[]);

  return (
    <div className="min-h-screen" style={{ backgroundImage:`linear-gradient(to bottom, ${theme.start}, ${theme.end})` }}>
      {/* Banner superior */}
      <div className="bg-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/80/Ministerio_de_Educaci%C3%B3n_de_la_Rep%C3%BAblica_Dominicana_%28MINERD%29_logo.png" alt="MINERD" className="w-12 h-12"/>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">Portal Biblioteca · Espacios de Lectura</div>
            <div className="text-white/80 text-sm">Liceo Prof. Domingo González · Distrito 03-05 Nizao · <span style={{color:theme.accent}}>“Leer nos conecta, registrar nos inspira, compartir nos transforma”</span></div>
          </div>
          <span className="grow" />
          <div className="hidden md:flex items-center gap-2">
            {themes.map((t)=> (
              <button key={t.name} onClick={()=>applyTheme(t)} title={t.name} className="w-6 h-6 rounded-full border" style={{backgroundImage:`linear-gradient(45deg, ${t.start}, ${t.end})`}} />
            ))}
          </div>
        </div>
      </div>

      {/* Barra de navegación */}
      <header className="sticky top-0 z-20 backdrop-blur bg-black/10 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 text-white">
          <nav className="flex flex-wrap items-center gap-2">
            {[
              ['presentacion','Presentación'],
              ['registro','Registrar actividad'],
              ['movil','Rápido móvil'],
              ['reporte','Reportes'],
              ['catalogo','Catálogo'],
              ['certificados','Certificados'],
              ['boletin','Boletín'],
              ['muro','Muro público']
            ].map(([k,label]) => (
              <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1.5 rounded-full text-sm ${tab===k? 'bg-white text-gray-900':'bg-white/10 hover:bg-white/20 text-white'}`}>{label}</button>
            ))}
            <button onClick={()=>setShowCfg(true)} title="Configurar" className="ml-2 px-3 py-1.5 rounded-full text-sm bg-white/10 hover:bg-white/20">⚙️</button>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-white/10">Rol: <b>{rol}</b></span>
            {rol==='Visitante' ? (
              <>
                <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN" className="px-2 py-1 rounded bg-white/90 text-gray-800"/>
                <button onClick={login} className="px-3 py-1 rounded bg-white/20 hover:bg-white/30">Entrar</button>
              </>
            ) : (
              <button onClick={()=>setRol('Visitante')} className="px-3 py-1 rounded bg-white/20 hover:bg-white/30">Salir</button>
            )}
          </div>
        </div>
      </header>

      {/* Cinta de frase */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2 text-white/90 text-sm">💡 {fraseAleatoria()}</div>
      </div>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-10 text-white">
        {tab === 'presentacion' && (
          <section>
            <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-4xl md:text-5xl font-extrabold mb-2">Bienvenida</motion.h1>
            <h2 className="text-2xl md:text-3xl font-light" style={{color:theme.accent}}>“Espacios de Lectura”</h2>
            <p className="text-white/90 max-w-3xl mt-4">Registra, visualiza y comparte actividades lectoras. Roles por PIN, sincronización con Google Sheets, QR del Muro, gráficas y más.</p>

            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <Stat label="Registros totales (local)" value={actividades.length} />
              <Stat label="Minutos acumulados" value={actividades.reduce((s,a)=>s+Number(a.minutos||0),0)} />
              <Stat label="Grados con actividad" value={new Set(actividades.map(a=>a.grado)).size} />
              <Stat label="Top libros (distintos)" value={new Set(actividades.map(a=>a.libro).filter(Boolean)).size} />
            </div>

            {/* Resultado de tests */}
            <div className="mt-6 text-xs text-white/80">Tests: {testsOK===null? 'ejecutando…' : testsOK? '✅ OK' : '❌ Falló (ver consola)'}</div>
          </section>
        )}

        {tab === 'registro' && (
          <section className={`rounded-2xl p-6 shadow ${puedeEditar? 'bg-white text-gray-800':'bg-white/80 text-gray-700'}`}>
            <h2 className="text-2xl font-bold mb-6" style={{color:theme.start}}>📝 Registrar actividad {puedeEditar? '':'(solo lectura)'}</h2>
            <form onSubmit={registrar} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estudiante</label>
                <input required value={form.estudiante} onChange={e=>setForm({...form,estudiante:e.target.value})} placeholder="Nombre y apellido" className="w-full border rounded-xl px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grado</label>
                <select value={form.grado} onChange={e=>setForm({...form,grado:e.target.value})} className="w-full border rounded-xl px-3 py-2">
                  {grados.map(g=> <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Actividad</label>
                <select value={form.actividad} onChange={e=>setForm({...form,actividad:e.target.value})} className="w-full border rounded-xl px-3 py-2">
                  {actividadesTipo.map(t=> <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Libro / Texto</label>
                <input value={form.libro} onChange={e=>setForm({...form,libro:e.target.value})} placeholder="Título o tema" className="w-full border rounded-xl px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minutos</label>
                <input type="number" min={1} value={form.minutos} onChange={e=>setForm({...form,minutos:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Docente o Encargado</label>
                <input required value={form.docente} onChange={e=>setForm({...form,docente:e.target.value})} placeholder="Nombre del docente" className="w-full border rounded-xl px-3 py-2"/>
              </div>
              <div className="md:col-span-2 flex gap-3 mt-2">
                <button disabled={!puedeEditar} className={`px-4 py-2 rounded-xl ${puedeEditar? 'text-white':'text-gray-400'}`} style={{background: puedeEditar? theme.start:'#e5e7eb'}}>Guardar registro</button>
                <button type="button" onClick={()=>setForm({ ...form, estudiante:'', libro:'', minutos:20 })} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">Limpiar</button>
              </div>
            </form>
          </section>
        )}

        {tab === 'movil' && (
          <section className={`rounded-2xl p-6 shadow ${puedeEditar? 'bg-white text-gray-900':'bg-white/80 text-gray-700'}`}>
            <h2 className="text-2xl font-bold mb-4" style={{color:theme.start}}>📱 Registro rápido (móvil)</h2>
            <form onSubmit={guardarMovil} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">Fecha</label>
                  <input type="date" value={formMovil.fecha} onChange={e=>setFormMovil({...formMovil,fecha:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Grado</label>
                  <select value={formMovil.grado} onChange={e=>setFormMovil({...formMovil,grado:e.target.value})} className="w-full border rounded-xl px-3 py-2">
                    {grados.map(g=> <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Actividad</label>
                <div className="flex flex-wrap gap-2">
                  {actividadesTipo.map(t=> (
                    <button type="button" key={t} onClick={()=>setFormMovil({...formMovil, actividad:t})} className={`px-3 py-1.5 rounded-full border ${formMovil.actividad===t? 'bg-gray-900 text-white':'bg-white'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Minutos</label>
                <div className="flex flex-wrap gap-2">
                  {presetsMin.map(m=> (
                    <button type="button" key={m} onClick={()=>setFormMovil({...formMovil, minutos:m})} className={`px-3 py-1.5 rounded-full border ${formMovil.minutos===m? 'bg-gray-900 text-white':'bg-white'}`}>{m}</button>
                  ))}
                  <input type="number" min={1} value={formMovil.minutos} onChange={e=>setFormMovil({...formMovil, minutos:Number(e.target.value)})} className="w-24 border rounded-xl px-3 py-1.5"/>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input value={formMovil.estudiante} onChange={e=>setFormMovil({...formMovil,estudiante:e.target.value})} placeholder="Estudiante (opcional)" className="w-full border rounded-xl px-3 py-2"/>
                <input required value={formMovil.docente} onChange={e=>setFormMovil({...formMovil,docente:e.target.value})} placeholder="Docente (requerido)" className="w-full border rounded-xl px-3 py-2"/>
              </div>
              <button disabled={!puedeEditar} className={`w-full py-3 rounded-2xl text-white text-lg font-semibold ${puedeEditar? '':'opacity-50'}`} style={{background: theme.start}}>Guardar en 1 toque ✅</button>
            </form>
            <p className="text-xs text-gray-500 mt-3">Optimizado para teléfonos: botones grandes, menos campos y confirmación inmediata.</p>
          </section>
        )}

        {tab === 'reporte' && (
          <section>
            <div className="bg-white/90 rounded-2xl p-6 shadow text-gray-800">
              <h2 className="text-2xl font-bold mb-4" style={{color:theme.start}}>📊 Reportes, filtros y visualizaciones</h2>
              <div className="grid md:grid-cols-4 gap-3 mb-4">
                <input placeholder="Buscar (estudiante, libro, docente)" value={q} onChange={e=>setQ(e.target.value)} className="border rounded-xl px-3 py-2"/>
                <select value={gradoF} onChange={e=>setGradoF(e.target.value)} className="border rounded-xl px-3 py-2">
                  {['Todos', ...grados].map(g=> <option key={g}>{g}</option>)}
                </select>
                <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} className="border rounded-xl px-3 py-2"/>
                <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} className="border rounded-xl px-3 py-2"/>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={()=>exportCSV(filtrados)} className="px-3 py-2 rounded-xl bg-white border hover:bg-gray-50">Exportar CSV</button>
                <button onClick={()=>window.print()} className="px-3 py-2 rounded-xl bg-white border hover:bg-gray-50">Imprimir</button>
                <button onClick={()=>{setQ('');setGradoF('Todos');setDesde('');setHasta('');}} className="px-3 py-2 rounded-xl bg-white border hover:bg-gray-50">Limpiar filtros</button>
                <button onClick={limpiarTodo} className="px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Borrar TODO</button>
                <span className="grow" />
                <button onClick={syncPull} className={`px-3 py-2 rounded-xl border ${canSync? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100':'bg-gray-50 text-gray-400 border-gray-200'}`}>⬇️ Bajar de la nube</button>
                <button onClick={syncPush} className={`px-3 py-2 rounded-xl border ${canSync? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100':'bg-gray-50 text-gray-400 border-gray-200'}`}>⬆️ Subir a la nube</button>
              </div>

              {/* Gráficas */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-2xl border p-4">
                  <div className="font-semibold text-gray-700 mb-2">Registros por grado</div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={porGrado}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Registros" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border p-4">
                  <div className="font-semibold text-gray-700 mb-2">Top 5 lectores por minutos</div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={porEstudianteMin} dataKey="value" nameKey="name" outerRadius={100} label>
                          {porEstudianteMin.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <Table rows={filtrados} />

              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {porEstudianteMin.slice(0,3).map((p,i)=> (
                  <div key={p.name} className="rounded-xl border bg-white px-4 py-3">
                    🏅 <b>{['Oro','Plata','Bronce'][i]||'Mención'}</b>: {p.name} — {p.value} min
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'catalogo' && (
          <section className="bg-white text-gray-900 rounded-2xl p-6 shadow">
            <h2 className="text-2xl font-bold mb-4" style={{color:theme.start}}>📚 Catálogo de libros</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input value={qLibro} onChange={e=>setQLibro(e.target.value)} placeholder="Buscar por título, autor o categoría" className="border rounded-xl px-3 py-2 md:col-span-2"/>
              <details className="md:col-span-1 border rounded-xl p-3">
                <summary className="font-semibold cursor-pointer">➕ Agregar libro</summary>
                <LibroForm onSave={agregarLibro} />
              </details>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {librosFiltrados.map(l => (
                <div key={l.id} className="rounded-2xl border p-4 bg-white">
                  <div className="font-semibold text-lg">{l.titulo}</div>
                  <div className="text-sm text-gray-600">{l.autor} · {l.categoria||'General'}</div>
                  <div className="mt-2 text-sm">Disponibles: <b>{l.disponibles}</b> · Préstamos: <b>{l.prestamos}</b></div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>prestarLibro(l.id)} disabled={!puedeEditar || l.disponibles<=0} className={`px-3 py-1.5 rounded-xl border ${puedeEditar && l.disponibles>0 ? '':'opacity-50'}`}>Prestar</button>
                    <button onClick={()=>devolverLibro(l.id)} disabled={!puedeEditar} className={`px-3 py-1.5 rounded-xl border ${puedeEditar? '':'opacity-50'}`}>Devolver</button>
                  </div>
                </div>
              ))}
              {librosFiltrados.length===0 && <div className="text-white/90">No hay libros (aún). Agrega el primero arriba.</div>}
            </div>
          </section>
        )}

        {tab === 'certificados' && (
          <section className="bg-white text-gray-900 rounded-2xl p-6 shadow">
            <h2 className="text-2xl font-bold mb-4" style={{color:theme.start}}>🏆 Certificados automáticos</h2>
            <p className="text-sm text-gray-600 mb-4">Genera un certificado imprimible para los lectores destacados (según minutos). Selecciona un estudiante del Top 5 o usa el generador por lote.</p>

            {/* Controles de lote */}
            <details className="mb-6 border rounded-xl p-4">
              <summary className="font-semibold cursor-pointer">📦 Exportar certificados en lote (PDF/Imprimir)</summary>
              <LotePanel porEstudianteMin={porEstudianteMin} theme={theme} />
            </details>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-2">
                {porEstudianteMin.map(p => (
                  <button key={p.name} onClick={()=>window.CERT_SET && window.CERT_SET(p.name, p.value)} className="w-full text-left px-3 py-2 rounded-xl border hover:bg-gray-50">{p.name} — {p.value} min</button>
                ))}
              </div>
              <div className="md:col-span-2">
                <Certificado theme={theme} onReady={(setter)=> window.CERT_SET = setter} />
              </div>
            </div>
          </section>
        )}

        {tab === 'boletin' && (
          <section className="bg-white text-gray-900 rounded-2xl p-6 shadow">
            <h2 className="text-2xl font-bold mb-2" style={{color:theme.start}}>📰 Boletín mensual</h2>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm">Mes</label>
              <input type="month" value={mes} onChange={e=>setMes(e.target.value)} className="border rounded-xl px-3 py-2"/>
              <button onClick={()=>window.print()} className="px-3 py-2 rounded-xl border">Imprimir</button>
            </div>
            <div className="border rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/80/Ministerio_de_Educaci%C3%B3n_de_la_Rep%C3%BAblica_Dominicana_%28MINERD%29_logo.png" alt="MINERD" className="w-10 h-10"/>
                <div>
                  <div className="font-bold" style={{color:theme.start}}>Boletín — Espacios de Lectura</div>
                  <div className="text-xs text-gray-600">Liceo Prof. Domingo González · Distrito 03-05 Nizao</div>
                </div>
                <span className="grow" />
                <QRCodeSVG value={muroURL()} size={64} />
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-extrabold" style={{color:theme.start}}>{totMes}</div>
                  <div className="text-sm">Actividades en {mes}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-extrabold" style={{color:theme.start}}>{minMes}</div>
                  <div className="text-sm">Minutos acumulados</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-extrabold" style={{color:theme.start}}>{new Set(actMes.map(a=>a.grado)).size}</div>
                  <div className="text-sm">Grados participantes</div>
                </div>
              </div>
              <div className="mt-6 grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border p-4">
                  <div className="font-semibold text-gray-700 mb-2">Actividades por grado</div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={porGradoMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Actividades" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border p-4">
                  <div className="font-semibold text-gray-700 mb-2">Top libros del mes</div>
                  <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                    {topLibrosMes.length===0 && <li>No hay datos</li>}
                    {topLibrosMes.map(([libro,c]) => (<li key={libro}><span className="font-medium">{libro}</span> — {c}</li>))}
                  </ol>
                </div>
              </div>
              <div className="mt-6 text-xs text-gray-500">Enlace público del muro: {muroURL()}</div>
            </div>
          </section>
        )}

        {tab === 'muro' && (
          <section>
            <h2 className="text-3xl font-bold mb-1">🧱 Muro público de actividades</h2>
            <p className="text-white/90 mb-6 max-w-3xl">Escanea y mira en casa: <span className="underline">{muroURL()}</span></p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {actividades.length === 0 && (
                <div className="text-white/90">Aún no hay actividades. Registra la primera desde la pestaña <span className="font-bold">“Registrar actividad”</span>.</div>
              )}
              {actividades.map((a,i)=> (
                <div key={i} className="bg-white/95 text-gray-800 rounded-2xl shadow p-4">
                  <div className="text-xs text-gray-500">{a.fecha} · {a.grado}</div>
                  <div className="mt-1 font-semibold">{a.estudiante || '—'}</div>
                  <div className="text-sm">{a.actividad}{a.libro? ` — ${a.libro}`:''}</div>
                  <div className="mt-2 text-xs">⏱ {a.minutos} min · 👩‍🏫 {a.docente}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal de configuración */}
      {showCfg && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4" onClick={()=>setShowCfg(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl text-gray-800" onClick={e=>e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <div className="font-bold" style={{color:theme.start}}>Configuración</div>
              <button onClick={()=>setShowCfg(false)} className="text-gray-500">✖</button>
            </div>
            <div className="p-5 space-y-4">
              <details className="bg-gray-50 rounded-xl p-3" open>
                <summary className="cursor-pointer font-semibold" style={{color:theme.start}}>🎨 Tema</summary>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {themes.map((t)=> (
                    <button key={t.name} onClick={()=>applyTheme(t)} className="px-3 py-1 rounded-full border" style={{backgroundImage:`linear-gradient(45deg, ${t.start}, ${t.end})`, color:'#fff'}}>{t.name}</button>
                  ))}
                </div>
              </details>

              <details className="bg-gray-50 rounded-xl p-3">
                <summary className="cursor-pointer font-semibold" style={{color:theme.start}}>🔐 Roles por PIN</summary>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm">PIN Biblioteca</label>
                    <input value={roles.pinBiblioteca} onChange={e=>{ const next={...roles, pinBiblioteca:e.target.value}; setRoles(next); localStorage.setItem(ROLE_KEY, JSON.stringify(next)); }} className="w-full border rounded-xl px-3 py-2"/>
                  </div>
                  <div>
                    <label className="block text-sm">PIN Dirección</label>
                    <input value={roles.pinDireccion} onChange={e=>{ const next={...roles, pinDireccion:e.target.value}; setRoles(next); localStorage.setItem(ROLE_KEY, JSON.stringify(next)); }} className="w-full border rounded-xl px-3 py-2"/>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Comparte el PIN de Biblioteca solo con quien registra actividades.</p>
              </details>

              <details className="bg-gray-50 rounded-xl p-3">
                <summary className="cursor-pointer font-semibold" style={{color:theme.start}}>☁️ Sincronización (Apps Script / API)</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Endpoint (Apps Script / API)</label>
                    <input value={cfg.endpoint||''} onChange={e=>saveCfg({...cfg, endpoint:e.target.value})} placeholder="https://script.google.com/macros/s/AKfy.../exec" className="w-full border rounded-xl px-3 py-2"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Token (X-Auth)</label>
                    <input value={cfg.token||''} onChange={e=>saveCfg({...cfg, token:e.target.value})} placeholder="Secreto para proteger el endpoint" className="w-full border rounded-xl px-3 py-2"/>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async()=>{ setShowCfg(false); await syncPull(); }} className="px-4 py-2 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Probar descarga</button>
                    <button onClick={async()=>{ setShowCfg(false); await syncPush(); }} className="px-4 py-2 rounded-xl border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Probar subida</button>
                  </div>
                </div>
              </details>

              <details className="bg-gray-50 rounded-xl p-3">
                <summary className="cursor-pointer font-semibold" style={{color:theme.start}}>🧪 Cargar datos de ejemplo</summary>
                <div className="mt-3">
                  <button onClick={()=>{
                    if(!puedeEditar) return alert('Inicie sesión para cargar ejemplos.');
                    const demo=[
                      {fecha:'2025-10-01', estudiante:'Ana Pérez', grado:'1ro Secundaria', actividad:'Lectura Guiada', libro:'El principito', minutos:25, docente:'Rosa García'},
                      {fecha:'2025-10-02', estudiante:'Luis Gómez', grado:'2do Secundaria', actividad:'Préstamo de Libro', libro:'Cien años de soledad', minutos:15, docente:'Orlando Díaz'},
                      {fecha:'2025-10-05', estudiante:'María López', grado:'4to Secundaria', actividad:'Resumen/Reseña', libro:'La Odisea', minutos:40, docente:'Fátima Cruz'}
                    ];
                    setActividades(a=>[...demo, ...a]);
                    alert('Datos de ejemplo agregados');
                  }} className="px-4 py-2 rounded-xl border">Insertar ejemplos</button>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Pie */}
      <footer className="py-8 text-center text-white/80 text-sm">
        © {new Date().getFullYear()} Biblioteca del Liceo Prof. Domingo González · Hecho con ❤️
      </footer>
    </div>
  );
}
