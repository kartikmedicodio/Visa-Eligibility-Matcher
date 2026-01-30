const express = require('express');
const router = express.Router();
const profileRepository = require('../data/profileRepository');

// GET all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await profileRepository.getAll();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await profileRepository.getById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new profile
router.post('/', async (req, res) => {
  try {
    const profile = await profileRepository.create(req.body);
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update profile
router.put('/:id', async (req, res) => {
  try {
    const profile = await profileRepository.update(req.params.id, req.body);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE profile
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await profileRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

