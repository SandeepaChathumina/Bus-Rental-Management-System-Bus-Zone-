import LostItem from '../models/lostItem.js';

// @desc    Report a lost item
// @route   POST /api/lost-items
// @access  Private
export const reportLostItem = async (req, res) => {
    try {
        const { itemName, description, dateLost, busNumber, deliveryAddress } = req.body;

        // Validation
        if (!itemName || !dateLost || !busNumber) {
            return res.status(400).json({ 
                message: 'Item name, date lost, and bus number are required' 
            });
        }

        // Validate bus number format
        const busNumberPattern = /^N[A-Z]\d{4}$/;
        if (!busNumberPattern.test(busNumber)) {
            return res.status(400).json({ 
                message: 'Bus number must be in format NT7657 (N + capital letter + 4 digits)' 
            });
        }

        // Validate date is not in the future
        const lostDate = new Date(dateLost);
        if (lostDate > new Date()) {
            return res.status(400).json({ 
                message: 'Date lost cannot be in the future' 
            });
        }

        const lostItem = new LostItem({
            itemName,
            description,
            dateLost: lostDate,
            busNumber: busNumber.toUpperCase(),
            deliveryAddress: deliveryAddress || '',
            reportedBy: req.user.role === 'admin' ? 'Admin' : 'User',
            user: req.user.role === 'passenger' ? req.user._id : undefined
        });

        await lostItem.save();
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

// @desc    Get lost items
// @route   GET /api/lost-items
// @access  Private
export const getLostItems = async (req, res) => {
    try {
        let query = {};

        // If user is not admin, only show their own items
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const lostItems = await LostItem.find(query)
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Lost items retrieved successfully',
            lostItems
        });

    } catch (error) {
        console.error('Get lost items error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update lost item
// @route   PUT /api/lost-items/:id
// @access  Private/Admin
export const updateLostItem = async (req, res) => {
    try {
        const { itemName, description, dateLost, busNumber, status, adminNotes } = req.body;

        // Validation
        if (!itemName || !dateLost || !busNumber) {
            return res.status(400).json({ 
                message: 'Item name, date lost, and bus number are required' 
            });
        }

        // Validate bus number format
        const busNumberPattern = /^N[A-Z]\d{4}$/;
        if (!busNumberPattern.test(busNumber)) {
            return res.status(400).json({ 
                message: 'Bus number must be in format NT7657 (N + capital letter + 4 digits)' 
            });
        }

        // Validate status if provided
        if (status && !['Reported', 'Found', 'Not Found', 'Claimed', 'Returned'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be one of: Reported, Found, Not Found, Claimed, Returned' 
            });
        }

        // Validate date is not in the future
        const lostDate = new Date(dateLost);
        if (lostDate > new Date()) {
            return res.status(400).json({ 
                message: 'Date lost cannot be in the future' 
            });
        }

        const updateData = {
            itemName,
            description,
            dateLost: lostDate,
            busNumber: busNumber.toUpperCase()
        };

        // Add optional fields if provided
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        const lostItem = await LostItem.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone');

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item not found' });
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

// @desc    Add admin reply to lost item and update status
// @route   POST /api/lost-items/:id/reply
// @access  Private/Admin
export const addAdminReply = async (req, res) => {
    try {
        const { adminReply, repliedBy, status } = req.body;

        if (!adminReply) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        // Validate status if provided
        if (status && !['Reported', 'Found', 'Not Found', 'Claimed', 'Returned'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be one of: Reported, Found, Not Found, Claimed, Returned' });
        }

        // Prepare update object
        const updateData = {
            adminReply,
            repliedBy: repliedBy || 'Admin',
            repliedAt: new Date()
        };

        // Add status to update if provided
        if (status) {
            updateData.status = status;
        }

        const lostItem = await LostItem.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone');

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item report not found' });
        }

        res.json({
            message: status ? `Admin reply added and status updated to ${status} successfully` : 'Admin reply added successfully',
            lostItem
        });

    } catch (error) {
        console.error('Add admin reply error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update delivery status and notes
// @route   PUT /api/lost-items/:id/delivery
// @access  Private/Admin
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryStatus, deliveryNotes } = req.body;

        // Validate delivery status
        if (deliveryStatus && !['Pending', 'In Transit', 'Delivered', 'Failed'].includes(deliveryStatus)) {
            return res.status(400).json({ 
                message: 'Invalid delivery status. Must be one of: Pending, In Transit, Delivered, Failed' 
            });
        }

        const updateData = {};
        if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
        if (deliveryNotes !== undefined) updateData.deliveryNotes = deliveryNotes;

        const lostItem = await LostItem.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email phone');

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item report not found' });
        }

        res.json({
            message: 'Delivery status updated successfully',
            lostItem
        });

    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Delete lost item
// @route   DELETE /api/lost-items/:id
// @access  Private/Admin
export const deleteLostItem = async (req, res) => {
    try {
        const lostItem = await LostItem.findByIdAndDelete(req.params.id);

        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item not found' });
        }

        res.json({
            message: 'Lost item deleted successfully',
            lostItem
        });

    } catch (error) {
        console.error('Delete lost item error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};