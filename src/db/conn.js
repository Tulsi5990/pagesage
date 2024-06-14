const mongoose = require("mongoose");

// Function to connect to MongoDB
const connectDatabase = () => {
  mongoose.connect(process.env.DB_URI).then((data) => {
    console.log(`Mongodb connected with server: ${data.connection.host}`);
  }).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
};

// Define studentSchema and create Student model
const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book' // Update the reference to 'Book' model
    },
    quantity: Number,
    dateAdded: { type: Date, default: Date.now }
  }],
  created_at: {
    type: Date,
    default: Date.now,
  },
  studentId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString() // Generate a unique studentId
  }
});

const Student = mongoose.model("Student", studentSchema);

module.exports = { connectDatabase, Student };
