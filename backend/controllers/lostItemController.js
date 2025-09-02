import LostItem from '../models/lostItem.js';
import Booking from '../models/booking.js';

// @desc    Report a lost item (User or Admin)
// @route   POST /api/lost-items
// @access  Private
export const reportLostItem = async (req, res) => {
    try {
        const { itemName, description, dateLost, busNumber, bookingId } = req.body;

        // Basic validation
        if (!itemName || !busNumber) {
            return res.status(400).json({ message: 'Item name and bus number are required' });
        }

        let booking;
        // If a user is reporting, they must provide a booking ID to prove they were on the trip
        if (req.user.role === 'passenger') {
            if (!bookingId) {
                return res.status(400).json({ message: 'Booking ID is required for user reports' });
            }
            // Check if the booking belongs to the logged-in user
            booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found or does not belong to you' });
            }
        }

        // Create the lost item record
        const lostItem = await LostItem.create({
            itemName,
            description,
            dateLost: dateLost || new Date(),
            busNumber,
            reportedBy: req.user.role === 'admin' ? 'Admin' : 'User',
            user: req.user.role === 'passenger' ? req.user._id : undefined, // Link user only if it's a passenger report
            booking: req.user.role === 'passenger' ? bookingId : undefined // Link booking only if it's a passenger report
        });

        // Populate the user and booking details for the response
        await lostItem.populate('user', 'firstName lastName email');
        await lostItem.populate('booking');

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
            .populate('user', 'firstName lastName email')
            .populate('booking')
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
        ).populate('user', 'firstName lastName email').populate('booking');

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