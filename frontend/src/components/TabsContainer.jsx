import ProfilesTab from './ProfilesTab';
import PetitionsTab from './PetitionsTab';
import CheckEligibilityTab from './CheckEligibilityTab';

const TABS = [
  { id: 'profiles', label: 'Profiles' },
  { id: 'petitions', label: 'Petitions' },
  { id: 'check', label: 'Check Eligibility' },
];

export default function TabsContainer({
  activeTab,
  onTabChange,
  profiles,
  petitions,
  loadingProfiles,
  loadingPetitions,
  selectedProfileId,
  selectedPetitionId,
  onSelectProfile,
  onSelectPetition,
  onCheckEligibility,
  checking,
  error,
}) {
  return (
    <div className="tabs-container">
      <div className="tabs-list" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`tab-button${isActive ? ' active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              tabIndex={isActive ? 0 : -1}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profiles' && (
        <div id="panel-profiles" role="tabpanel" aria-labelledby="tab-profiles" className="tab-panel">
          <ProfilesTab
            profiles={profiles}
            loading={loadingProfiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={onSelectProfile}
          />
        </div>
      )}

      {activeTab === 'petitions' && (
        <div id="panel-petitions" role="tabpanel" aria-labelledby="tab-petitions" className="tab-panel">
          <PetitionsTab
            petitions={petitions}
            loading={loadingPetitions}
            selectedPetitionId={selectedPetitionId}
            onSelectPetition={onSelectPetition}
          />
        </div>
      )}

      {activeTab === 'check' && (
        <div id="panel-check" role="tabpanel" aria-labelledby="tab-check" className="tab-panel">
          <CheckEligibilityTab
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={onSelectProfile}
            onCheckEligibility={onCheckEligibility}
            checking={checking}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
