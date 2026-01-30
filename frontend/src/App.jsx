import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PetitionList from './components/PetitionList';
import ProfileList from './components/ProfileList';
import EligibilityChecker from './components/EligibilityChecker';
import PetitionDetail from './components/PetitionDetail';
import ProfileDetail from './components/ProfileDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">Visa Eligibility Matcher</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Petitions</Link>
              <Link to="/profiles" className="nav-link">Profiles</Link>
              <Link to="/eligibility" className="nav-link">Check Eligibility</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PetitionList />} />
            <Route path="/petitions/:id" element={<PetitionDetail />} />
            <Route path="/profiles" element={<ProfileList />} />
            <Route path="/profiles/:id" element={<ProfileDetail />} />
            <Route path="/eligibility" element={<EligibilityChecker />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
