// backend/models/documentModel.js
const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Links to your User model
        },
        fileName: {
            type: String,
            required: [true, 'Please add a file name'],
        },
        filePath: { // Or s3Url if you use cloud storage
            type: String,
            required: [true, 'Please add a file path'],
        },
        fileType: {
            type: String,
            required: [true, 'Please add a file type'],
        },
        fileSize: {
            type: Number, // In bytes
            required: [true, 'Please add a file size'],
        },
        // Add fields for AI processed data later, e.g.:
        extractedText: { // <--- UNCOMMENT THIS LINE
            type: String,
        },
        summary: { // <--- UNCOMMENT THIS LINE
            type: String,
        },
        // keywords: [String], // You can keep this commented for now if not used
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('Document', documentSchema);