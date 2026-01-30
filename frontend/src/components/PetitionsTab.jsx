import { useState } from 'react';
import { createPortal } from 'react-dom';
import { VisaStampIcon } from './VisaVisuals';
import SectionInView from './SectionInView';

function formatRequirementValue(value) {
  if (value == null) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function PetitionDetailModal({ petition, onClose }) {
  if (!petition) return null;
  const hard = petition.hard_requirements;
  const soft = petition.soft_requirements;
  const hardEntries = hard && typeof hard === 'object' ? Object.entries(hard) : [];
  const softEntries = soft && typeof soft === 'object' ? Object.entries(soft) : [];
  const modal = (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Petition details">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{petition.visa_type} — {petition.country}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div style={{ color: 'var(--zinc-300)', fontSize: 'clamp(0.9rem, 0.5vw + 0.5rem, 1rem)' }}>
          <p><strong>Petition ID:</strong> {petition.petition_id}</p>
          <p><strong>Category:</strong> {petition.category}</p>
          <p><strong>Target profile:</strong> {petition.target_profile_type}</p>
          {hardEntries.length > 0 && (
            <>
              <p style={{ marginTop: '0.75rem' }}><strong>Hard requirements:</strong></p>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem' }}>
                {hardEntries.map(([key, value]) => (
                  <li key={key}>{formatLabel(key)}: {formatRequirementValue(value)}</li>
                ))}
              </ul>
            </>
          )}
          {softEntries.length > 0 && (
            <>
              <p style={{ marginTop: '0.75rem' }}><strong>Soft requirements:</strong></p>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem' }}>
                {softEntries.map(([key, value]) => (
                  <li key={key}>{formatLabel(key)}: {formatRequirementValue(value)}</li>
                ))}
              </ul>
            </>
          )}
          {petition.disqualifiers?.length > 0 && (
            <>
              <p style={{ marginTop: '0.75rem' }}><strong>Disqualifiers:</strong></p>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem', color: 'var(--zinc-400)' }}>
                {petition.disqualifiers.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

function shortSummary(petition) {
  const parts = [];
  if (petition.target_profile_type) parts.push(petition.target_profile_type);
  if (petition.category) parts.push(petition.category);
  return parts.length ? parts.join(' · ') : 'Employment-based visa';
}

export default function PetitionsTab({ petitions, loading, selectedPetitionId, onSelectPetition }) {
  const [detailPetition, setDetailPetition] = useState(null);

  if (loading) {
    return <div className="loading">Loading petitions…</div>;
  }

  return (
    <SectionInView>
      <span className="section-label">PETITIONS</span>
      <h2 className="section-headline">Available visa petitions</h2>
      <div className="card-grid">
        {petitions.map((petition) => {
          const isSelected = selectedPetitionId === String(petition.petition_id);
          return (
            <button
              key={petition.petition_id}
              type="button"
              className={`glass-card ${isSelected ? 'selected' : ''}`}
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
              onClick={() => onSelectPetition(String(petition.petition_id))}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, color: 'var(--purple-accent)' }}>
                  <VisaStampIcon id={`petition-${petition.petition_id}`} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.25rem' }}>
                    {petition.visa_type} — {petition.country}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--zinc-400)' }}>ID: {petition.petition_id}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--zinc-400)' }}>{shortSummary(petition)}</div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                onClick={(e) => { e.stopPropagation(); setDetailPetition(petition); }}
              >
                View criteria
              </button>
            </button>
          );
        })}
      </div>
      {detailPetition && (
        <PetitionDetailModal petition={detailPetition} onClose={() => setDetailPetition(null)} />
      )}
    </SectionInView>
  );
}
