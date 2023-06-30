const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  coverImage: {
    type: Buffer,
    required: true,
    // Example image data: <Buffer ff d8 ff e0 00 10 4a ...>
  },
  stockCount: {
    type: String,
    required: true
  }
  
  
  // Add other book properties as needed
});

const Book = mongoose.model('Book', bookSchema, 'books');

module.exports = Book;
