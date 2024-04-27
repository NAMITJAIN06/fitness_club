const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Create Express app
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://namitjain180:gTl6jSbo0P9AoEjH@cluster0.cerfz6s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err.message);
});

// Define Mongoose schema and model for User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

// Hash passwords before saving them to the database
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  next();
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/index.ejs', (req, res) => {
  res.render('index');
});

app.get("/login.ejs", (req, res) => {
  res.render('login');
});

app.get("/signup.ejs", (req, res) => {
  res.render('signup');
});

app.get("/training.ejs", (req, res) => {
  res.render('training');
});

app.get("/service.ejs", (req, res) => {
  res.render('service');
});



app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already registered');
    }
    
    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.send('Account created successfully');
  } catch (err) {
    console.error('Error creating account:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials');
    }

    // Authentication successful, redirect to index.ejs
    res.redirect('/index.ejs');
  } catch (err) {
    console.error('Error logging in:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
