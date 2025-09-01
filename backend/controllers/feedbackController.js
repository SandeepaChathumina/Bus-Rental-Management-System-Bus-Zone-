import Feedback from '../models/feedback.js';

const createFeedback = async (req, res) => {
  try {
    const { booking_id, type, title, description } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({ message: 'Type, title and description are required' });
    }

    const feedback = await Feedback.create({
      client_id: req.user._id,
      booking_id: booking_id || null,
      type,
      title,
      description
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('client_id', 'firstName lastName username')
      .populate('admin_id', 'firstName lastName username');

    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('client_id', 'firstName lastName username')
      .populate('admin_id', 'firstName lastName username')
      .sort({ send_date: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ client_id: req.user._id })
      .populate('admin_id', 'firstName lastName username')
      .sort({ send_date: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('client_id', 'firstName lastName username')
      .populate('admin_id', 'firstName lastName username');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.client_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }

    if (!feedback.is_editable) {
      return res.status(400).json({ message: 'Feedback cannot be edited after admin reply' });
    }

    const { title, description, type } = req.body;

    if (title) feedback.title = title;
    if (description) feedback.description = description;
    if (type) feedback.type = type;

    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('client_id', 'firstName lastName username')
      .populate('admin_id', 'firstName lastName username');

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminReply = async (req, res) => {
  try {
    const { admin_reply } = req.body;

    if (!admin_reply) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.admin_reply = admin_reply;
    feedback.admin_id = req.user._id;
    feedback.reply_date = new Date();
    feedback.status = 'replied';
    feedback.is_editable = false;

    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('client_id', 'firstName lastName username')
      .populate('admin_id', 'firstName lastName username');

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }


    if (feedback.client_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createFeedback,
  getAllFeedbacks,
  getUserFeedbacks,
  getFeedbackById,
  updateFeedback,
  adminReply,
  deleteFeedback
};