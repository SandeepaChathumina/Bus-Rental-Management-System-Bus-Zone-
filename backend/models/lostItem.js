import mongoose from 'mongoose';

// Define schema
const lostItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dateLost: {
        type: Date,
        required: true,
        default: Date.now
    },
    busNumber: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Reported', 'Found', 'Claimed', 'Returned'],
        default: 'Reported'
    },
    reportedBy: {
        type: String,
        enum: ['User', 'Admin'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.reportedBy === 'User';
        }
    },
    adminNotes: {
        type: String,
        trim: true
    },
    adminReply: {
        type: String,
        trim: true
    },
    repliedBy: {
        type: String,
        trim: true
    },
    repliedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create model
const LostItem = mongoose.model('LostItem', lostItemSchema);

export default LostItem;
