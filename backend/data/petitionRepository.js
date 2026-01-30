const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'petitions.json');

class PetitionRepository {
  async getAll() {
    const data = await fs.readJson(DATA_FILE);
    return data.petitions;
  }

  async getById(petitionId) {
    const petitions = await this.getAll();
    return petitions.find(p => p.petition_id === parseInt(petitionId));
  }

  async create(petition) {
    const data = await fs.readJson(DATA_FILE);
    const newId = Math.max(...data.petitions.map(p => p.petition_id), 0) + 1;
    const newPetition = { ...petition, petition_id: newId };
    data.petitions.push(newPetition);
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return newPetition;
  }

  async update(petitionId, updates) {
    const data = await fs.readJson(DATA_FILE);
    const index = data.petitions.findIndex(p => p.petition_id === parseInt(petitionId));
    if (index === -1) return null;
    data.petitions[index] = { ...data.petitions[index], ...updates };
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return data.petitions[index];
  }

  async delete(petitionId) {
    const data = await fs.readJson(DATA_FILE);
    const index = data.petitions.findIndex(p => p.petition_id === parseInt(petitionId));
    if (index === -1) return false;
    data.petitions.splice(index, 1);
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return true;
  }
}

module.exports = new PetitionRepository();

