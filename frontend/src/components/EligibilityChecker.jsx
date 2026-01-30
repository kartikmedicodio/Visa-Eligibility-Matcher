import { useState, useEffect } from 'react';
import { profilesAPI, petitionsAPI, eligibilityAPI } from '../services/api';
import EligibilityResults from './EligibilityResults';

function EligibilityChecker() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const response = await profilesAPI.getAll();
      setProfiles(response.data);
      if (response.data.length > 0) {
        setSelectedProfileId(response.data[0].profile_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!selectedProfileId) {
      setError('Please select a profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults(null);
      const response = await eligibilityAPI.check(selectedProfileId);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfiles) {
    return <div className="loading">Loading profiles...</div>;
  }

  return (
    <div>
      <h1>Check Eligibility</h1>
      
      <div className="card">
        <div className="select-group">
          <label htmlFor="profile-select">Select Profile:</label>
          <select
            id="profile-select"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select a profile --</option>
            {profiles.map((profile) => (
              <option key={profile.profile_id} value={profile.profile_id}>
                {profile.full_name} ({profile.profile_id}) - {profile.target_profile_type}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCheckEligibility}
          disabled={loading || !selectedProfileId}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
        >
          {loading ? 'Checking Eligibility...' : 'Check Eligibility Against All Petitions'}
        </button>

        {error && <div className="error">{error}</div>}
      </div>

      {results && <EligibilityResults results={results} />}
    </div>
  );
}

export default EligibilityChecker;

