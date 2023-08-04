const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbiibcp.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const tasksCollection = client.db("tasks-management").collection("tasks");

    // Get API to get all tasks
    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    // Post API to upload a new Task
    app.post("/new-task", async (req, res) => {
      const { newTask } = req.body;
      const result = await tasksCollection.insertOne(newTask);
      res.send(result);
    });

    // Patch API to update particular property. In this case status
    app.patch("/update-status/:id", async (req, res) => {
      const id = req.params.id;
      const { updatedStatus } = req.body;

      const query = { _id: new ObjectId(id) };

      const updatedTask = {
        $set: { status: updatedStatus },
      };

      const result = await tasksCollection.updateOne(query, updatedTask);
      res.send(result);
    });

    // Delete API to delete single task
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("task management is running");
});

app.listen(port, () => {
  console.log(`task management is running on port ${port}`);
});
