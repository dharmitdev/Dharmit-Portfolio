import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { City } from 'country-state-city';
import './weather.css';

const INDIAN_CITIES = City.getCitiesOfCountry('IN') || [];

const WEATHER_ICONS: Record<string, string> = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ForecastDay {
  day: string;
  icon: string;
  high: number;
  low: number;
}

interface WeatherData {
  name: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind: number;
  description: string;
  main: string;
  isDemo: boolean;
  forecast: ForecastDay[];
}

function parseForecast(list: any[]): ForecastDay[] {
  const days: Record<string, any> = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = date.toDateString();
    if (!days[key]) {
      days[key] = {
        day: DAY_NAMES[date.getDay()],
        icon: item.weather[0].main,
        high: item.main.temp_max,
        low: item.main.temp_min,
      };
    } else {
      days[key].high = Math.max(days[key].high, item.main.temp_max);
      days[key].low  = Math.min(days[key].low,  item.main.temp_min);
    }
  });
  return Object.values(days).slice(0, 7).map(d => ({
    ...d,
    high: Math.round(d.high),
    low:  Math.round(d.low),
  }));
}

const DEMO_DATA: WeatherData = {
  name: 'Gujarat', country: 'IN',
  temp: 32, feels_like: 35, humidity: 65, wind: 14,
  description: 'Partly Cloudy', main: 'Clouds', isDemo: true,
  forecast: [
    { day: 'Mon', icon: 'Clear',  high: 34, low: 24 },
    { day: 'Tue', icon: 'Clouds', high: 31, low: 23 },
    { day: 'Wed', icon: 'Rain',   high: 28, low: 21 },
    { day: 'Thu', icon: 'Rain',   high: 27, low: 20 },
    { day: 'Fri', icon: 'Clear',  high: 33, low: 25 },
    { day: 'Sat', icon: 'Clear',  high: 35, low: 26 },
    { day: 'Sun', icon: 'Clouds', high: 30, low: 22 },
  ],
};

export default function WeatherApp() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // ... rest of the states same
  const [data, setData] = useState<WeatherData>(DEMO_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Click outside suggestions to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Indian Cities for suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const q = query.trim().toLowerCase();
    
    // Using a Map or Set to prevent duplicate city names (since some states have same city name)
    const uniqueCities = new Map();
    for (const city of INDIAN_CITIES) {
      if (city.name.toLowerCase().startsWith(q)) {
        if (!uniqueCities.has(city.name)) {
          uniqueCities.set(city.name, city);
        }
      }
    }
    
    // Convert to array and limit to max 100 for performance
    const filtered = Array.from(uniqueCities.values()).slice(0, 100);
    
    setSuggestions(filtered);
    setSelectedIndex(-1);
  }, [query]);

  // Scroll active suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault(); // Prevent double form submit
        handleSuggestionClick(suggestions[selectedIndex]);
      }
    }
  };

  const doSearch = async (cityToSearch: string) => {
    if (!cityToSearch) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(cityToSearch)}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `City "${cityToSearch}" not found. Check spelling.`);
      }

      const { weather, forecast } = await res.json();

      setData({
        name:        weather.name,
        country:     weather.sys?.country ?? '',
        temp:        Math.round(weather.main.temp),
        feels_like:  Math.round(weather.main.feels_like),
        humidity:    weather.main.humidity,
        wind:        Math.round((weather.wind?.speed ?? 0) * 3.6),
        description: weather.weather[0].description,
        main:        weather.weather[0].main,
        isDemo:      false,
        forecast:    forecast ? parseForecast(forecast.list) : DEMO_DATA.forecast,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    doSearch(query.trim());
  };

  const handleSuggestionClick = (cityObj: any) => {
    setQuery(cityObj.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    doSearch(cityObj.name);
  };

  const icon = WEATHER_ICONS[data.main] || '🌡️';

  return (
    <div className="project-page weather-page">
      <nav className="project-page-nav">
        <Link to="/">← Back to Portfolio</Link>
        <span className="project-page-title">Weather Dashboard</span>
        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--acid)', letterSpacing: '0.08em' }}>
          React + API
        </span>
      </nav>

      <div className="weather-wrap">
        <div className="weather-search-wrapper" ref={suggestionRef}>
          <form className="weather-search" onSubmit={search}>
            <input
              className="weather-input"
              type="text"
              placeholder="Search Indian city… e.g. Mumbai, Ahmedabad"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            <button className="weather-search-btn" type="submit" disabled={loading}>
              {loading ? <span className="weather-spinner" /> : '→'}
            </button>
          </form>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="weather-suggestions">
              {suggestions.map((cityObj, i) => (
                <div 
                  key={i} 
                  ref={el => { itemRefs.current[i] = el; }}
                  className={`weather-suggestion-item ${i === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(cityObj)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="weather-suggestion-name">{cityObj.name}</span>
                  <span className="weather-suggestion-desc">{cityObj.stateCode ? `${cityObj.stateCode}, ` : ''}India</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="weather-error">⚠ {error}</p>}

        <div className="weather-card" style={{ animation: 'fadeIn 0.4s ease' }}>
          <div className="weather-location">
            <span className="weather-city">{data.name}</span>
            {data.country && <span className="weather-country">{data.country}</span>}
          </div>
          <div className="weather-main">
            <div className="weather-icon">{icon}</div>
            <div className="weather-temp">{data.temp}°</div>
          </div>
          <div className="weather-desc" style={{ textTransform: 'capitalize' }}>{data.description}</div>
          <div className="weather-stats">
            <div className="wstat">
              <div className="wstat-val">{data.feels_like}°</div>
              <div className="wstat-label">Feels like</div>
            </div>
            <div className="wstat-divider" />
            <div className="wstat">
              <div className="wstat-val">{data.humidity}%</div>
              <div className="wstat-label">Humidity</div>
            </div>
            <div className="wstat-divider" />
            <div className="wstat">
              <div className="wstat-val">{data.wind} km/h</div>
              <div className="wstat-label">Wind</div>
            </div>
          </div>
        </div>

        <div className="forecast-grid">
          {data.forecast.map((f, i) => (
            <div className="forecast-item" key={i}>
              <div className="forecast-day">{f.day}</div>
              <div className="forecast-icon">{WEATHER_ICONS[f.icon] || '🌡️'}</div>
              <div className="forecast-high">{f.high}°</div>
              <div className="forecast-low">{f.low}°</div>
            </div>
          ))}
        </div>

        {data.isDemo && (
          <p className="weather-note">
            Showing demo data · Search any city above to get live weather.
          </p>
        )}
      </div>
    </div>
  );
}
