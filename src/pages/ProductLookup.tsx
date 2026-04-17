import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Filter, 
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { searchPlants, PlantResult } from '../lib/gemini';

export function ProductLookup() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PlantResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleProductSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setCurrentPage(1);

    try {
      const data = await searchPlants(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to conduct investigation. Check your API key.");
    } finally {
      setIsSearching(false);
    }
  };

  // Pagination Logic
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return results.slice(start, start + itemsPerPage);
  }, [results, currentPage]);

  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">Product Plant Finder</h1>
          <p className="page-description">
            Identify manufacturing facilities, co-packers, and regional clusters using AR Investigative Logic.
          </p>
        </div>
      </header>

      <div className="search-section">
        <div className="search-box-container">
          <form onSubmit={handleProductSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input"
                placeholder="Enter product type (e.g., IQF Patties, Frozen Waffles, Bacon)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
              />
            </div>
            <button 
              type="submit" 
              className={`search-button ${isSearching ? 'loading' : ''}`}
              disabled={isSearching}
            >
              {isSearching ? <Loader className="animate-spin" size={20} /> : 'Investigate'}
            </button>
          </form>
          
          <div className="search-filters">
            <span className="filter-tag"><Filter size={14} /> AR SOP v1.3</span>
            <span className="filter-tag">North America</span>
            <span className="filter-tag">Food & Beverage</span>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="ar-status-banner">
          <div className="ar-status-content">
            <Loader className="animate-spin" size={18} />
            <span><strong>Applying AR Filter:</strong> Multi-pass search for manufacturers and co-packers...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-stack">
          {/* Vertical Layout: Table First, then Map */}
          
          <section className="results-module">
            <div className="module-header">
              <div className="module-title-group">
                <TrendingUp size={20} className="module-icon" />
                <h2 className="module-title">Investigative Results</h2>
              </div>
              <button className="btn-export">
                <Download size={16} /> Export to CSV
              </button>
            </div>

            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Parent Company</th>
                    <th>Facility Name</th>
                    <th>Products</th>
                    <th>Confidence</th>
                    <th>Location</th>
                    <th>Est. Throughput</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((plant) => (
                    <tr key={plant.id}>
                      <td className="font-bold">{plant.parentCompany}</td>
                      <td>{plant.companyName}</td>
                      <td>{plant.productsMade}</td>
                      <td>
                        <span className={`confidence-badge ${plant.confidence.toLowerCase()}`}>
                          {plant.confidence}
                        </span>
                      </td>
                      <td>{plant.cityState}</td>
                      <td>{plant.throughput}</td>
                      <td>{plant.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-nav"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="page-nav"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </section>

          <section className="results-module map-module">
            <div className="module-header">
              <div className="module-title-group">
                <MapPin size={20} className="module-icon" />
                <h2 className="module-title">Geographic Distribution</h2>
              </div>
            </div>
            <div className="map-view-container">
              <MapContainer 
                center={[40.0, -98.0]} 
                zoom={4} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {results.map((plant) => (
                  <Marker key={plant.id} position={[plant.lat, plant.lng]}>
                    <Popup>
                      <div className="map-popup">
                        <strong>{plant.companyName}</strong><br />
                        <span className="text-muted">{plant.parentCompany}</span><br />
                        <span className="popup-products">{plant.productsMade}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
