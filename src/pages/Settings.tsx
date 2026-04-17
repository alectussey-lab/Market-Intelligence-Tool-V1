
import { Save, Database, Key, HardDrive } from 'lucide-react';

export function Settings() {
  return (
    <div className="page-container" style={{ overflowY: 'auto' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage API keys, database connections, and cost controls.</p>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '800px' }}>
        
        <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <Key size={20} color="var(--accent-primary)" />
            AI Configuration
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>AI Provider</label>
            <select style={{ width: '100%', maxWidth: '300px' }}>
              <option>Gemini 3.1 Pro (Recommended)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Claude 3 Opus</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>API Key</label>
            <input type="password" style={{ width: '100%' }} placeholder="sk-..." />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Your key is stored locally in your browser.</p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Monthly Budget Cap ($)</label>
            <input type="number" style={{ width: '100%', maxWidth: '150px' }} defaultValue={100} />
          </div>
        </section>

        <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <Database size={20} color="var(--accent-primary)" />
            Supabase Connection
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Project URL</label>
            <input type="text" style={{ width: '100%' }} placeholder="https://xyzcompany.supabase.co" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Anon Key</label>
            <input type="password" style={{ width: '100%' }} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
          </div>
          
          <button className="btn btn-secondary">Test Connection</button>
        </section>

        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <HardDrive size={20} color="var(--accent-primary)" />
            Data Backup
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Automatic weekly backups are saved to Google Drive. You can also trigger a manual backup.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary"><Save size={16} /> Backup to Google Drive</button>
            <button className="btn btn-secondary">Restore from Backup</button>
          </div>
        </section>

      </div>
    </div>
  );
}
