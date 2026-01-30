const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'profiles.json');

class ProfileRepository {
  async getAll() {
    const data = await fs.readJson(DATA_FILE);
    return data.profiles;
  }

  async getById(profileId) {
    const profiles = await this.getAll();
    return profiles.find(p => p.profile_id === profileId);
  }

  async create(profile) {
    const data = await fs.readJson(DATA_FILE);
    const maxId = Math.max(...data.profiles.map(p => parseInt(p.profile_id.replace('P', ''))), 0);
    const newIdNum = maxId + 1;
    const newId = `P${String(newIdNum).padStart(3, '0')}`;
    const newProfile = { ...profile, profile_id: newId };
    data.profiles.push(newProfile);
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return newProfile;
  }

  async update(profileId, updates) {
    const data = await fs.readJson(DATA_FILE);
    const index = data.profiles.findIndex(p => p.profile_id === profileId);
    if (index === -1) return null;
    data.profiles[index] = { ...data.profiles[index], ...updates };
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return data.profiles[index];
  }

  async delete(profileId) {
    const data = await fs.readJson(DATA_FILE);
    const index = data.profiles.findIndex(p => p.profile_id === profileId);
    if (index === -1) return false;
    data.profiles.splice(index, 1);
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return true;
  }
}

module.exports = new ProfileRepository();

