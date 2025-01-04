const express = require('express');
const books = require('../data/books.json'); // Import books data

const router = express.Router();

// Get all books
router.get('/', (req, res) => {
  res.json(books); // Return all books
});

// Get single book by ID
router.get('/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10); // Parse book ID from URL
  const book = books.find((b) => b.id === bookId); // Find book by ID

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json(book); // Return the found book
});

// Get book recommendations based on book ID
router.get('/:id/recommendations', (req, res) => {
  const bookId = parseInt(req.params.id, 10); // Parse book ID from URL
  const { getRecommendations } = require('../utils/apriori'); // Import Apriori logic

  const recommendations = getRecommendations(bookId);

  if (!recommendations || !recommendations.length) {
    return res.status(404).json({ message: 'No recommendations found' });
  }

  res.json(recommendations); // Return recommended books
});

module.exports = router;
