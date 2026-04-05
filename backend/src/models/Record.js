import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    amount: { 
        type: Number, 
        required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['Income', 'Expense'] 
    },
    category: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    notes: { type: String },
    createdBy: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model('Record', recordSchema);