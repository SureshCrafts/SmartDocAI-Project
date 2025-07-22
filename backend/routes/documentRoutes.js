// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
// We will add controllers and middleware here later
const { protect } = require('../middleware/authMiddleware'); // <--- UNCOMMENT THIS
const {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    askDocumentQuestion
} = require('../controllers/documentController'); // <--- UNCOMMENT THIS AND ENSURE CORRECT CONTROLLER FUNCTIONS ARE LISTED

// Example route (will be fully implemented later)
router.route('/').post(protect, uploadDocument).get(protect, getDocuments); // <--- UNCOMMENT THIS
router.route('/:id').get(protect, getDocument).delete(protect, deleteDocument); // <--- UNCOMMENT THIS (and ensure matching controller functions)

// NEW: Route for Q&A
router.route('/:id/ask').post(askDocumentQuestion);

module.exports = router;