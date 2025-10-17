import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    dateLost: {
        type: Date,
        required: [true, 'Date lost is required'],
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Date lost cannot be in the future'
        }
    },
    busNumber: {
        type: String,
        required: [true, 'Bus number is required'],
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{2}-\d{4}$/, 'Bus number must be in format: AB-1234']
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
        required: function() {
            return this.reportedBy === 'User';
        }
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    },
    adminReply: {
        type: String,
        trim: true,
        maxlength: [1000, 'Admin reply cannot exceed 1000 characters']
    },
    repliedBy: {
        type: String,
        trim: true
    },
    repliedAt: {
        type: Date
    },
    deliveryAddress: {
        type: String,
        trim: true,
        maxlength: [500, 'Delivery address cannot exceed 500 characters']
    },
    deliveryStatus: {
        type: String,
        enum: ['Pending', 'In Transit', 'Delivered', 'Failed'],
        default: 'Pending'
    },
    deliveryNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Delivery notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
lostItemSchema.index({ user: 1, createdAt: -1 });
lostItemSchema.index({ status: 1 });
lostItemSchema.index({ busNumber: 1 });

const LostItem = mongoose.model('LostItem', lostItemSchema);

export default LostItem;
