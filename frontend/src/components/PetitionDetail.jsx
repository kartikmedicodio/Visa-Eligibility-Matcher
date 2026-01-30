import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { petitionsAPI } from '../services/api';

function PetitionDetail() {
  const { id } = useParams();
  const [petition, setPetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPetition();
  }, [id]);

  const loadPetition = async () => {
    try {
      setLoading(true);
      const response = await petitionsAPI.getById(id);
      setPetition(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading petition...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!petition) return <div>Petition not found</div>;

  return (
    <div>
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        ← Back to Petitions
      </Link>
      
      <div className="card">
        <h1>{petition.visa_type} - {petition.country}</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{petition.category}</p>
        
        <div className="detail-section">
          <div className="detail-section-title">Target Profile</div>
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{petition.target_profile_type}</span>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">Hard Requirements</div>
          {Object.entries(petition.hard_requirements).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
              <span className="detail-value">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            </div>
          ))}
        </div>

        {petition.soft_requirements && (
          <div className="detail-section">
            <div className="detail-section-title">Soft Requirements</div>
            {Object.entries(petition.soft_requirements).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                <span className="detail-value">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {petition.legal_requirements && (
          <div className="detail-section">
            <div className="detail-section-title">Legal Requirements</div>
            {Object.entries(petition.legal_requirements).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                <span className="detail-value">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="detail-section">
          <div className="detail-section-title">Disqualifiers</div>
          <ul>
            {petition.disqualifiers.map((dq, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{dq}</li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">Profile Signals</div>
          <div>
            {petition.profile_signals.map((signal, idx) => (
              <span key={idx} className="tag">{signal}</span>
            ))}
          </div>
        </div>

        {petition.edge_case_handling && (
          <div className="detail-section">
            <div className="detail-section-title">Edge Case Handling</div>
            {Object.entries(petition.edge_case_handling).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        )}

        {petition.scoring_weights && (
          <div className="detail-section">
            <div className="detail-section-title">Scoring Weights (Points System)</div>
            <div className="detail-item">
              <span className="detail-label">Total Points:</span>
              <span className="detail-value" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {petition.scoring_weights.total_points} points
              </span>
            </div>
            
            {petition.scoring_weights.hard_requirements && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Hard Requirements:</strong>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {Object.entries(petition.scoring_weights.hard_requirements).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '0.25rem' }}>
                      {key.replace(/_/g, ' ')}: <strong>{value} points</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {petition.scoring_weights.soft_requirements && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Soft Requirements:</strong>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {Object.entries(petition.scoring_weights.soft_requirements).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '0.25rem' }}>
                      {key.replace(/_/g, ' ')}: <strong>{value} points</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {petition.scoring_weights.legal_requirements && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Legal Requirements:</strong>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {Object.entries(petition.scoring_weights.legal_requirements).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '0.25rem' }}>
                      {key.replace(/_/g, ' ')}: <strong>{value} points</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {petition.scoring_weights.bonus_points && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Bonus Points:</strong>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {Object.entries(petition.scoring_weights.bonus_points).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '0.25rem' }}>
                      {key.replace(/_/g, ' ')}: <strong>{value} points</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="detail-section">
          <div className="detail-item">
            <span className="detail-label">Tie Breaker Priority:</span>
            <span className="detail-value">{petition.tie_breaker_priority}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Confidence Level:</span>
            <span className="detail-value">{petition.confidence_level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetitionDetail;

