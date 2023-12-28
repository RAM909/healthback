const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const healthdata = new mongoose.Schema({
    Firstname: String,
    Lastname: String,
    Age: Number,
    Gender: String,
    Height: Number,
    Weight: Number,
    BMI: Number,
    Oxygen: Number,
    Heartrate: Number,
    Temperature: Number,
    ECG: String,
});

const Healthdata = mongoose.model("Healthdata", healthdata);

app.get("/update", async (req, res) => {
  try {
    const data = {
      Firstname: req.query.firstname,
      Lastname: req.query.lastname,
      Age: parseFloat(req.query.age),
      Gender: req.query.gender,
      Height: parseFloat(req.query.height),
      Weight: parseFloat(req.query.weight),
      BMI: parseFloat(req.query.bmi),
      Oxygen: parseFloat(req.query.oxygen),
      Heartrate: parseFloat(req.query.heartrate),
      Temperature: parseFloat(req.query.temperature),
      ECG: req.query.ecg
    };
    await Healthdata.create(data);
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});


app.get("/api/patient", async (req, res) => {
    try{
        const data = await Healthdata.find({}).exec();
        res.json(data);
    }catch(err){
        console.log(err);
    }
})

app.put("/api/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await Healthdata.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})
