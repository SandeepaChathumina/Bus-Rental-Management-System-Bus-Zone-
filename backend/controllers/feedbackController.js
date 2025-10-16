import Feedback from '../models/feedback.js';

const createFeedback = async (req, res) => {
  try {
    const { booking_id, type, title, description, rating } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: 'Type and title are required' });
    }

    const feedback = await Feedback.create({
      client_id: req.user._id,
      booking_id: booking_id || null,
      type,
      title,
      description,
      rating: type === 'feedback' ? (rating || 5) : undefined
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

// NEW: Public endpoint for positive testimonials (no auth required)
const getPublicTestimonials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Fetch positive feedbacks for public display
    const testimonials = await Feedback.find({
      type: 'feedback',
      status: 'replied', // Only show replied feedbacks for credibility
      $or: [
        { rating: { $gte: 4 } }, // Rating 4 or 5
        { rating: { $exists: false } } // Or no rating (assuming positive)
      ]
    })
    .populate('client_id', 'firstName lastName username')
    .sort({ send_date: -1 })
    .limit(parseInt(limit));

    // Transform data for public consumption (hide sensitive info)
    const publicTestimonials = testimonials.map(feedback => ({
      _id: feedback._id,
      title: feedback.title,
      description: feedback.description,
      rating: feedback.rating || 5,
      type: feedback.type,
      send_date: feedback.send_date,
      customer: {
        name: feedback.client_id?.firstName && feedback.client_id?.lastName 
          ? `${feedback.client_id.firstName} ${feedback.client_id.lastName}`
          : feedback.client_id?.username || 'Anonymous Customer',
        // Don't expose full user details for privacy
      }
    }));

    res.json(publicTestimonials);
  } catch (error) {
    console.error('Error fetching public testimonials:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

const getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ client_id: req.user._id })
      .populate('client_id', 'firstName lastName username')
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

    const { title, description, type, rating } = req.body;

    if (title) feedback.title = title;
    if (description) feedback.description = description;
    if (type) feedback.type = type;
    if (type === 'feedback' && rating !== undefined) feedback.rating = rating;

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

const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, replied, closed)' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
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
  getPublicTestimonials,
  getUserFeedbacks,
  getFeedbackById,
  updateFeedback,
  adminReply,
  updateFeedbackStatus,
  deleteFeedback
};