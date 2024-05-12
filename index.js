const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://blog-website-aef2b.web.app"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.irm8dks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const blogCollection = client.db(`ZenZepblog`).collection(`blogs`);
    const commentCollection = client.db(`ZenZepblog`).collection(`comments`);
    const testimonialCollection = client
      .db(`ZenZepblog`)
      .collection(`testimonial`);

    app.get("/blogss", async (req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/testimonials", async (req, res) => {
      const cursor = testimonialCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    app.get(`/blogss/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    app.get("/comments", async (req, res) => {
      const cursor = commentCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    // getting the specific comment in different posts
    app.get(`/comments/:blogId`, async (req, res) => {
      const blogId = req.params.blogId;
      const query = { blogId: blogId };
      const cursor = commentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });






    // getting the posted blogs match with email
    app.get(`/blogsss/:authorEmail`, async (req, res) => {
      const userEmail = req.params.authorEmail;
      const query = { authorEmail: userEmail };
      const result = await blogCollection.find(query).toArray();
      res.send(result);
    });










    // sending the blog posts to database
    app.post(`/blogss`, async (req, res) => {
      const newBlog = req.body;
      const result = await blogCollection.insertOne(newBlog);
      res.send(result);
    });
    // sending or adding the comments to database
    app.post(`/comments`, async (req, res) => {
      const newComment = req.body;
      const result = await commentCollection.insertOne(newComment);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
//

app.get(`/`, (req, res) => {
  res.send(`blog server is running`);
});
app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
