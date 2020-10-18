const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');
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


const serviceAccount = require("./creative-aggency-firebase-adminsdk-kuzxu-27b09234a2.json");

app.get('/', (req, res) => {
    res.send('created by author')
})

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const orderCollection = client.db("creativeAgency").collection("serviceCoolection");
    const reviewCollection = client.db("creativeAgency").collection("reviewCollection");
    const adminsCollection = client.db("creativeAgency").collection("admins");
    const serviceCollection = client.db("creativeAgency").collection("services");
    

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
    app.post('/addAdmin', (req, res) => {
      const userInfo = req.body
      adminsCollection.insertOne(userInfo)
        .then(result => {
          res.send(result.insertedCount > 0)
        })
    });

    app.post('/isAdmin', (req, res) => {
      const email = req.body.email;
      adminsCollection.find({ email: email })
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

    app.get('/getServices', (req, res) => {
      serviceCollection.find({})
        .toArray((err, documents) => {
          res.send(documents)
          console.log(documents);
        })
    });

    app.get('/getUserServices', (req, res) => {
      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
          .then((decodedToken) => {
            let tokenEmail = decodedToken.email;
            UserServiceCollection.find({
              email: tokenEmail
            })
              .toArray((err, documents) => {
                res.send(documents)
              })
          }).catch((error) => {
            res.sendStatus(401);
          });
      } else {
        res.sendStatus(401);
      }
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

app.listen(port, ()=> {
  console.log(`example listening on port ${port}`)
});