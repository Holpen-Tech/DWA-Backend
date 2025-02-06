const express = require('express');
const router = express.Router();

// Import mongodb user model
const User = require('./../models/User');

// Password handler - encryption
const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password == "") { // Validate that the fields are not empty
        res.json({
            status: "FAILED",
            message: "Please fill out the required fields"
        });
    } 
    // Use regular expressions to validate the username/email
    else if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) ) {
        // Return json object if the username/email canot be validated
        res.json({
            status: "FAILED",
            message: "Incorrect username or email"
        });
    }
    else if (password.length < 8) { // Validate the length of the password
        // Return json object if the password cannot be validated
        res.json({
            status: "FAILED",
            message: "Password is too short"
        });
    }
    else { // Check if the user already exists
        User.find({email}.then(result => {
            if(result.length) {
                // If a user already exists with the username or email
                res.json({
                    status: "FAILED",
                    message: "The username you provided is not available"
                });
            }
            else { //Store the user in the database if the user already exists

                // Encrypt the password using bcrypt
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        email,
                        password: hashedPassword
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result
                        })
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while saving the password"
                        })                        
                    })
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing the password"
                    })
                })


            }
        })).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            });
        })
    }

})

router.post('/signin', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password == "") { // Validate that the fields are not empty
        res.json({
            status: "FAILED",
            message: "Please fill out the required fields"
        });
    }
    else {
        User.find({email}).then(data => {
            if(data.length) { // If the user already exists
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if(result) {
                        // Successful password match
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        })
                    }
                    else { // Unsuccessful password match
                        res.json({
                            status: "FAILED",
                            message: "Password is incorrect"
                        })
                    }
                })
                .catch(err => { // If the hashed passwords could not be properly compared
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while comparing passwords"
                    }) 
                })
            }
            else { // User email could not be found
                res.json({
                    status: "FAILED",
                    message: "Incorrect login credentials"
                })
            }
        })
        .catch(err => { // If the hashed passwords could not be properly compared
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for an existing username"
            }) 
        })
    } 
    
})

module.exports = router;