import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Download, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { searchPlants, type CompanyRecord } from '../lib/gemini';

// Fix for default marker icon in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export function ProductLookup() {
  const [data, setData] = useState<CompanyRecord[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyRecord, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    parentCompany: '', companyName: '', productsMade: '', confidence: '', cityState: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState('');
  const [productTypeSearch, setProductTypeSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const itemsPerPage = 20;

  const handleProductSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTypeSearch) return;
    
    setIsSearching(true);
    setShowResults(false);
    setSearchStatus('Consulting PATE database...');
    
    try {
      // Simulate multi-pass status updates
      const statusInterval = setInterval(() => {
        setSearchStatus(prev => {
          if (prev === 'Consulting PATE database...') return 'Identifying primary manufacturers...';
          if (prev === 'Identifying primary manufacturers...') return 'Uncovering hidden co-packers & business units...';
          if (prev === 'Uncovering hidden co-packers & business units...') return 'Finalizing geographic clusters...';
          return prev;
        });
      }, 2000);

      const results = await searchPlants(productTypeSearch);
      clearInterval(statusInterval);
      
      setData(results);
      setIsSearching(false);
      setShowResults(true);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search failed:", error);
      setIsSearching(false);
      alert("Search failed. Please check your API key and connection.");
    }
  };

  const handleSort = (key: keyof CompanyRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: keyof CompanyRecord, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); 
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Global Search
    if (globalSearch) {
      const lowerSearch = globalSearch.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(lowerSearch))
      );
    }

    // Column Filters
    (Object.keys(filters) as Array<keyof CompanyRecord>).forEach(key => {
      if (filters[key]) {
        const lowerFilter = filters[key].toLowerCase();
        // @ts-ignore
        result = result.filter(item => String(item[key]).toLowerCase().includes(lowerFilter));
      }
    });

    // Sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, sortConfig, filters, globalSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / itemsPerPage));
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: keyof CompanyRecord }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const renderConfidenceBadge = (confidence: string) => {
    const lower = confidence.toLowerCase();
    return (
      <span className={`badge-confidence badge-${lower}`}>
        <span className="badge-dot"></span> {confidence}
      </span>
    );
  };

  return (
    <div className="main-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Product Lookup</h1>
          <p className="page-description">Identify manufacturers and specific facilities powered by Gemini AI.</p>
        </div>
        
        <form onSubmit={handleProductSearch} className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="What product are you looking for? (e.g. 'IQF Chicken', 'Frozen Pizza')"
            value={productTypeSearch}
            onChange={(e) => setProductTypeSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }} disabled={isSearching}>
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </form>

        {isSearching && (
          <div className="ai-status-banner">
            <Sparkles className="ai-status-icon" size={18} />
            <span className="ai-status-text">{searchStatus}</span>
            <span className="ai-status-detail">Cross-referencing production lines and product registries</span>
          </div>
        )}
      </div>

      {showResults ? (
        <div className="results-container" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          <div className="table-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Table Header Area */}
            <div className="table-header-area">
              <div>
                <h2 className="table-title" style={{ fontSize: '1rem', color: '#64748b' }}>
                  Search Results for "{productTypeSearch}"
                </h2>
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Filter results..." 
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="action-buttons">
                <button className="btn-filter">
                  <Filter size={16} /> Filters
                </button>
                <button className="btn-primary">
                  <Plus size={16} /> Add Manually
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input type="checkbox" className="custom-checkbox" />
                    </th>
                    
                    {[
                      { key: 'parentCompany', label: 'Parent Company' },
                      { key: 'companyName', label: 'Company' },
                      { key: 'productsMade', label: 'Products Made' },
                      { key: 'throughput', label: 'Throughput' },
                      { key: 'capacity', label: 'Capacity' },
                      { key: 'confidence', label: 'Confidence Level' },
                      { key: 'cityState', label: 'City & State' },
                    ].map(col => (
                      <th key={col.key} style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => handleSort(col.key as keyof CompanyRecord)}
                          >
                            {col.label} <SortIcon columnKey={col.key as keyof CompanyRecord} />
                          </div>
                          <input 
                            type="text" 
                            placeholder={`Filter...`} 
                            value={filters[col.key] || ''}
                            onChange={(e) => handleFilterChange(col.key as keyof CompanyRecord, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: '12px',
                              width: '100%',
                              fontWeight: 'normal',
                              boxSizing: 'border-box'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </th>
                    ))}
                    
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? paginatedData.map(row => (
                    <tr key={row.id}>
                      <td className="checkbox-cell">
                        <input type="checkbox" className="custom-checkbox" />
                      </td>
                      <td>{row.parentCompany}</td>
                      <td className="company-name">{row.companyName}</td>
                      <td>{row.productsMade}</td>
                      <td style={{ fontWeight: '600', color: '#e31837' }}>{row.throughput}</td>
                      <td style={{ fontSize: '0.75rem' }}>{row.capacity}</td>
                      <td>
                        {renderConfidenceBadge(row.confidence)}
                      </td>
                      <td>{row.cityState}</td>
                      <td>
                        <div className="table-actions">
                          <Download size={18} className="action-icon" />
                          <Trash2 size={18} className="action-icon" />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`page-num ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Map Module */}
          <div className="map-module-container" style={{ flex: 0.8, height: '100%', marginTop: 0 }}>
            <div className="map-module-header">
              <MapPin size={18} color="#e31837" />
              <h2 className="map-module-title">Geographic Distribution</h2>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <MapContainer 
                center={[39.8283, -98.5795]} 
                zoom={4} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredAndSortedData.map(item => (
                  <Marker key={item.id} position={[item.lat, item.lng]}>
                    <Popup>
                      <div style={{ minWidth: '150px' }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600' }}>{item.companyName}</h3>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>{item.parentCompany}</p>
                        <div style={{ fontSize: '12px' }}>
                          <strong>Products:</strong> {item.productsMade}
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '12px' }}>
                          <strong>Throughput:</strong> <span style={{ color: '#e31837', fontWeight: '600' }}>{item.throughput}</span>
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '12px' }}>
                          <strong>Capacity:</strong> {item.capacity}
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '12px' }}>
                          <strong>Location:</strong> {item.cityState}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      ) : !isSearching && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Start Your AI Search</h2>
            <p>Enter a product category to identify manufacturers, including hidden co-packers and shadow facilities.</p>
          </div>
        </div>
      )}
    </div>
  );
}
