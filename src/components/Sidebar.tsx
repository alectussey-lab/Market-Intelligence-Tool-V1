import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Bookmark, 
  Download, 
  Settings,
  Leaf
} from 'lucide-react';

export function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <Leaf className="sidebar-title-icon" size={24} />
          Plant Intel
        </h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/product-lookup" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search className="nav-icon" size={20} />
          Product Lookup
        </NavLink>
        
        <NavLink to="/company-lookup" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Building2 className="nav-icon" size={20} />
          Company Lookup
        </NavLink>
        
        <div className="nav-divider"></div>
        
        <NavLink to="/saved-searches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bookmark className="nav-icon" size={20} />
          Saved Searches
        </NavLink>
        
        <NavLink to="/export-list" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Download className="nav-icon" size={20} />
          Export List
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings className="nav-icon" size={20} />
          Settings
        </NavLink>
      </nav>

      <div className="cost-meter">
        <div className="cost-meter-header">
          <span className="cost-meter-title">API Budget</span>
          <span className="cost-meter-value">$12.40 / $100</span>
        </div>
        <div className="cost-meter-bar-bg">
          <div className="cost-meter-bar-fill" style={{ width: '12.4%' }}></div>
        </div>
      </div>
    </div>
  );
}
