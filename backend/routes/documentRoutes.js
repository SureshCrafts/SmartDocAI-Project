// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
// We will add controllers and middleware here later
const { protect } = require('../middleware/authMiddleware');
const {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    askDocumentQuestion
} = require('../controllers/documentController');

// Example route (will be fully implemented later)
router.route('/').post(protect, uploadDocument).get(protect, getDocuments);
router.route('/:id').get(protect, getDocument).delete(protect, deleteDocument);

// NEW: Route for Q&A - ADD 'protect' MIDDLEWARE HERE
router.post('/:id/ask', protect, askDocumentQuestion); // <--- THIS IS THE CHANGE

module.exports = router;