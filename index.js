const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

const port = process.env.PORT || 5000;

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozwps.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('created by author')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const collection = client.db("creativeAgency").collection("serviceCoolection");

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order).then((result) => {
            res.send(result.insertedCount > 0);
        });
    })

});

app.listen(port);