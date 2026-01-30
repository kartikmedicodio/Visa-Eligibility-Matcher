const express = require('express');
const router = express.Router();
const eligibilityService = require('../services/eligibilityService');

// POST check eligibility for a profile against all petitions or a specific petition
router.post('/check', async (req, res) => {
  try {
    const { profileId, petitionId } = req.body;
    
    if (!profileId) {
      return res.status(400).json({ error: 'profileId is required' });
    }

    const results = await eligibilityService.checkEligibility(profileId, petitionId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST check eligibility for specific profile and petition
router.post('/check/:profileId/:petitionId', async (req, res) => {
  try {
    const { profileId, petitionId } = req.params;
    const results = await eligibilityService.checkEligibility(profileId, parseInt(petitionId));
    res.json(results[0] || { error: 'No results found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

