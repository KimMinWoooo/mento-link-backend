const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all subjects
router.get('/', subjectController.getSubjects);

// Get subjects by cohort
router.get('/cohort/:cohortId', subjectController.getSubjectsByCohort);

// Get single subject
router.get('/:id', subjectController.getSubject);

// Create subject
router.post('/', authMiddleware, subjectController.createSubject);

// Update subject
router.put('/:id', subjectController.updateSubject);

// Delete subject
router.delete('/:id', subjectController.deleteSubject);

module.exports = router; 