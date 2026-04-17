import React, { useState } from 'react';
import { Search, Sparkles, Building2, MapPin, Network } from 'lucide-react';

export function CompanyLookup() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    
    // Simulate AI search delay
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Company Lookup</h1>
          <p className="page-description">Map full enterprise hierarchies and manufacturing networks.</p>
        </div>
        
        <form onSubmit={handleSearch} className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="e.g. 'Tyson Foods', 'Conagra', 'Hearthside'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" style={{display: 'none'}}>Search</button>
        </form>

        {isSearching && (
          <div className="ai-status-banner">
            <Sparkles className="ai-status-icon" size={18} />
            <span className="ai-status-text">Mapping corporate hierarchy...</span>
            <span className="ai-status-detail">Checking M&A records and facility locators</span>
          </div>
        )}
      </header>

      {showResults ? (
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {/* Mock Hierarchy View */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <Building2 size={32} color="var(--accent-primary)" />
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Tyson Foods</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Parent Enterprise • HQ: Springdale, AR</p>
              </div>
            </div>
            
            <div style={{ padding: '1rem', borderLeft: '2px solid var(--border-strong)', marginLeft: '1rem' }}>
              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1rem', top: '0.5rem', width: '1rem', height: '2px', backgroundColor: 'var(--border-strong)' }}></div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Prepared Foods Division</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Business Unit</p>
                
                <div style={{ padding: '1rem 0 0 1rem', borderLeft: '1px solid var(--border-subtle)', marginLeft: '0.5rem', marginTop: '0.5rem' }}>
                  <div className="plant-card" style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div className="plant-card-header">
                      <h4 className="plant-name">Springdale Processing</h4>
                      <span className="badge badge-high">Active</span>
                    </div>
                    <div className="plant-address">
                      <MapPin size={14} /> Springdale, AR
                    </div>
                  </div>
                  <div className="plant-card" style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                    <div className="plant-card-header">
                      <h4 className="plant-name">Fayetteville Plant 2</h4>
                      <span className="badge badge-high">Active</span>
                    </div>
                    <div className="plant-address">
                      <MapPin size={14} /> Fayetteville, AR
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1rem', top: '0.5rem', width: '1rem', height: '2px', backgroundColor: 'var(--border-strong)' }}></div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>AdvancePierre Foods</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Acquisition (2017)</p>
                
                <div style={{ padding: '1rem 0 0 1rem', borderLeft: '1px solid var(--border-subtle)', marginLeft: '0.5rem', marginTop: '0.5rem' }}>
                  <div className="plant-card" style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                    <div className="plant-card-header">
                      <h4 className="plant-name">Enid Facility</h4>
                      <span className="badge badge-medium">Active</span>
                    </div>
                    <div className="plant-address">
                      <MapPin size={14} /> Enid, OK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <Network size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Map the Enterprise</h2>
            <p>Enter a company name to discover its full organizational structure and plant network.</p>
          </div>
        </div>
      )}
    </div>
  );
}
