import LostItem from '../models/lostItem.js';
import User from '../models/user.js';

// @desc    Report a lost item (User or Admin)
// @route   POST /api/lost-items
// @access  Private
export const reportLostItem = async (req, res) => {
    try {
        const { itemName, description, dateLost, busNumber } = req.body;

        // Basic validation
        if (!itemName || !busNumber) {
            return res.status(400).json({ message: 'Item name and bus number are required' });
        }

        // Create the lost item record
        const lostItem = await LostItem.create({
            itemName,
            description,
            dateLost: dateLost || new Date(),
            busNumber,
            reportedBy: req.user.role === 'admin' ? 'Admin' : 'User',
            user: req.user.role === 'passenger' ? req.user._id : undefined,
        });

        // Populate the user details for the response
        await lostItem.populate('user', 'firstName lastName email phone');

        res.status(201).json({
            message: 'Lost item reported successfully',
            lostItem
        });

    } catch (error) {
        console.error('Report lost item error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get all lost items (Admin can see all, Users see only their reports)
// @route   GET /api/lost-items
// @access  Private
export const getLostItems = async (req, res) => {
    try {
        let query = {};
        // If the user is not an admin, only show them their own reports
        if (req.user.role !== 'admin') {
            query = { user: req.user._id };
        }

        const lostItems = await LostItem.find(query)
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 }); // Newest first

        res.json({
            count: lostItems.length,
            lostItems
        });

    } catch (error) {
        console.error('Get lost items error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update a lost item (e.g., mark as found, add admin notes)
// @route   PUT /api/lost-items/:id
// @access  Private/Admin
export const updateLostItem = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const allowedUpdates = {};

        // Only allow updating status and adminNotes
        if (status) allowedUpdates.status = status;
        if (adminNotes !== undefined) allowedUpdates.adminNotes = adminNotes;

        const lostItem = await LostItem.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true } // Return the updated document and run validation
        ).populate('user', 'firstName lastName email phone');

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item report not found' });
        }

        res.json({
            message: 'Lost item updated successfully',
            lostItem
        });

    } catch (error) {
        console.error('Update lost item error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Add admin reply to lost item
// @route   POST /api/lost-items/:id/reply
// @access  Private/Admin
export const addAdminReply = async (req, res) => {
    try {
        const { adminReply, repliedBy } = req.body;

        if (!adminReply) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        const lostItem = await LostItem.findByIdAndUpdate(
            req.params.id,
            { 
                adminReply,
                repliedBy: repliedBy || 'Admin',
                repliedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone');

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item report not found' });
        }

        res.json({
            message: 'Admin reply added successfully',
            lostItem
        });

    } catch (error) {
        console.error('Add admin reply error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Delete a lost item report
// @route   DELETE /api/lost-items/:id
// @access  Private/Admin
export const deleteLostItem = async (req, res) => {
    try {
        const lostItem = await LostItem.findByIdAndDelete(req.params.id);

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item report not found' });
        }

        res.json({ message: 'Lost item report deleted successfully' });

    } catch (error) {
        console.error('Delete lost item error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};