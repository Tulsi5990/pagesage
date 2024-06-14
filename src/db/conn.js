const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentRegistration";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connection successful");
  })
  .catch((e) => {
    console.log("Error connecting to MongoDB:", e);
  });

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

module.exports = Student;
