const express = require("express");
const router = express.Router();
const Student = require("../db/conn"); // Assuming your Student model is in conn.js
const Book = require("../db/book"); // Assuming your Book model is in book.js

// GET route to display the cart for a specific student
router.get("/cart/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    const cartBooks = await Book.find({ _id: { $in: student.cart } });
    
    // Render the cart view with the student's cart details
    res.render("cart", { student, cartBooks });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST route to add a book to the cart for a specific student
router.post("/cart/add", async (req, res) => {
  try {
    const studentId = req.session.studentId;
    const bookId = req.body.bookId;

    // Add the bookId to the student's cart
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { cart: bookId } },
      { new: true }
    );

    // Decrement the stock count of the book
    await Book.findByIdAndUpdate(bookId, { $inc: { stockCount: -1 } });

    res.sendStatus(200); // Send a success response
  } catch (error) {
    console.log(error);
    res.sendStatus(500); // Send an error response
  }
});

module.exports = router;

