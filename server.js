//jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require("https");
const mailChimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config()


const app = express();

// Set up Mailchimp API key and server
mailChimp.setConfig({
    apiKey: process.env.API_KEY,
    server: process.env.API_SERVER
});

// Serve static files from the public directory
app.use(express.static("public"));

// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({extended: true}));

//Sending the signup.html file to the browser as soon as a request is made on localhost:3000
app.get("/", function(req,res){
    res.sendFile(__dirname+"/signup.html");
});

app.post("/", function(req,res){
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;

    const listId = process.env.LIST_ID;

    //Creating an object with the users data
    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    //uploading data to the server
    
    async function run(){
        try{
        const response = await mailChimp.lists.addListMember(listId, {
            email_address: subscribingUser.email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
        });
        res.sendFile(__dirname + "/success.html");
        console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);
        }
    
        catch(err){
            console.log(err.status);
            res.sendFile(__dirname+"/failure.html");
        }
    };

   run();

});

app.post("/failure", function(req, res){
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("this server is running at port 3000");
})

