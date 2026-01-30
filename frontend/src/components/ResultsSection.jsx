import { useEffect, useRef, useState } from 'react';
import SectionInView from './SectionInView';

function getScoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 40) return 'score-medium';
  return 'score-low';
}

function ResultDetails({ result }) {
  const hasError = result.error;
  const score = result.score ?? 0;

  if (hasError) return null;

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--zinc-border)' }}>
      <div className="progress-bar" style={{ marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: `${Math.min(100, score)}%` }} />
      </div>

      {result.points_earned !== undefined && result.total_points !== undefined && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(24, 24, 27, 0.5)', borderRadius: '8px', border: '1px solid var(--zinc-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <strong style={{ color: 'var(--zinc-200)' }}>Points-Based Scoring:</strong>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>
              {result.points_earned} / {result.total_points} points
            </span>
          </div>
          {result.match_percentage !== undefined && (
            <div style={{ color: 'var(--zinc-400)', fontSize: '0.9rem' }}>
              Match Percentage: {result.match_percentage.toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {result.reasoning && result.reasoning.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--zinc-200)' }}>Normalized Reasoning:</strong>
          <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', color: 'var(--zinc-300)', lineHeight: 1.6 }}>
            {result.reasoning.map((reason, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {result.overallReason && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--zinc-200)' }}>Overall Assessment:</strong>
          <p style={{ marginTop: '0.5rem', color: 'var(--zinc-300)', lineHeight: 1.6 }}>{result.overallReason}</p>
        </div>
      )}

      {result.breakdown && Object.keys(result.breakdown).length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--white)', fontSize: '1rem' }}>Score Breakdown</h4>
          {Object.entries(result.breakdown).map(([category, details]) => (
            <div
              key={category}
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(24, 24, 27, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--zinc-border)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.5rem' }}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
              {details.score !== undefined && details.max_score !== undefined && (
                <div style={{ color: 'var(--zinc-400)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Points: {details.score} / {details.max_score}
                </div>
              )}
              {details.points && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong style={{ color: 'var(--zinc-300)', fontSize: '0.9rem' }}>Points Breakdown:</strong>
                  <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem', color: 'var(--zinc-400)', fontSize: '0.9rem' }}>
                    {Object.entries(details.points).map(([key, value]) => (
                      <li key={key}>{key.replace(/_/g, ' ')}: {value} points</li>
                    ))}
                  </ul>
                </div>
              )}
              {details.match_details && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--zinc-300)' }}>{details.match_details}</p>
              )}
              {details.matched_items && details.matched_items.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong style={{ color: 'var(--zinc-300)', fontSize: '0.9rem' }}>Matched:</strong>
                  <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem', color: 'var(--zinc-400)', fontSize: '0.9rem' }}>
                    {details.matched_items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {details.missing_items && details.missing_items.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong style={{ color: 'var(--zinc-300)', fontSize: '0.9rem' }}>Missing:</strong>
                  <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem', color: '#f87171', fontSize: '0.9rem' }}>
                    {details.missing_items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {result.disqualifiers && result.disqualifiers.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#f87171', fontSize: '1rem' }}>Disqualifiers</h4>
          {result.disqualifiers.map((dq, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                marginBottom: '0.35rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {dq}
            </div>
          ))}
        </div>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <div>
          <h4 style={{ marginBottom: '0.5rem', color: '#4ade80', fontSize: '1rem' }}>Recommendations</h4>
          {result.recommendations.map((rec, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#4ade80',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                marginBottom: '0.35rem',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsSection({
  results,
  selectedProfileId,
  profiles,
}) {
  const resultRef = useRef(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (results?.length && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  if (!results || results.length === 0) return null;

  const profile = profiles.find((p) => p.profile_id === selectedProfileId);

  return (
    <SectionInView>
      <div ref={resultRef} id="results-section">
        <span className="section-label">ELIGIBILITY RESULTS</span>
        <h2 className="section-headline">Eligibility outcome</h2>

        {profile && (
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--zinc-400)', marginBottom: '0.25rem' }}>Profile</div>
            <div style={{ fontWeight: 600, color: 'var(--white)' }}>{profile.full_name} ({profile.profile_id})</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--zinc-400)' }}>{profile.education?.highest_level ?? '—'} · {profile.employment?.years_of_experience ?? '—'} yrs</div>
          </div>
        )}

        <p style={{ color: 'var(--zinc-400)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Results sorted by matching score (highest first). Click a card or the dropdown to view full details.
        </p>

        <ul className="results-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map((result) => {
            const hasError = result.error;
            const eligible = result.eligible ?? false;
            const score = result.score ?? 0;
            const petitionInfo = result.petition;
            const scoreClass = getScoreClass(score);
            const isExpanded = expandedId === result.petition_id;

            const toggleExpanded = () => setExpandedId(isExpanded ? null : result.petition_id);

            return (
              <li
                key={result.petition_id}
                role="button"
                tabIndex={0}
                onClick={toggleExpanded}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(); } }}
                className={`result-list-item result-card-rounded ${eligible ? 'eligible' : ''}`}
                style={{
                  borderRadius: '14px',
                  padding: '1.25rem',
                  background: 'rgba(24, 24, 27, 0.6)',
                  border: eligible ? '1px solid var(--purple-accent)' : '1px solid var(--zinc-border)',
                  boxShadow: eligible ? '0 0 20px rgba(168, 85, 247, 0.15)' : 'none',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.25rem' }}>
                      {petitionInfo?.visa_type} — {petitionInfo?.country}
                    </h3>
                    {petitionInfo?.category && (
                      <p style={{ color: 'var(--zinc-400)', fontSize: '0.9rem' }}>{petitionInfo.category}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div className={`score-badge ${scoreClass}`} style={{ fontSize: '1rem', padding: '0.35rem 0.75rem' }}>
                      {score}/100
                    </div>
                    <span className={eligible ? 'badge-eligible' : 'badge-not-eligible'}>
                      {eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleExpanded(); }}
                      className="result-dropdown-trigger"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse details' : 'View details'}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--zinc-border)',
                        borderRadius: '8px',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--zinc-300)',
                        transition: 'color 0.2s, border-color 0.2s, transform 0.2s',
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {hasError && (
                  <div className="error" style={{ marginTop: '0.75rem' }}>{result.error}</div>
                )}

                {!hasError && isExpanded && (
                  <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <ResultDetails result={result} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </SectionInView>
  );
}
