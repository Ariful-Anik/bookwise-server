const express = require('express');
const cors = require('cors');
const booksRoutes = require('./routes/books');

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON parsing
app.use('/api/books', booksRoutes); // Use books routes

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
