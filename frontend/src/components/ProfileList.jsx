import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profilesAPI } from '../services/api';

function ProfileList() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await profilesAPI.getAll();
      setProfiles(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading profiles...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h1>Profiles</h1>
      <div className="grid">
        {profiles.map((profile) => (
          <div key={profile.profile_id} className="card">
            <div className="card-title">{profile.full_name}</div>
            <div className="card-subtitle">
              {profile.citizenship} → {profile.target_countries.join(', ')}
            </div>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Type: {profile.target_profile_type}
            </p>
            {profile.education && (
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Education: {profile.education.highest_level} in {profile.education.fields.join(', ')}
              </p>
            )}
            {profile.employment && (
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Role: {profile.employment.current_role} ({profile.employment.years_of_experience} years)
              </p>
            )}
            <Link
              to={`/profiles/${profile.profile_id}`}
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

export default ProfileList;

