import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profilesAPI } from '../services/api';

function ProfileDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profilesAPI.getById(id);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div>
      <Link to="/profiles" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        ← Back to Profiles
      </Link>
      
      <div className="card">
        <h1>{profile.full_name}</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {profile.citizenship} → {profile.target_countries.join(', ')}
        </p>
        
        <div className="detail-section">
          <div className="detail-section-title">Profile Information</div>
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{profile.target_profile_type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Current Country:</span>
            <span className="detail-value">{profile.current_country}</span>
          </div>
        </div>

        {profile.education && (
          <div className="detail-section">
            <div className="detail-section-title">Education</div>
            <div className="detail-item">
              <span className="detail-label">Highest Level:</span>
              <span className="detail-value">{profile.education.highest_level}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fields:</span>
              <span className="detail-value">{profile.education.fields.join(', ')}</span>
            </div>
          </div>
        )}

        {profile.employment && (
          <div className="detail-section">
            <div className="detail-section-title">Employment</div>
            <div className="detail-item">
              <span className="detail-label">Current Role:</span>
              <span className="detail-value">{profile.employment.current_role}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Industry:</span>
              <span className="detail-value">{profile.employment.industry}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Years of Experience:</span>
              <span className="detail-value">{profile.employment.years_of_experience}</span>
            </div>
            {profile.employment.job_requires_specialization !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Job Requires Specialization:</span>
                <span className="detail-value">{String(profile.employment.job_requires_specialization)}</span>
              </div>
            )}
            {profile.employment.employer_sponsorship_available !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Employer Sponsorship Available:</span>
                <span className="detail-value">{String(profile.employment.employer_sponsorship_available)}</span>
              </div>
            )}
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Skills</div>
            <div>
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {profile.legal_status && (
          <div className="detail-section">
            <div className="detail-section-title">Legal Status</div>
            <div className="detail-item">
              <span className="detail-label">Current Visa:</span>
              <span className="detail-value">{profile.legal_status.current_visa}</span>
            </div>
          </div>
        )}

        {profile.achievements && (
          <div className="detail-section">
            <div className="detail-section-title">Achievements</div>
            {Object.entries(profile.achievements).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                <span className="detail-value">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {profile.language_tests && Object.keys(profile.language_tests).length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Language Tests</div>
            {Object.entries(profile.language_tests).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key}:</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        )}

        {profile.canada_profile && (
          <div className="detail-section">
            <div className="detail-section-title">Canada Profile</div>
            {Object.entries(profile.canada_profile).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                <span className="detail-value">
                  {typeof value === 'boolean' ? String(value) : value}
                </span>
              </div>
            ))}
          </div>
        )}

        {profile.business_profile && (
          <div className="detail-section">
            <div className="detail-section-title">Business Profile</div>
            {Object.entries(profile.business_profile).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                <span className="detail-value">
                  {typeof value === 'boolean' ? String(value) : value}
                </span>
              </div>
            ))}
          </div>
        )}

        {profile.signals && profile.signals.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Signals</div>
            <div>
              {profile.signals.map((signal, idx) => (
                <span key={idx} className="tag">{signal}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileDetail;

