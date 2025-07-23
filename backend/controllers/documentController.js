// backend/controllers/documentController.js
const asyncHandler = require('express-async-handler');
const Document = require('../models/documentModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pdf = require('pdf-parse'); // For PDF processing
const mammoth = require('mammoth'); // For DOCX processing
const Tesseract = require('tesseract.js'); // For OCR on images (if implementing)

// Configure Multer storage (remains the same)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
        console.log('--- Multer File Filter Debugging ---');
        console.log('File originalname:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File extname:', path.extname(file.originalname).toLowerCase());
        console.log('--- End Debugging ---');

        // UPDATED: Include 'text/plain' directly in the regex for mimetype matching
        const filetypes = /jpeg|jpg|png|pdf|doc|docx|txt|text\/plain/; // <--- CRITICAL CHANGE HERE
        const mimetype = filetypes.test(file.mimetype); // This will now correctly match 'text/plain'
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // This will correctly match '.txt'

        console.log('Mimetype test result:', mimetype);
        console.log('Extname test result:', extname);


        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png), PDF, DOC, DOCX, TXT files are allowed!'));
        }
    }
}).single('document');

// --- NEW: Function to interact with OpenAI API ---
async function queryOpenAI(prompt, modelId = 'gpt-3.5-turbo') { // Default to gpt-3.5-turbo
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not set in environment variables.');
    }

    const API_URL = 'https://api.openai.com/v1/chat/completions'; // Endpoint for chat completions

    try {
        const response = await axios.post(
            API_URL,
            {
                model: modelId,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that summarizes documents concisely.' },
                    { role: 'user', content: `Summarize the following document content:\n\n${prompt}` }
                ],
                max_tokens: 150 // Adjust based on desired summary length
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );
        return response.data.choices[0].message.content; // Extract the summary text
    } catch (error) {
        console.error(`Error querying OpenAI model ${modelId}:`, error.response?.data?.error || error.message);
        throw new Error(`OpenAI API call failed: ${error.response?.data?.error?.message || error.message}`);
    }
}
// --- END NEW ---


// @desc    Upload a new document and process with AI
// @route   POST /api/documents
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400);
            throw new Error(err.message);
        }

        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        const { originalname, filename, path: filePath, mimetype, size } = req.file;

        let extractedText = '';
        let summary = '';

        try {
            // --- STEP 1: FILE EXTRACTION ---
            if (mimetype === 'application/pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                extractedText = data.text;
                console.log('Extracted text from PDF (first 200 chars):', extractedText.substring(0, 200));
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
                const docxBuffer = fs.readFileSync(filePath);
                const result = await mammoth.extractRawText({ arrayBuffer: docxBuffer });
                extractedText = result.value;
                console.log('Extracted text from DOCX (first 200 chars):', extractedText.substring(0, 200));
            } else if (mimetype === 'text/plain') {
                extractedText = fs.readFileSync(filePath, 'utf8');
                console.log('Extracted text from TXT (first 200 chars):', extractedText.substring(0, 200));
            } else if (mimetype.startsWith('image/')) {
                const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
                     logger: m => console.log(m)
                });
                extractedText = text;
                console.log('Extracted text from Image (OCR, first 200 chars):', extractedText.substring(0, 200));
            } else {
                extractedText = 'Unsupported file type for direct AI processing.';
                console.log('Extracted text placeholder for unsupported type:', extractedText);
            }

            const textForAI = extractedText.substring(0, 4000);
            console.log('Text sent to AI (first 200 chars):', textForAI.substring(0, 200));

            // --- STEP 2: AI SUMMARIZATION (THIS WAS OUTSIDE YOUR PREVIOUS TRY BLOCK) ---
            // --- ADD THESE NEW LOGS FOR DEBUGGING (as suggested previously) ---
            console.log('textForAI length:', textForAI.length);
            console.log('textForAI contains "OCR not yet implemented":', textForAI.includes('OCR not yet implemented'));
            console.log('textForAI contains "Unsupported file type":', textForAI.includes('Unsupported file type'));
            // --- END NEW LOGS ---

            if (textForAI.length > 50 && !textForAI.includes('OCR not yet implemented') && !textForAI.includes('Unsupported file type')) {
                console.log('Attempting to call OpenAI for summarization...');
                summary = await queryOpenAI(textForAI, 'gpt-3.5-turbo');
                console.log('OpenAI Summary received:', summary.substring(0, 200));
            } else {
                summary = 'Not enough text or unsupported file type for AI summarization.';
                console.log('Skipping OpenAI call, summary:', summary);
            }

        } catch (error) { // Renamed aiError to error for broader catching
            console.error(`An error occurred during document processing or AI summarization for ${originalname}:`, error.message);
            summary = `AI processing failed: ${error.message}`;
            // Optional: If you want to send a specific error response to the client
            // res.status(500).json({ message: `Document processing failed: ${error.message}` });
            // return; // Exit if you've already sent a response
        }


        // --- CRITICAL CHECK POINT ---
        console.log('--- Before Saving to DB ---');
        console.log('Final extractedText to save:', extractedText.substring(0, 200));
        console.log('Final summary to save:', summary.substring(0, 200));
        console.log('--- End Before Saving ---');

        // Save document metadata AND AI results to MongoDB
        const document = await Document.create({
            user: req.user.id,
            fileName: originalname,
            filePath: filePath,
            fileType: mimetype,
            fileSize: size,
            extractedText: extractedText,
            summary: summary,
        });

        console.log('Document saved to DB with ID:', document._id); // Confirm DB save

        res.status(201).json({
            message: 'Document uploaded and processed successfully',
            document: {
                _id: document._id,
                fileName: document.fileName,
                filePath: document.filePath,
                fileType: document.fileType,
                fileSize: document.fileSize,
                extractedText: document.extractedText,
                summary: document.summary,
                user: document.user,
                createdAt: document.createdAt,
            },
        });
    });
});


