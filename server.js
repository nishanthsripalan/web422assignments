/********************************************************************************
*  WEB422 – Assignment 1
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Sripalan Nishanth Student ID: 137967220 Date: 02-02-24
*
*  Published URL: https://jolly-pink-drawers.cyclic.app/
*
********************************************************************************/

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.get("/", (req,res)=>{
    res.json({ message: "API Listening" });
});

// add a new "Listing" document to the collection and return the newly created listing object
app.post("/api/listings", (req, res)=>{
    db.addNewListing(req.body)
    .then((data) => {
        res.status(201).json(data);
    })
    .catch((err) => {
        res.status(500).json({ message: `Unable to add a new listing. ${err}` });
    });
});

// return all "Listings" objects for a specific "page" as well as optionally filtering by "name", if provided
app.get("/api/listings", (req, res)=>{
    if(req.query.page && req.query.perPage){
        db.getAllListings(req.query.page, req.query.perPage, req.query.name)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err)=>{
            res.status(500).json({ message: `Unable to get all listings. ${err}` });
        })
    } else {
        res.status(400).json({ message: "Missing numeric query parameters"}); 
    }
});

// return a specific "Listing" object to the client
app.get("/api/listings/:_id", (req, res)=>{
    db.getListingById(req.params._id)
    .then((data) => {
        if(data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: `Unable to find listing with id ${req.params._id}` });
        }
    })
    .catch((err)=>{
        res.status(500).json({ message: err });
    });
});

// update a specific "Listing" document in the collection
app.put("/api/listings/:_id", (req, res)=>{
    if (Object.keys(req.body).length > 0){
        db.updateListingById(req.body, req.params._id)
        .then(() => {
            res.status(201).send({ message: `Listing with id ${req.params._id} updated successfully` });
        })
        .catch((err) => {
            res.status(500).send({ message: err});
        });
    } else {
        res.status(400).json({ message: `Unable to update listing with id ${req.params._id} due to a missing or invalid request body` });
    }
});

// delete a specific "Listing" document from the collection
app.delete("/api/listings/:_id", (req, res)=>{
    db.deleteListingById(req.params._id)
    .then(() => {
        res.status(200).send({message: `Listing with id ${req.params._id} deleted successfully`});
    })
    .catch((err)=>{
        res.status(500).send({ message: err });
    });
});

db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});