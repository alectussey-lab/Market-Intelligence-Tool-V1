import React, { useState } from 'react';
import { Search, Sparkles, Network, Loader2 } from 'lucide-react';
import { getCompanyHierarchy, type HierarchyNode } from '../lib/gemini';

function HierarchyItem({ node, depth = 0 }: { node: HierarchyNode; depth?: number }) {
  return (
    <div className="hierarchy-item">
      {node.type !== 'parent' && (
        <div 
          className="node-connector line-appear" 
          style={{ animationDelay: `${depth * 0.3}s` }}
        ></div>
      )}
      <div 
        className={`hierarchy-node node-${node.type} node-appear`}
        style={{ animationDelay: `${depth * 0.3 + 0.1}s` }}
      >
        <span className="node-type">{node.type}</span>
        <span className="node-title">{node.name}</span>
        {node.details && <span className="node-details">{node.details}</span>}
        {node.status && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            {node.status}
          </div>
        )}
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="hierarchy-children">
          {node.children.map((child, idx) => (
            <HierarchyItem key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CompanyLookup() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hierarchy, setHierarchy] = useState<HierarchyNode | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    setHierarchy(null);
    
    try {
      const result = await getCompanyHierarchy(query);
      setHierarchy(result);
    } catch (error) {
      console.error("Hierarchy search failed:", error);
      alert("Failed to map enterprise. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="main-content" style={{ padding: 0, backgroundColor: '#0b1120', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={{ padding: '2rem', marginBottom: 0, zIndex: 10, background: 'linear-gradient(to bottom, #0b1120, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ color: '#fff' }}>Company Intelligence</h1>
            <p className="page-description" style={{ color: '#94a3b8' }}>Enterprise hierarchy and facility network mapper.</p>
          </div>
          
          <form onSubmit={handleSearch} className="search-bar-container search-dark">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Enter company name (e.g. Tyson Foods)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }} disabled={isSearching}>
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Map Network'}
            </button>
          </form>
        </div>

        {isSearching && (
          <div className="ai-status-banner" style={{ background: 'rgba(2, 132, 199, 0.1)', borderColor: 'rgba(2, 132, 199, 0.3)', marginTop: '1.5rem' }}>
            <Sparkles className="ai-status-icon" size={18} color="#38bdf8" />
            <span className="ai-status-text" style={{ color: '#38bdf8' }}>Tracing corporate lineages and M&A history...</span>
            <span className="ai-status-detail" style={{ color: '#7dd3fc' }}>Building high-fidelity relationship map</span>
          </div>
        )}
      </header>

      <div className="hierarchy-container">
        {hierarchy ? (
          <div className="hierarchy-root">
            <HierarchyItem node={hierarchy} />
          </div>
        ) : !isSearching && (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '10vh' }}>
            <Network size={64} style={{ marginBottom: '1rem' }} />
            <h2>Enterprise Mapper</h2>
            <p>Enter a parent company to visualize its full industrial structure</p>
          </div>
        )}

        {/* Legend */}
        <div className="hierarchy-legend">
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5 }}>Network Legend</h4>
          <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div> Parent Company</div>
          <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div> Business Unit</div>
          <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></div> Acquisition</div>
          <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#8b5cf6' }}></div> Business Segment</div>
          <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#ec4899' }}></div> Regional Cluster</div>
          <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: '#e31837' }}></div> Processing Plant</div>
        </div>
      </div>
    </div>
  );
}

