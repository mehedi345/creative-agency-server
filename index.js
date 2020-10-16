const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;




const port = process.env.PORT || 5000;

require('dotenv').config();


const app = express();
app.use(bodyParser.urlencoded({
    extended: false
  }));
app.use(bodyParser.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozwps.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




app.get('/', (req, res) => {
    res.send('created by author')
})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const orderCollection = client.db("creativeAgency").collection("serviceCoolection");
    const reviewCollection = client.db("creativeAgency").collection("reviewCollection");


    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order).then((result) => {
            res.send(result.insertedCount > 0);
        });
    })

    app.get("/userOrder", (req, res) => {
        orderCollection
          .find({ email: req.query.email })
          .toArray((err, documents) => {
            res.send(documents);
            console.log(documents)
          });
      });

      app.post('/addReview', (req, res) => {
        const userInfo = req.body
        reviewCollection.insertOne(userInfo)
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result)
            })
    })
    
    app.get('/getReview', (req, res) => {
      reviewCollection.find({})
      .limit(3)
        .toArray((err, documents) => {
          res.send(documents)
        })
    })
      
     
});

app.listen(port);