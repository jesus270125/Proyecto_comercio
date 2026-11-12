import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destino: '', tipo: '', fecha: '', personas: '2' });
  const [today] = useState(() => new Date().toISOString().split('T')[0]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSearch = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.destino) params.set('q', form.destino);
    if (form.tipo && form.tipo !== 'all') params.set('cat', form.tipo);
    navigate(`/experiencias?${params.toString()}`);
  };

  return (
    <form className="searchbar" onSubmit={handleSearch} id="home-searchbar">
      <div className="searchbar__field">
        <label className="searchbar__label" htmlFor="search-destino">Destino</label>
        <input
          id="search-destino"
          name="destino"
          type="text"
          className="searchbar__input"
          placeholder="Choquequirao, Abancay…"
          value={form.destino}
          onChange={handleChange}
        />
      </div>
      <div className="searchbar__divider" />
      <div className="searchbar__field">
        <label className="searchbar__label" htmlFor="search-tipo">Tipo</label>
        <select
          id="search-tipo"
          name="tipo"
          className="searchbar__input"
          value={form.tipo}
          onChange={handleChange}
        >
          <option value="all">Experiencias y hospedajes</option>
          <option value="Aventura">Aventura</option>
          <option value="Cultura">Cultura</option>
          <option value="Naturaleza">Naturaleza</option>
          <option value="Vivencial">Vivencial</option>
          <option value="Gastronomía">Gastronomía</option>
        </select>
      </div>
      <div className="searchbar__divider" />
      <div className="searchbar__field">
        <label className="searchbar__label" htmlFor="search-fecha">Fecha</label>
        <input
          id="search-fecha"
          name="fecha"
          type="date"
          className="searchbar__input"
          value={form.fecha}
          onChange={handleChange}
          min={today}
        />
      </div>
      <div className="searchbar__divider" />
      <div className="searchbar__field searchbar__field--sm">
        <label className="searchbar__label" htmlFor="search-personas">Personas</label>
        <select
          id="search-personas"
          name="personas"
          className="searchbar__input"
          value={form.personas}
          onChange={handleChange}
        >
          {[1,2,3,4,5,6,8,10,12].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="searchbar__btn" id="home-search-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Buscar
      </button>
    </form>
  );
}
