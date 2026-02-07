require('dotenv').config();
const express = require ('express');
const {MongoClient} = require ('mongodb');

const app = express();
const port = process.env.PORT || 3000;

//Database Connection Setup
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB(){
    try{
        await client.connect();
        db=client.db("RPG_Game"); //Connects to the specific DB
        console.log("Connected to MongoDB Atlas");
    }catch (error){
        console.error("Connection fialed:", error);
    }
}

// Middleware (The "Waiter")
//This tells the server: "If they ask for file (like index.html),look in 'public'"
app.use(express.static('public'));
app.use(express.json()); //Allows us to read JSON bodies in POST requests

//API Routes (The "Menu")
// Get /players - returns a list of all players
app.get('/players', async(req, res) => {
    try{
        const players= await db.collection("Players").find({}).toArray();
        res.json(players);
    }catch(error){
        res.status(500).json({error:"Could not fetch players"});
    }
});

//Start the server
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`RPG Server running at http:localhost:${port}`);
    })
})