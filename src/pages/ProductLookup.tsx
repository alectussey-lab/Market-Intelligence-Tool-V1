import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Download, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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
  lat: number;
  lng: number;
}

const generateMockData = (): CompanyRecord[] => {
  return [
    { id: '1', parentCompany: 'Tyson Foods', companyName: 'Springdale Processing', productsMade: 'IQF Chicken, Breaded Tenders', confidence: 'High', cityState: 'Springdale, AR', lat: 36.1867, lng: -94.1288 },
    { id: '2', parentCompany: 'Conagra Brands', companyName: 'Birdseye Frozen Div', productsMade: 'Frozen Vegetables, Ready Meals', confidence: 'High', cityState: 'Omaha, NE', lat: 41.2565, lng: -95.9345 },
    { id: '3', parentCompany: 'Hearthside Food Solutions', companyName: 'McComb Bakery', productsMade: 'Cookies, Crackers, Snack Bars', confidence: 'Medium', cityState: 'McComb, OH', lat: 41.1070, lng: -83.7919 },
    { id: '4', parentCompany: 'JBS USA', companyName: 'Plumrose USA', productsMade: 'Sliced Bacon, Deli Meats', confidence: 'High', cityState: 'Council Bluffs, IA', lat: 41.2619, lng: -95.8508 },
    { id: '5', parentCompany: 'Kellanova', companyName: 'Zanesville Plant', productsMade: 'Veggie Patties, MorningStar Farms', confidence: 'High', cityState: 'Zanesville, OH', lat: 39.9403, lng: -82.0132 },
    { id: '6', parentCompany: 'Nestlé USA', companyName: "Solon Facility", productsMade: 'Frozen Entrees, Stouffers, Lean Cuisine', confidence: 'High', cityState: 'Solon, OH', lat: 41.3898, lng: -81.4412 },
    { id: '7', parentCompany: 'Kraft Heinz', companyName: 'Davenport Plant', productsMade: 'Oscar Mayer Deli Meats, Lunchables', confidence: 'High', cityState: 'Davenport, IA', lat: 41.5236, lng: -90.5776 },
    { id: '8', parentCompany: 'General Mills', companyName: 'Cedar Rapids Facility', productsMade: 'Cheerios, Fruit Snacks', confidence: 'High', cityState: 'Cedar Rapids, IA', lat: 41.9779, lng: -91.6656 },
    { id: '9', parentCompany: 'PepsiCo (Frito-Lay)', companyName: 'Perry Facility', productsMade: 'Lay\'s Potato Chips, Doritos', confidence: 'High', cityState: 'Perry, GA', lat: 32.4582, lng: -83.7316 },
    { id: '10', parentCompany: 'Cargill', companyName: 'Wichita Beef Plant', productsMade: 'Ground Beef, Steaks', confidence: 'High', cityState: 'Wichita, KS', lat: 37.6889, lng: -97.3361 },
    { id: '11', parentCompany: 'Mondelez International', companyName: 'Chicago Bakery', productsMade: 'Oreo, Nabisco Crackers', confidence: 'Medium', cityState: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
    { id: '12', parentCompany: 'Danone North America', companyName: 'Minster Yogurt Plant', productsMade: 'Oikos, Dannon Yogurt', confidence: 'High', cityState: 'Minster, OH', lat: 40.3920, lng: -84.3777 },
    { id: '13', parentCompany: 'Mars Wrigley', companyName: 'Hackettstown Plant', productsMade: 'M&Ms, Snickers', confidence: 'High', cityState: 'Hackettstown, NJ', lat: 40.8532, lng: -74.8291 },
    { id: '14', parentCompany: 'Ferrero', companyName: 'Bloomington Facility', productsMade: 'Crunch Bar, Kinder Joy', confidence: 'Medium', cityState: 'Bloomington, IL', lat: 40.4842, lng: -88.9937 },
    { id: '15', parentCompany: 'Hormel Foods', companyName: 'Austin Plant', productsMade: 'SPAM, Pepperoni', confidence: 'High', cityState: 'Austin, MN', lat: 43.6666, lng: -92.9746 },
    { id: '16', parentCompany: 'Campbell Soup Co', companyName: 'Napoleon Plant', productsMade: 'V8 Juice, Canned Soups', confidence: 'High', cityState: 'Napoleon, OH', lat: 41.3923, lng: -84.1252 },
    { id: '17', parentCompany: 'Sargento Foods', companyName: 'Plymouth Facility', productsMade: 'Shredded Cheese, Snack Packs', confidence: 'High', cityState: 'Plymouth, WI', lat: 43.7489, lng: -87.9712 },
    { id: '18', parentCompany: 'Bimbo Bakeries USA', companyName: 'Horsham Bakery', productsMade: 'Sara Lee Bread, Entenmanns', confidence: 'Medium', cityState: 'Horsham, PA', lat: 40.1784, lng: -75.1274 },
    { id: '19', parentCompany: 'TreeHouse Foods', companyName: 'Bay Valley Foods', productsMade: 'Private Label Dressings, Sauces', confidence: 'Medium', cityState: 'Oak Brook, IL', lat: 41.8389, lng: -87.9531 },
    { id: '20', parentCompany: 'Schwan\'s Company', companyName: 'Marshall Facility', productsMade: 'Tony\'s Pizza, Red Baron', confidence: 'High', cityState: 'Marshall, MN', lat: 44.4469, lng: -95.7884 }
  ];
};

const mockData = generateMockData();

export function ProductLookup() {
  const [data] = useState<CompanyRecord[]>(mockData);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyRecord, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    parentCompany: '', companyName: '', productsMade: '', confidence: '', cityState: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState('');
  const itemsPerPage = 20;

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
  }, [data, sortConfig, filters, globalSearch]);

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
      <div className="table-card">
        
        {/* Table Header Area */}
        <div className="table-header-area">
          <div>
            <h1 className="table-title">Product Lookup</h1>
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search everywhere..." 
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
                  { key: 'confidence', label: 'Confidence Level' },
                  { key: 'cityState', label: 'City & State' },
                ].map(col => (
                  <th key={col.key} style={{ minWidth: '150px' }}>
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
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
  );
}
