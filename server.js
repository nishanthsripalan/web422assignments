const express = require('express');
const app = express();
const ListingsDB = require("./modules/listingsDB.js");
require('dotenv').config();
const db = new ListingsDB();
const cors = require('cors');
const HTTP_PORT  = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


// initialize and API 
db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
    console.log(`server listening on: ${HTTP_PORT}`);
    });
   }).catch((err)=>{
    console.log(err);
   });
   
app.get('/', (req,res) => {
    res.send({ message: "API Listening" });
});


app.post("/api/listings", async (req, res) => {
    try {
        const newListing = await db.addNewListing(req.body);
        res.status(201).send({ message: "New Listing Added", listing: newListing });
    } catch (err) {
        console.error(err); 
        res.status(400).send({ message: "Failed to add new listing", error: err.message });
    }
});

app.get("/api/listings", async (req, res) => {
    try {
        let { page = 1, perPage = 10, name = '' } = req.query;

        page = parseInt(page, 10);
        perPage = parseInt(perPage, 10);

        if (isNaN(page) || page < 1) {
            throw new Error("must be a valid value");
        }
        if (isNaN(perPage) || perPage < 1) {
            throw new Error("must be a valid value");
        }

        name = name.trim();

        const listings = await db.getAllListings(page, perPage, name);
        
        // Check if listings array is empty
        if (listings.length === 0) {
            return res.status(404).send({ message: "No listings found" });
        }

        // Send the listings 
        res.json(listings);
    } catch (err) {
        console.error("Error fetching listings:", err);

        const statusCode = err.message.includes("must be a valid value") ? 400 : 500;
        res.status(statusCode).send({ message: err.message });
    }
});


app.get("/api/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await db.getListingById(id);
        if (!listing) {
            return res.status(404).send({ message: "Listing not found" });
        }
        res.json(listing);
    } catch (err) {
        console.error("Error fetching listing by ID:", err);
        res.status(500).send({ message: "An error occurred fetching the listing" });
    }
});


app.put("/api/listings/:id", async (req, res) => {
    try {
        await db.updateListingById(req.params.id, req.body);
        res.status(200).send({ message: "Product updated!" });
    }
    catch(err) {
        res.status(404).send({ message: err });
    }
});

// DELETE/api/listings/(_id value)
app.delete("/api/listings/:id", async (req, res) =>{
    try {
        await db.deleteListingById(req.params.id);
        res.send({ message: "Product deleted!" });
    }
    catch(err) {
        res.status(404).send({ message: err });
    }
});