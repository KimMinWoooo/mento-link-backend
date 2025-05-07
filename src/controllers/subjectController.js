const Subject = require('../models/Subject');

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('cohort', 'number')
      .sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subjects by cohort
exports.getSubjectsByCohort = async (req, res) => {
  try {
    const subjects = await Subject.find({ cohort: req.params.cohortId })
      .populate('cohort', 'number')
      .sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single subject
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('cohort', 'number');
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create subject
exports.createSubject = async (req, res) => {
  const subject = new Subject({
    name: req.body.name,
    code: req.body.code,
    cohort: req.body.cohortId,
    mentor: req.body.mentor,
    mentees: req.body.mentees || []
  });

  try {
    const newSubject = await subject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (req.body.name) subject.name = req.body.name;
    if (req.body.code) subject.code = req.body.code;
    if (req.body.cohortId) subject.cohort = req.body.cohortId;
    if (req.body.mentor) subject.mentor = req.body.mentor;
    if (req.body.mentees) subject.mentees = req.body.mentees;

    const updatedSubject = await subject.save();
    res.json(updatedSubject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 