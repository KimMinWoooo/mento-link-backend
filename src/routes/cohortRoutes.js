const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');

// Get all cohorts
router.get('/', cohortController.getCohorts);

// Get single cohort
router.get('/:id', cohortController.getCohort);

// Create cohort
router.post('/', cohortController.createCohort);

// Update cohort
router.put('/:id', cohortController.updateCohort);

// Delete cohort
router.delete('/:id', cohortController.deleteCohort);

module.exports = router; 