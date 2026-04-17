import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Download, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type Confidence = 'High' | 'Medium' | 'Low';

interface CompanyRecord {
  id: string;
  parentCompany: string;
  companyName: string;
  productsMade: string;
  confidence: Confidence;
  cityState: string;
}

const generateMockData = (): CompanyRecord[] => {
  const baseData: CompanyRecord[] = [
    { id: '1', parentCompany: 'Tyson Foods', companyName: 'Springdale Processing', productsMade: 'IQF Chicken, Breaded Tenders', confidence: 'High', cityState: 'Springdale, AR' },
    { id: '2', parentCompany: 'Conagra', companyName: 'Former Bakery Div', productsMade: 'Pizza Crust', confidence: 'Low', cityState: 'Omaha, NE' },
    { id: '3', parentCompany: 'Hearthside Food Solutions', companyName: 'Facility 4A (Unlisted)', productsMade: 'Frozen Waffles, Cookies', confidence: 'Medium', cityState: 'McComb, OH' },
    { id: '4', parentCompany: 'JBS USA', companyName: 'Plumrose USA', productsMade: 'Sliced Bacon, Deli Meats', confidence: 'High', cityState: 'Council Bluffs, IA' },
    { id: '5', parentCompany: 'Kellogg Company', companyName: 'MorningStar Farms', productsMade: 'Veggie Patties, Plant-Based Links', confidence: 'High', cityState: 'Zanesville, OH' },
    { id: '6', parentCompany: 'Nestlé', companyName: "Stouffer's Plant", productsMade: 'Frozen Mac & Cheese, Lasagna', confidence: 'Medium', cityState: 'Gaffney, SC' },
  ];
  
  const additional: CompanyRecord[] = [];
  for(let i = 7; i <= 25; i++) {
    additional.push({
      id: i.toString(),
      parentCompany: `Generic Corp ${i}`,
      companyName: `Facility ${i}`,
      productsMade: `Product ${i}A, Product ${i}B`,
      confidence: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
      cityState: `City ${i}, ST`
    });
  }
  return [...baseData, ...additional];
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
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
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
    </div>
  );
}
