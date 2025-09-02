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
        } // Required only if user reports
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: function () {
            return this.reportedBy === 'User';
        } // Required only if user reports
    },
    adminNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` automatically
});

// Create model
const LostItem = mongoose.model('LostItem', lostItemSchema);

// 🛠️ Drop old `item_id` index if it exists (fix for E11000 duplicate key error)
LostItem.collection.dropIndex('item_id_1')
    .then(() => console.log('Old item_id index dropped successfully'))
    .catch(err => {
        if (err.code === 27) {
            // Code 27 = "Index not found"
            console.log('No old item_id index to drop, safe to continue.');
        } else {
            console.error('Error dropping index:', err.message);
        }
    });

export default LostItem;
