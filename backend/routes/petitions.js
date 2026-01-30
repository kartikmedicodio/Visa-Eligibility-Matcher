const express = require('express');
const router = express.Router();
const petitionRepository = require('../data/petitionRepository');

// GET all petitions
router.get('/', async (req, res) => {
  try {
    const petitions = await petitionRepository.getAll();
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET petition by ID
router.get('/:id', async (req, res) => {
  try {
    const petition = await petitionRepository.getById(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    res.json(petition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new petition
router.post('/', async (req, res) => {
  try {
    const petition = await petitionRepository.create(req.body);
    res.status(201).json(petition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update petition
router.put('/:id', async (req, res) => {
  try {
    const petition = await petitionRepository.update(req.params.id, req.body);
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    res.json(petition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE petition
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await petitionRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    res.json({ message: 'Petition deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

