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
// https://blog-website-aef2b.web.app/
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
    const wishCollection = client.db(`ZenZepblog`).collection(`wishlist`);
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

    // getting the wishlist blog posts from database
    app.get("/wishlist", async (req, res) => {
      const cursor = wishCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    // getting the wishlist blogs match with email
    app.get(`/wishlist/:currentUserEmail`, async (req, res) => {
      const currentUserEmail = req.params.currentUserEmail;
      const query = { currentUserEmail: currentUserEmail };
      const result = await wishCollection.find(query).toArray();
      res.send(result);
    });

    // getting blogs with selected id
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

    //
    app.get("/top-posts", async (req, res) => {
      try {
        // Fetch-all-blogs
        const blogs = await blogCollection.find({}).toArray();

        // Calculate-word-count-for-each-longDescription
        blogs.forEach((blog) => {
          blog.wordCount = blog.longDescription.split(/\s+/).length;
        });

        // Sortblogs-based-on-word-count-in-descending-order
        const top10Posts = blogs
          .sort((a, b) => b.wordCount - a.wordCount)
          .slice(0, 10);

        res.json(top10Posts);
      } catch (error) {
        console.error("Error fetching top posts:", error);
      }
    });
    //

    // sending or adding the blog posts to database
    app.post(`/blogss`, async (req, res) => {
      const newBlog = req.body;
      const result = await blogCollection.insertOne(newBlog);
      res.send(result);
    });
    // sending or adding the wishlist blog posts to database
    app.post(`/wishlist`, async (req, res) => {
      const wishBlog = req.body;
      const result = await wishCollection.insertOne(wishBlog);
      res.send(result);
    });
    // sending or adding the comments to database
    app.post(`/comments`, async (req, res) => {
      const newComment = req.body;
      const result = await commentCollection.insertOne(newComment);
      res.send(result);
    });

    // deleting the wish card from database
    app.delete(`/wishlists/:blogId`, async (req, res) => {
      const blogId = req.params.blogId;
      const query = { blogId: blogId };
      // console.log(query);
      const result = await wishCollection.deleteOne(query);
      res.send(result);
    });
    // updating the blog data
    app.put(`/blogss/:id`, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedData = req.body;
      const blog = {
        $set: {
          category: updatedData.category,
          title: updatedData.title,
          image: updatedData.image,
          shortDescription: updatedData.shortDescription,
          longDescription: updatedData.longDescription,
          authorEmail: updatedData.authorEmail,
          authorImg: updatedData.authorImg,
          authorName: updatedData.authorName,
        },
      };
      const result = await blogCollection.updateOne(filter, blog, option);
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
