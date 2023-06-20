require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

const apiKey = process.env.API_KEY
const secret = process.env.SECRET;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Creating a database connection.
mongoose.connect("mongodb://127.0.0.1:27017/secrets");
// Schema  || new mongoose.Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//Add plugins | Gives more functionality | should be added before the creation of model.
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

// Model
const User = mongoose.model("User", userSchema);


app.route("/")
  .get((req, res) => {
    res.render("home");
  });

// Route for register.
app.route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post(async (req, res) => {
    // Creating a document based on User model.
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });

    try {
      const savedUser = await newUser.save();
      res.render("secrets");
    } catch (err) {
      console.log(err);
    }
  });

// Route for login.
app.route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
      const foundUser = await User.findOne({ email: username });
      if (foundUser && foundUser.password === password) {
        res.render("secrets");
      } else {
        res.status(404).send("The requested resource could not be found on the server!");
      }
    } catch (err) {
      console.log(err);
    }
  });

app.route("/logout")
  .get((req, res) => {
    //clears user's session
    req.session.destroy();
    res.redirect("/");
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
