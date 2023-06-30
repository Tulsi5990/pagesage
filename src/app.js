const express = require("express");
const bodyParser = require("body-parser");
const Student = require("./db/conn");
const Book = require("./db/book");
const app = express();

// Import the Book schema

const path = require("path");
const ejs = require("ejs");
const public_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../src/templates/views");
app.set('view engine', 'ejs');

app.use(express.static(public_path));
app.set("views", views_path);
app.use(express.urlencoded({ extended: false }));

var loggedIn=false;
var userName="";

app.get("/", (req, res) => {
  res.render("homepage" ,{log: loggedIn, userName: userName});
});



app.get("/login", (req, res) => {
  res.render("login" ,{log: loggedIn, userName: userName});
});

app.get("/signUp", (req, res) => {
  res.render("signUp" ,{log: loggedIn, userName: userName});
});

app.get("/branch", (req, res) => {
  res.render("branch" ,{log: loggedIn, userName: userName});
});

app.get("/about", (req, res) => {
  res.render("homepage",{log: loggedIn, userName: userName});
});

// app.get('/profile', (req, res) => {
//   // Retrieve the user's cart items from the database or session
//   const cartItems = []; // Retrieve the cart items for the current user

//   res.render('profile', { cartItems });
// });


// Update the path to conn.js

app.post("/signUp", function(req, res) {
  const emailName = req.body.email_uname;
  const passwordName = req.body.psw;
  const confirmpasswordName = req.body.confirmpsw;

  if (passwordName !== confirmpasswordName) {
    res.render('signUp', { log: loggedIn, userName: userName, error: 'Password not matched' });
  }

  const student = new Student({
    email: emailName,
    password: passwordName
  });

  student.save()
    .then(() => {
      console.log("User saved successfully!");
    })
    .catch((error) => {
      console.log(error);
    });

  res.redirect("/");
});

app.post('/login', (req, res) => {
  const emailName = req.body.email_uname;
  const passwordName = req.body.psw;

  Student.findOne({ email: emailName })
    .then((user) => {
      if (user) {
        if (user.password === passwordName) {
          // User found and password matched, proceed with login
          loggedIn = true;
          userName = emailName;
          res.redirect("/");
        } else {
          // Invalid password
          res.render('login', { log: loggedIn, userName: userName, error: 'Invalid password' });
        }
      } else {
        // User not found
        res.render('login', { log: loggedIn, userName: userName, error: 'User not found' });
      }
    })
    .catch((error) => {
      // Error occurred during the query
      res.render('login', { log: loggedIn, userName: userName, error: 'An error occurred' });
    });
});




  //------------------------

  




  app.get("/books", async (req, res) => {
    const branch = req.query.branch;
    const search = req.query.search;
  
    try {
      let books;
      
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
  
      res.render("books", { books: books, branch: branch, search: search, errorMessage: "" });
    } catch (err) {
      console.error("Error retrieving books:", err);
      res.render("books", { books: [], branch: branch, search: search, errorMessage: "An error occurred while retrieving books." });
    }
  });
  

  app.post("/header", async function(req, res)
  {
    const header = req.body.header;
    if (header === "1") {
      res.redirect("/");
    }
    else if(header==2){
      res.redirect("/about");
    }
    else if(header==3){
      res.redirect("/login");
    } 
    else if(header==4){
      loggedIn=false;
      res.redirect("/");
    }
    else if(header=="5"){
      loggedIn=false;
      await Signup.deleteOne({email: userName});
      userName="";
      res.redirect("/");
    } 
    else
    {
      console.log(header);
    }
  });


/************************************************************************************* */
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});


