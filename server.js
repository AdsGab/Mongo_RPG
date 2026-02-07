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
//GET /players - returns a list of all players
app.get('/players', async(req, res) => {
    try{
        const players= await db.collection("Players").find({}).toArray();
        res.json(players);
    }catch(error){
        res.status(500).json({error:"Could not fetch players"});
    }
});

//POST /players - Adds a new player to the database
app.post('/players', async(req, res)=>{
    try{
        const newPlayer =req.body;

        // Validate Data is not empty 
        if (!newPlayer.username||!newPlayer.class){
            return res.status(400).json({error: "Username and Class are required!"});
        }

        // Add default data
        newPlayer.level = parseInt(newPlayer.level)||1;
        newPlayer.inventory = ["Starter Sword","Bread"];

        //Insert into MongoDB
        const result = await db.collection("Players").insertOne((newPlayer));

        //Send back success
        res.status(201).json(result);
    } catch(error){
        console.error("Error creating player:", error);
        res.status(500).json({erorr:"Failed to create player"});
    }
})
 
//Start the server
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`RPG Server running at http:localhost:${port}`);
    })
})