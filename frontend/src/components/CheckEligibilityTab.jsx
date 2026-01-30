import { createPortal } from 'react-dom';
import SectionInView from './SectionInView';

export default function CheckEligibilityTab({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onCheckEligibility,
  checking,
  error,
}) {
  const canSubmit = selectedProfileId && !checking;

  return (
    <SectionInView>
      <span className="section-label">CHECK ELIGIBILITY</span>
      <h2 className="section-headline">Match a profile to a petition</h2>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="glass-card" style={{ maxWidth: 560, width: '100%' }}>
        <div className="form-group">
          <label htmlFor="profile-select" className="form-label">Select Profile</label>
          <select
            id="profile-select"
            className="form-input form-select"
            value={selectedProfileId}
            onChange={(e) => onSelectProfile(e.target.value)}
            disabled={checking}
          >
            <option value="">— Select a profile —</option>
            {profiles.map((p) => (
              <option key={p.profile_id} value={p.profile_id}>
                {p.full_name} ({p.profile_id})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canSubmit}
          onClick={onCheckEligibility}
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {checking ? 'Checking…' : 'Check eligibility'}
        </button>
        {error && <div className="error" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>
      </div>

      {checking &&
        createPortal(
          <div className="processing-overlay">
            <div className="processing-bubble" />
            <div className="processing-content">
              <div className="spinner" />
              <div className="processing-title">Analyzing profile…</div>
              <div className="processing-subtitle">Matching petition requirements…</div>
            </div>
          </div>,
          document.body
        )}
    </SectionInView>
  );
}