// backend/controllers/documentController.js
// ... (all code above this, including Multer setup and queryOpenAI) ...

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
    const documents = await Document.find({ user: req.user.id });
    res.status(200).json(documents);
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = asyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        res.status(404);
        throw new Error('Document not found');
    }

    // Make sure the logged in user owns the document
    if (document.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to view this document');
    }

    res.status(200).json(document);
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        res.status(404);
        throw new Error('Document not found');
    }

    // Make sure the logged in user owns the document
    if (document.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this document');
    }

    // Delete the file from the file system as well
    if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath); // Delete the actual file
    }

    await Document.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Document removed' });
});

async function queryOpenAIForAnswer(documentText, question, modelId = 'gpt-3.5-turbo') {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not set in environment variables.');
    }

    const API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        const prompt = `Based *only* on the following document text, answer the question. If the answer cannot be found in the text, state that you don't have enough information from the document.\n\nDocument Text:\n"""\n${documentText}\n"""\n\nQuestion: ${question}\n\nAnswer:`;

        const response = await axios.post(
            API_URL,
            {
                model: modelId,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that answers questions based on provided text.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 200 // Adjust based on desired answer length
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error(`Error querying OpenAI for answer with model ${modelId}:`, error.response?.data?.error || error.message);
        throw new Error(`OpenAI API call failed: ${error.response?.data?.error?.message || error.message}`);
    }
}
// --- END NEW OpenAI Q&A Function ---


// @desc    Ask a question about a document (THIS FUNCTION MUST BE BEFORE module.exports)
// @route   POST /api/documents/:id/ask
// @access  Private
const askDocumentQuestion = asyncHandler(async (req, res) => {
    const documentId = req.params.id;
    const { question } = req.body; // Expects 'question' in the request body

    if (!question) {
        res.status(400);
        throw new Error('Please provide a question.');
    }

    const document = await Document.findById(documentId);

    if (!document) {
        res.status(404);
        throw new Error('Document not found.');
    }

    // Make sure the logged in user owns the document
    if (document.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to ask questions about this document.');
    }

    if (!document.extractedText || document.extractedText.length < 50) {
        res.status(400);
        throw new Error('Document does not contain enough extracted text for Q&A.');
    }

    try {
        const answer = await queryOpenAIForAnswer(document.extractedText, question);
        res.status(200).json({ answer });
    } catch (error) {
        console.error('Q&A processing error:', error.message);
        res.status(500).json({ message: 'Failed to get answer from AI: ' + error.message });
    }
});


module.exports = {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    askDocumentQuestion // <--- ADD THIS HERE
};