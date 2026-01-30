import { Link } from 'react-router-dom';

function EligibilityResults({ results }) {
  if (!results || results.length === 0) {
    return <div className="card">No results found</div>;
  }

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Eligibility Results</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Results sorted by matching score (highest first)
      </p>

      {results.map((result) => (
        <div key={result.petition_id} className="card" style={{ marginBottom: '1.5rem' }}>
          {result.error ? (
            <div className="error">
              <h3>{result.petition?.visa_type} - {result.petition?.country}</h3>
              <p>Error: {result.error}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    {result.petition?.visa_type} - {result.petition?.country}
                  </h3>
                  <p style={{ color: '#666' }}>{result.petition?.category}</p>
                  {result.match_strength && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="tag" style={{ 
                        background: result.match_strength === 'Very Strong' ? '#d4edda' : 
                                   result.match_strength === 'Strong' ? '#cfe2ff' :
                                   result.match_strength === 'Weak' ? '#fff3cd' : '#f8d7da',
                        color: result.match_strength === 'Very Strong' ? '#155724' :
                               result.match_strength === 'Strong' ? '#084298' :
                               result.match_strength === 'Weak' ? '#856404' : '#721c24',
                        fontWeight: '600'
                      }}>
                        Match: {result.match_strength}
                      </span>
                      {result.confidence_level && (
                        <span className="tag" style={{ marginLeft: '0.5rem' }}>
                          Confidence: {result.confidence_level}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`score-badge ${getScoreClass(result.score)}`} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
                    {result.score}/100
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {result.eligible ? (
                      <span className="eligible-badge">Eligible</span>
                    ) : (
                      <span className="not-eligible-badge">Not Eligible</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${result.score}%` }}
                >
                  {result.score}%
                </div>
              </div>

              {result.reasoning && result.reasoning.length > 0 && (
                <div className="reason-text" style={{ marginTop: '1rem' }}>
                  <strong>Normalized Reasoning:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    {result.reasoning.map((reason, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.overallReason && (
                <div className="reason-text" style={{ marginTop: result.reasoning ? '1rem' : '1rem' }}>
                  <strong>Overall Assessment:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{result.overallReason}</p>
                </div>
              )}

              {result.breakdown && Object.keys(result.breakdown).length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: '#333' }}>Score Breakdown</h4>
                  {Object.entries(result.breakdown).map(([category, details]) => (
                    <div key={category} className="breakdown-item">
                      <div className="breakdown-title">
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      {details.score !== undefined && details.max_score !== undefined && (
                        <div className="breakdown-score">
                          Score: {details.score} / {details.max_score}
                        </div>
                      )}
                      {details.match_details && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                          {details.match_details}
                        </p>
                      )}
                      {details.matched_items && details.matched_items.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Matched:</strong>
                          <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                            {details.matched_items.map((item, idx) => (
                              <li key={idx} style={{ fontSize: '0.9rem' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {details.missing_items && details.missing_items.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Missing:</strong>
                          <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                            {details.missing_items.map((item, idx) => (
                              <li key={idx} style={{ fontSize: '0.9rem', color: '#dc3545' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result.disqualifiers && result.disqualifiers.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#721c24' }}>Disqualifiers</h4>
                  {result.disqualifiers.map((dq, idx) => (
                    <div key={idx} className="disqualifier-item">
                      {dq}
                    </div>
                  ))}
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#0c5460' }}>Recommendations</h4>
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      {rec}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <Link
                  to={`/petitions/${result.petition_id}`}
                  className="btn btn-secondary"
                >
                  View Petition Details
                </Link>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default EligibilityResults;

