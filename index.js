const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zt47ric.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const toyCollection = client.db('toyMarketplace').collection('marketplace')

    app.get('/allToys', async(req, res) =>{
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    app.post("/postToys", async (req, res) => {
        const body = req.body;
        
        console.log(body);
        const result = await toyCollection.insertOne(body);
        if (result?.insertedId) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({
            message: "can not insert try again leter",
            status: false,
          });
        }
      });

      app.get('/myToys', async (req, res) => {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }
        const result = await toyCollection.find(query).toArray();
        res.send(result);
    })


    app.get("/myToys/:email", async(req, res) =>{
        console.log(req.params.email);
        const result = await toyCollection
        .find({email : req.params.email})
        .toArray()
        res.send(result)
    });


    // const indexKey = {name : 1, category : 1};
    // const indexOption = { name : "nameCategory"};

    // const result = await toyCollection.createIndex(indexKey, indexOption);

    // app.get("/toySearch/:text", async (req, res) =>{
    //   const search = req.params.text;

    //   const result = await toyCollection.find({
    //     $or:[
    //       {name : { $regex: search, $options : "1"}},
    //       {category : { $regex: search, $options : "1"}}
    //     ]
    //   })
    //   .toArray()
    //   res.send(result)
    // })


    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { title: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


   
   

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Toy is running')
})


app.listen(port, () =>{
    console.log(`Toy is running on port ${port}`)
})