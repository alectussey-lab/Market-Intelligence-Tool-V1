import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductLookup } from './pages/ProductLookup';
import { CompanyLookup } from './pages/CompanyLookup';
import { Settings } from './pages/Settings';
import './App.css';

// Placeholder components for incomplete pages
const Dashboard = () => <div className="page-container"><header className="page-header"><h1 className="page-title">Dashboard</h1></header><div style={{padding: '2rem'}}>Dashboard overview will appear here.</div></div>;
const SavedSearches = () => <div className="page-container"><header className="page-header"><h1 className="page-title">Saved Searches</h1></header><div style={{padding: '2rem'}}>Saved queries will appear here.</div></div>;
const ExportList = () => <div className="page-container"><header className="page-header"><h1 className="page-title">Export List</h1></header><div style={{padding: '2rem'}}>Plants flagged for export will appear here.</div></div>;
const Profile = () => <div className="page-container"><header className="page-header"><h1 className="page-title">User Profile</h1></header><div style={{padding: '2rem'}}>User profile settings will appear here.</div></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/product-lookup" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="product-lookup" element={<ProductLookup />} />
          <Route path="company-lookup" element={<CompanyLookup />} />
          <Route path="saved-searches" element={<SavedSearches />} />
          <Route path="export-list" element={<ExportList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
