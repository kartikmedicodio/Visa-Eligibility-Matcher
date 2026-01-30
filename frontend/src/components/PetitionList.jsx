import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { petitionsAPI } from '../services/api';

function PetitionList() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPetitions();
  }, []);

  const loadPetitions = async () => {
    try {
      setLoading(true);
      const response = await petitionsAPI.getAll();
      setPetitions(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading petitions...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h1>Petitions</h1>
      <div className="grid">
        {petitions.map((petition) => (
          <div key={petition.petition_id} className="card">
            <div className="card-title">
              {petition.visa_type} - {petition.country}
            </div>
            <div className="card-subtitle">{petition.category}</div>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Target: {petition.target_profile_type}
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <span className="tag">Priority: {petition.tie_breaker_priority}</span>
              <span className="tag">Confidence: {petition.confidence_level}</span>
            </div>
            <Link
              to={`/petitions/${petition.petition_id}`}
              className="btn btn-primary"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PetitionList;

