import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { profilesAPI, petitionsAPI, eligibilityAPI } from './services/api';
import TabsContainer from './components/TabsContainer';
import ResultsSection from './components/ResultsSection';

function App() {
  const [profiles, setProfiles] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingPetitions, setLoadingPetitions] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedPetitionId, setSelectedPetitionId] = useState('');
  const [results, setResults] = useState(null);
  const [checking, setChecking] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProfiles(true);
        const res = await profilesAPI.getAll();
        if (!cancelled) {
          setProfiles(res.data ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingPetitions(true);
        const res = await petitionsAPI.getAll();
        if (!cancelled) {
          setPetitions(res.data ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingPetitions(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (h > 0) setScrollProgress((window.scrollY / h) * 100);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clear results when user changes the selected profile (must check again)
  useEffect(() => {
    setResults(null);
  }, [selectedProfileId]);

  const handleCheckEligibility = useCallback(async () => {
    if (!selectedProfileId) return;
    setError(null);
    setResults(null);
    setAnalysisComplete(false);
    setChecking(true);
    try {
      const res = await eligibilityAPI.check(selectedProfileId);
      setResults(res.data ?? []);
      setShowNewApplication(true);
      setAnalysisComplete(true);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to check eligibility');
      setChecking(false);
    }
  }, [selectedProfileId]);

  // After "analysis complete" is shown, hide overlay and reveal results
  useEffect(() => {
    if (!analysisComplete || !checking) return;
    const t = setTimeout(() => {
      setChecking(false);
      setAnalysisComplete(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [analysisComplete, checking]);

  const handleNewApplication = useCallback(() => {
    setResults(null);
    setShowNewApplication(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="background-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-dark" />
        <div className="orb orb-dark-2" />
      </div>
      <div className="floating-balls">
        <div className="floating-ball" />
        <div className="floating-ball" />
        <div className="floating-ball" />
        <div className="floating-ball" />
        <div className="floating-ball" />
        <div className="floating-ball" />
      </div>

      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Visa Eligibility Determination System</h1>
        </div>
      </header>

      <main className="main-content">
        <TabsContainer
          activeTab={activeTab}
          onTabChange={setActiveTab}
          profiles={profiles}
          petitions={petitions}
          loadingProfiles={loadingProfiles}
          loadingPetitions={loadingPetitions}
          selectedProfileId={selectedProfileId}
          selectedPetitionId={selectedPetitionId}
          onSelectProfile={setSelectedProfileId}
          onSelectPetition={setSelectedPetitionId}
          onCheckEligibility={handleCheckEligibility}
          checking={checking}
          analysisComplete={analysisComplete}
          error={error}
        />

        {activeTab === 'check' && results != null && (
          <ResultsSection
            results={results}
            selectedProfileId={selectedProfileId}
            profiles={profiles}
          />
        )}
      </main>
    </div>
  );
}

export default App;
