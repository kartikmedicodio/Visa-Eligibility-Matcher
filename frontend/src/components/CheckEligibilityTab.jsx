import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import SectionInView from './SectionInView';

const LOTTIE_SRC = '/Ai-powered%20marketing%20tools%20abstract.lottie';

export default function CheckEligibilityTab({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onCheckEligibility,
  checking,
  analysisComplete,
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
          <div
            className="processing-overlay"
            role="status"
            aria-live="polite"
            aria-label={analysisComplete ? 'Analysis complete' : 'Analyzing profile'}
          >
            <div className="processing-bubble" aria-hidden="true" />
            <div className={`processing-content ${analysisComplete ? 'processing-complete' : ''}`}>
              {analysisComplete ? (
                <div className="processing-done" aria-hidden="true">
                  <div className="processing-check" />
                  <div className="processing-title">User analysis complete</div>
                  <div className="processing-subtitle">Showing eligibility results...</div>
                </div>
              ) : (
                <>
                  <div className="lottie-loading" aria-hidden="true">
                    <DotLottieReact src={LOTTIE_SRC} loop autoplay style={{ width: 200, height: 200 }} />
                  </div>
                  <div className="processing-title">Analyzing profile...</div>
                  <div className="processing-subtitle">AI is matching profile with petition criteria...</div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </SectionInView>
  );
}
