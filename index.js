const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');



const port = process.env.PORT || 5000;

require('dotenv').config();


const app = express();
app.use(bodyParser.urlencoded({
    extended: false
  }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'))
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozwps.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




app.get('/', (req, res) => {
    res.send('created by author')
})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const orderCollection = client.db("creativeAgency").collection("serviceCoolection");
    const reviewCollection = client.db("creativeAgency").collection("reviewCollection");
    const AdminsCollection = client.db("creativeAgency").collection("admins");
    const ServiceCollection = client.db("creativeAgency").collection("services");
    

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
      
    app.post('/isAdmin', (req, res) => {
      const email = req.body.email;
      AdminsCollection.find({ email: email })
        .toArray((err, admins) => {
          res.send(admins.length > 0);
        })
    });

    app.post('/isUser', (req, res) => {
      const email = req.body.email;
      orderCollection.find({ email: email })
        .toArray((err, user) => {
          res.send(user.length > 0);
        })
    });

    

    app.post('/AddService', (req, res) => {
      const file = req.files.file;
      const title = req.body.title;
      const description = req.body.description;
      const newImg = file.data;
          const encImg = newImg.toString('base64');
    
          var image = {
              contentType: file.mimetype,
              size: file.size,
              img: Buffer.from(encImg, 'base64')
          };
          ServiceCollection.insertOne({image, title, description})
        .then(result => {
          res.send(result.insertedCount > 0)
        })
    })
     
});

app.listen(port);