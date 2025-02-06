require('dotenv').config(); // Database url is loaded from env file
const mongoose = require('mongoose');
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }) // setup connection to the database
    .then(() => {
        console.log("Database Connected");
    })
    .catch((err) => console.log(err));