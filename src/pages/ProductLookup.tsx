import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Download, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Sparkles } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

type Confidence = 'High' | 'Medium' | 'Low';

interface CompanyRecord {
  id: string;
  parentCompany: string;
  companyName: string;
  productsMade: string;
  confidence: Confidence;
  cityState: string;
  throughput: string; // e.g. "15,000 lbs/hr"
  capacity: string;   // e.g. "Industrial - Tier 1"
  lat: number;
  lng: number;
}

const generateIndustrialData = (query: string): CompanyRecord[] => {
  const queryLower = query.toLowerCase();
  const isPattySearch = queryLower.includes('patty') || queryLower.includes('patties');
  
  if (!isPattySearch) {
    // Return a default set if not searching for patties
    return [
      { id: '1', parentCompany: 'Tyson Foods', companyName: 'Springdale Processing', productsMade: 'IQF Chicken, Breaded Tenders', confidence: 'High', cityState: 'Springdale, AR', throughput: '22,000 lbs/hr', capacity: 'Enterprise', lat: 36.1867, lng: -94.1288 },
      { id: '2', parentCompany: 'Conagra Brands', companyName: 'Birdseye Frozen Div', productsMade: 'Frozen Vegetables, Ready Meals', confidence: 'High', cityState: 'Omaha, NE', throughput: '18,500 lbs/hr', capacity: 'Industrial - Tier 1', lat: 41.2565, lng: -95.9345 },
    ];
  }

  const results: CompanyRecord[] = [];
  const categories = [
    { type: 'Beef', companies: ['Tyson Foods', 'JBS USA', 'Cargill', 'National Beef', 'Sysco'] },
    { type: 'Sausage', companies: ['Smithfield Foods', 'Hormel Foods', 'Johnsonville', 'Bob Evans', 'Jones Dairy Farm'] },
    { type: 'Egg', companies: ['Michael Foods', 'Rose Acre Farms', 'Cal-Maine Foods', 'Remedy Valley', 'Versova'] },
    { type: 'Chicken', companies: ['Tyson Foods', 'Pilgrim\'s Pride', 'Perdue Farms', 'Koch Foods', 'Mountaire Farms'] },
    { type: 'Turkey', companies: ['Butterball', 'Jennie-O', 'Cargill Turkey', 'Farbest Foods', 'Michigan Turkey'] },
    { type: 'Veggie', companies: ['Kellanova (MorningStar)', 'Impossible Foods', 'Beyond Meat', 'Quorn', 'Gardein'] }
  ];

  const states = [
    { name: 'AR', lat: 34.7465, lng: -92.2896 }, { name: 'IA', lat: 41.8780, lng: -93.0977 },
    { name: 'KS', lat: 39.0119, lng: -98.4842 }, { name: 'NE', lat: 41.1254, lng: -98.2681 },
    { name: 'OH', lat: 40.4173, lng: -82.9071 }, { name: 'TX', lat: 31.9686, lng: -99.9018 },
    { name: 'MN', lat: 46.7296, lng: -94.6859 }, { name: 'NC', lat: 35.7596, lng: -79.0193 },
    { name: 'GA', lat: 32.1656, lng: -82.9001 }, { name: 'WI', lat: 43.7844, lng: -88.7879 }
  ];

  let idCounter = 1;
  categories.forEach(cat => {
    cat.companies.forEach(parent => {
      // Generate 4-6 facilities per company to reach ~200-300 results
      const facilityCount = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < facilityCount; i++) {
        const state = states[Math.floor(Math.random() * states.length)];
        const throughputValue = 10000 + Math.floor(Math.random() * 40000);
        results.push({
          id: (idCounter++).toString(),
          parentCompany: parent,
          companyName: `${parent} - ${cat.type} Division #${i + 1}`,
          productsMade: `${cat.type} Patties, ${cat.type} Sliders, Industrial Bulk Pack`,
          confidence: Math.random() > 0.3 ? 'High' : 'Medium',
          cityState: `Industrial Hub, ${state.name}`,
          throughput: `${throughputValue.toLocaleString()} lbs/hr`,
          capacity: throughputValue > 30000 ? 'Enterprise - High Volume' : 'Industrial - Tier 1',
          lat: state.lat + (Math.random() - 0.5) * 2,
          lng: state.lng + (Math.random() - 0.5) * 2
        });
      }
    });
  });

  return results;
};

const initialData = generateIndustrialData('');

export function ProductLookup() {
  const [data, setData] = useState<CompanyRecord[]>(initialData);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyRecord, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    parentCompany: '', companyName: '', productsMade: '', confidence: '', cityState: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState('');
  const [productTypeSearch, setProductTypeSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const itemsPerPage = 20;

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTypeSearch) return;
    
    setIsSearching(true);
    setShowResults(false);
    
    // Simulate AI deep search
    setTimeout(() => {
      const results = generateIndustrialData(productTypeSearch);
      setData(results);
      setIsSearching(false);
      setShowResults(true);
      setCurrentPage(1); // Reset to first page
    }, 2000);
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
    setCurrentPage(1); // Reset to first page on filter
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

    // Product Type Search (Primary)
    if (productTypeSearch && showResults) {
      const lowerProduct = productTypeSearch.toLowerCase();
      result = result.filter(item => 
        item.productsMade.toLowerCase().includes(lowerProduct)
      );
    }

    // Column Filters
    (Object.keys(filters) as Array<keyof CompanyRecord>).forEach(key => {
      if (filters[key]) {
        const lowerFilter = filters[key].toLowerCase();
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
  }, [data, sortConfig, filters, globalSearch, productTypeSearch, showResults]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / itemsPerPage));
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: keyof CompanyRecord }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const renderConfidenceBadge = (confidence: Confidence) => {
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
          <p className="page-description">Identify manufacturers and specific facilities by product type.</p>
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
          <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }}>
            Search
          </button>
        </form>

        {isSearching && (
          <div className="ai-status-banner">
            <Sparkles className="ai-status-icon" size={18} />
            <span className="ai-status-text">Scanning facility capabilities...</span>
            <span className="ai-status-detail">Cross-referencing production lines and product registries</span>
          </div>
        )}
      </div>

      {showResults ? (
        <>
          <div className="table-card">
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
        <div style={{ overflowX: 'auto' }}>
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
                  <td style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{row.throughput}</td>
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
      <div className="map-module-container">
        <div className="map-module-header">
          <MapPin size={18} color="var(--accent-primary)" />
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
                      <strong>Throughput:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{item.throughput}</span>
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
        </>
      ) : !isSearching && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Start Your Search</h2>
            <p>Enter a product category or specific SKU to identify manufacturers and their facility locations.</p>
          </div>
        </div>
      )}
    </div>
  );
}
