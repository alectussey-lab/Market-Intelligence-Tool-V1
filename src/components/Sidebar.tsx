
import { NavLink } from 'react-router-dom';
import { 
  Bookmark, 
  Download, 
  Settings,
  LayoutDashboard,
  FolderOpen,
  User
} from 'lucide-react';

export function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <img src="/src/assets/forpak-logo.png" alt="Forpak Automation" className="forpak-logo-img" />
        </h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard className="nav-icon" size={20} />
          Dashboard
        </NavLink>
        
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Lookups</h3>
          <NavLink to="/product-lookup" className={({ isActive }) => `nav-item sub-item ${isActive ? 'active' : ''}`}>
            <FolderOpen className="nav-icon" size={18} />
            Product Lookup
          </NavLink>
          <NavLink to="/company-lookup" className={({ isActive }) => `nav-item sub-item ${isActive ? 'active' : ''}`}>
            <FolderOpen className="nav-icon" size={18} />
            Plant Lookup
          </NavLink>
        </div>
        
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Saved Data</h3>
          <NavLink to="/saved-searches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bookmark className="nav-icon" size={20} />
            Saved Searches
          </NavLink>
          <NavLink to="/export-list" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Download className="nav-icon" size={20} />
            Export List
          </NavLink>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Settings</h3>
          <NavLink to="/profile" className={({ isActive }) => `nav-item sub-item-chevron ${isActive ? 'active' : ''}`}>
            <User className="nav-icon" size={18} />
            User Profile
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item sub-item-chevron ${isActive ? 'active' : ''}`}>
            <Settings className="nav-icon" size={18} />
            Account
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
