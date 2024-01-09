const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('Header'));

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

const convertToCSV = async (data) => {
  const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: Object.keys(data[0]).map(field => ({ id: field, title: field })),
  });

  await csvWriter.writeRecords(data);
  console.log('CSV file has been written successfully');
};


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

app.get('/download-csv', async (req, res) => {
  const data = await Healthdata.find({}).exec();
  console.log(data)
  const csvData = convertToCSV(data);
  const fileName = 'output.csv';

  // Write CSV data to a file
  fs.writeFileSync(fileName, csvData);

  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  // Send the file to the client
  res.sendFile(fileName, (err) => {
    // Clean up: delete the file after sending
    fs.unlinkSync(fileName);
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
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
