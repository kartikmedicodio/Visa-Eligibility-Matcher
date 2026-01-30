import { useState } from 'react';
import { createPortal } from 'react-dom';
import { PassportIcon } from './VisaVisuals';
import SectionInView from './SectionInView';

function ProfileDetailModal({ profile, onClose }) {
  if (!profile) return null;
  const edu = profile.education;
  const emp = profile.employment;
  const skills = profile.skills;
  const modal = (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Profile details">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{profile.full_name}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div style={{ color: 'var(--zinc-300)', fontSize: 'clamp(0.9rem, 0.5vw + 0.5rem, 1rem)' }}>
          <p><strong>Nationality:</strong> {profile.citizenship ?? '—'}</p>
          <p><strong>Current role:</strong> {emp?.current_role ?? '—'}</p>
          <p><strong>Industry:</strong> {emp?.industry ?? '—'}</p>
          <p><strong>Education:</strong> {edu?.highest_level ?? '—'}{edu?.fields?.length ? ` (${edu.fields.join(', ')})` : ''}</p>
          <p><strong>Years of experience:</strong> {emp?.years_of_experience ?? '—'}</p>
          {Array.isArray(skills) && skills.length > 0 && (
            <p style={{ marginTop: '0.5rem' }}><strong>Skills:</strong> {skills.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

export default function ProfilesTab({ profiles, loading, selectedProfileId, onSelectProfile }) {
  const [detailProfile, setDetailProfile] = useState(null);

  if (loading) {
    return <div className="loading">Loading profiles…</div>;
  }

  return (
    <SectionInView>
      <span className="section-label">PROFILES</span>
      <h2 className="section-headline">Applicant profiles</h2>
      <div className="card-grid">
        {profiles.map((profile) => {
          const edu = profile.education;
          const emp = profile.employment;
          const isSelected = selectedProfileId === profile.profile_id;
          return (
            <button
              key={profile.profile_id}
              type="button"
              className={`glass-card ${isSelected ? 'selected' : ''}`}
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
              onClick={() => onSelectProfile(profile.profile_id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, color: 'var(--purple-accent)' }}>
                  <PassportIcon id={`profile-${profile.profile_id}`} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.25rem' }}>{profile.full_name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--zinc-400)' }}>{profile.current_country ?? profile.citizenship ?? '—'}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--zinc-400)', marginBottom: '0.5rem' }}>
                {edu?.highest_level ?? '—'} · {emp?.years_of_experience ?? '—'} yrs
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                onClick={(e) => { e.stopPropagation(); setDetailProfile(profile); }}
              >
                View details
              </button>
            </button>
          );
        })}
      </div>
      {detailProfile && (
        <ProfileDetailModal profile={detailProfile} onClose={() => setDetailProfile(null)} />
      )}
    </SectionInView>
  );
}
