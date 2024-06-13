const express = require("express");
const bodyParser = require("body-parser");
const Student = require("./db/conn");
const Book = require("./db/book");
const app = express();
const session = require("express-session");
const Cart = require("./db/cart");

// Import the Book schema

const path = require("path");
const ejs = require("ejs");
const public_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../src/templates/views");
app.set('view engine', 'ejs');

app.use(express.static(public_path));
app.set("views", views_path);
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

var loggedIn = false;
var userName = "";

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedIn && req.session.user) {
    // User is logged in, set the loggedIn and userName variables in the session
    res.locals.loggedIn = true;
    res.locals.userName = req.session.user.name;
  } else {
    // User is not logged in, set the loggedIn and userName variables to false and an empty string respectively
    res.locals.loggedIn = false;
    res.locals.userName = '';
  }
  next();
};

// app.get("/", (req, res) => {
//   res.render("homepage", { log: loggedIn, userName: userName });
// });
app.get("/", async (req, res) => {
  const loggedIn = req.session.loggedIn || false;
  const userName = req.session.userName || "";

  res.render("homepage", { loggedIn: loggedIn, userName: userName });
});


app.get("/login", (req, res) => {
  res.render("login", { loggedIn: loggedIn, userName: userName });
});

app.get("/signUp", (req, res) => {
  res.render("signUp", { loggedIn: loggedIn, userName: userName });
});

app.get("/branch", (req, res) => {
  res.render("branch", { loggedIn: loggedIn, userName: userName });
});

app.get("/about", (req, res) => {
  res.render("homepage", { loggedIn: loggedIn, userName: userName });
});

app.get('/profile', isLoggedIn, async (req, res) => {
  
  try {
    const userEmail = req.session.user && req.session.user.email; // Assuming you have stored the logged-in user's email in the session

    const user = await Student.findOne({ email: userEmail }).populate("cart.book"); // Populate the book details in the user's cart

    if (user) {
      const cartItems = user.cart;
      const loggedIn = req.session.loggedIn || false;
      const userName = req.session.user ? req.session.user.name : '';

      res.render("profile", { cartItems: cartItems, loggedIn: loggedIn, userName: userName, user: user });
    } else {
      // User not found, handle the error
      res.render("error", { loggedIn: loggedIn, userName: userName, message: "User not found" });
    }
  } catch (error) {
    // Handle the error
    console.error("Error retrieving user profile:", error);
    res.render("error", { loggedIn: loggedIn, userName: userName, message: "An error occurred while retrieving the user profile" });
  }
});

app.get("/books", async (req, res) => {
  const branch = req.query.branch;
  const search = req.query.search;
  let loggedIn = req.session.loggedIn || false;
  let userName = req.session.user ? req.session.user.name : '';

  try {
    let books;
    let cartItems = [];

    // Fetch cart items for the logged-in user
    if (loggedIn) {
      const user = await Student.findOne({ email: req.session.user.email });
      if (user) {
        cartItems = user.cart;
      }
    }

    // Check if a search query is present
    if (search) {
      // Perform search based on title or author
      books = await Book.find({
        branch: branch,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } }
        ]
      });
    } else {
      // Fetch all books for the selected branch
      books = await Book.find({ branch: branch });
    }

    res.render("books", { loggedIn, userName, books, branch, search, cartItems, errorMessage: "" });
  } catch (err) {
    console.error("Error retrieving books:", err);
    res.render("books", { loggedIn, userName, books: [], branch, search, cartItems: [], errorMessage: "An error occurred while retrieving books." });
  }
});

app.post("/books/add-to-cart", async (req, res) => {
  const bookId = req.body.bookId; // Assuming the book ID is sent in the request body
  const userEmail = req.session.user && req.session.user.email; // Assuming you have stored the logged-in user's email in the session

  try {
    if (userEmail) {
      const user = await Student.findOne({ email: userEmail });
      if (user) {
        const book = await Book.findById(bookId);
        if (book) {
          if (book.stockCount > 0) {
            const existingCartItem = user.cart.find(item => item.book.equals(bookId));
            if (existingCartItem) {
             return res.render("error", { loggedIn: true, userName: user.name, message: "Item already in your cart" }); // Increment the quantity if the book is already in the cart
            } else {
              user.cart.push({ book: bookId, quantity: 1 ,dateAdded: new Date()}); // Add the book to the user's cart
            }
            console.log('Before decrement:', book.stockCount);
            book.stockCount -= 1;
            console.log('After decrement:', book.stockCount); // Decrement the stock count of the book
            await Promise.all([user.save(), book.save()]);
           return res.redirect("/profile"); // Redirect the user to their profile page
          } else {
            // Book out of stock, handle the error
           return res.render("error", { loggedIn: false, userName: "", message: "The book is currently out of stock" });
          }
        } else {
          // Book not found, handle the error
          return res.render("error", { loggedIn: false, userName: "", message: "Book not found" });
        }
      } else {
        // User not found, handle the error
       return res.render("error", { loggedIn: false, userName: "", message: "User not found" });
      }
    } else {
      // User not logged in, show a message to login
      return res.render("error", { loggedIn: false, userName: "", message: "Please log in to add books to your cart" });
    }
  } catch (error) {
    // Handle the error
    console.error("Error adding book to cart:", error);
    return res.render("error", { loggedIn: false, userName: "", message: "An error occurred while adding the book to the cart" });
  }
});


app.post("/signUp", function (req, res) {
  const emailName = req.body.email_uname;
  const passwordName = req.body.psw;
  const confirmpasswordName = req.body.confirmpsw;

  if (passwordName !== confirmpasswordName) {
    res.render("signUp", { log: loggedIn, userName: userName, error: "Passwords do not match" });
  } else {
    const user = new Student({
      email: emailName,
      password: passwordName,
    });

    user
      .save()
      .then((user) => {
        req.session.user = user;
        req.session.loggedIn = true;
        res.redirect("/");
      })
      .catch((error) => {
        console.log(error);
        res.render("signUp", { loggedIn: loggedIn, userName: userName, error: "An error occurred while signing up" });
      });
  }
});

app.post("/login", function (req, res) {
  const emailName = req.body.email_uname;
  const passwordName = req.body.psw;

  Student.findOne({ email: emailName, password: passwordName })
    .then((user) => {
      if (user) {
        req.session.user = user;
        req.session.loggedIn = true;
        req.session.userName = user.name;
        res.redirect("/");
      } else {
        res.render("login", { loggedIn: loggedIn, userName: userName, error: "User not found" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.render("login", { loggedIn: loggedIn, userName: userName, error: "An error occurred" });
    });
});

app.post("/header", async function (req, res) {
  const header = req.body.header;

  if (header === "1") {
    res.redirect("/");
  } else if (header === "2") {
    res.redirect("/about");
  } else if (header === "3") {
    res.redirect("/login");
  } else if (header === "4" || header === "5") {
    req.session.loggedIn = false; // Update session to mark the user as logged out
    req.session.userName = "";
    req.session.user = null; // Clear the userName in the session
    res.redirect("/");
  } 
  else if (header === "6") {
    res.redirect("/profile");
  }else {
    console.log(header);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

// function isLoggedIn(req, res, next) {
//   if (req.session.loggedIn) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// }

