const Cohort = require('../models/Cohort');

// Get all cohorts
exports.getCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.find().sort({ number: -1 });
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single cohort
exports.getCohort = async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }
    res.json(cohort);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create cohort
exports.createCohort = async (req, res) => {
  const cohort = new Cohort({
    number: req.body.number,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    lmsUrl: req.body.lmsUrl,
    funSystemUrl: req.body.funSystemUrl
  });

  try {
    const newCohort = await cohort.save();
    res.status(201).json(newCohort);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update cohort
exports.updateCohort = async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    if (req.body.number) cohort.number = req.body.number;
    if (req.body.startDate) cohort.startDate = req.body.startDate;
    if (req.body.endDate) cohort.endDate = req.body.endDate;
    if (req.body.lmsUrl) cohort.lmsUrl = req.body.lmsUrl;
    if (req.body.funSystemUrl) cohort.funSystemUrl = req.body.funSystemUrl;
    if (req.body.isActive !== undefined) cohort.isActive = req.body.isActive;

    const updatedCohort = await cohort.save();
    res.json(updatedCohort);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete cohort
exports.deleteCohort = async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    await cohort.deleteOne();
    res.json({ message: 'Cohort deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 