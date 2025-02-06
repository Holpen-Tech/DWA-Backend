const express = require('express'); // Use express library to handle HTTP requests and web servers
const mongoose = require('mongoose'); // Import mongoose to allow for database management with MongoDB
//const cors = require('cors'); // CORS packaage for making requests between the front end and the backend
require('dotenv').config(); // Access the .env file

const app = express(); // Create an instance of express
const userRouter = require('./api/user');

app.use(express.json()); // Process JSON requests
//app.use(cors()); // Handle different requests from various origins

mongoose.connect(process.env.MONGODB_URI); // Establish the database connection

app.get('/', (req, res) => {
  res.send('API is running'); //Ensure database connection is successful. Might take out later
});

const PORT = process.env.PORT || 5000; // Set port for the server 
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); // Start the server and listen for any incoming requests
});
