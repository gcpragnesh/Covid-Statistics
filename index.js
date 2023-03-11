const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = 8080;
// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');
const { tallySchema } = require('./schema');

app.get("/totalRecovered", async (req, res) => {
  try {
    let dataSet = await connection.find();
    let recovered = 0;
    for (let i = 0; i < dataSet.length; i++) {
      recovered += dataSet[i].recovered;
    }
    res.status(200).json({
      data: { _id: 'total', recovered: recovered }
    })
  }
  catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message
    })
  }
})
app.get("/totalActive", async (req, res) => {
  try {
    let dataSet = await connection.find();
    let activePeople= 0;
    for (let i = 0; i < dataSet.length; i++) {
      let active = dataSet[i].infected - dataSet[i].recovered;
      activePeople += active;
    }
    res.status(200).json({
      data: { _id: 'total', active: activePeople }
    })
  }
  catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message
    })
  }
})

app.get("/totalDeath", async (req, res) => {
  try {
    let dataSet = await connection.find();
    let expired = 0;
    for (let i = 0; i < dataSet.length; i++) {
      expired += dataSet[i].death;
    }
    res.status(200).json({
      data: { _id: 'total', death: expired }
    })
  }
  catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message
    })
  }

})

app.get("/hotspotStates", async (req, res) => {
  try {
    let dataSet = await connection.find();
    let effectedAreasrate;
    let result = [];
    for (let i = 0; i < dataSet.length; i++) {
      effectedAreasrate= ((dataSet[i].infected - dataSet[i].recovered) / dataSet[i].infected);
      effectedAreasrate = effectedAreasrate.toFixed(5);
      if (effectedAreasrate > 0.1) {
        result.push({ state: dataSet[i].state, rate: effectedAreasrate });
      }
    }
    res.status(200).json({
      result
    })
  }
  catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message
    })
  }

})

app.get("/healthyStates", async (req, res) => {
  try{
    let dataSet = await connection.find();
    let healthyStatesRate;
    let result = [];
    for (let i = 0; i < dataSet.length; i++) {
      healthyStatesRate = ((dataSet[i].death) / dataSet[i].infected);
      healthyStatesRate = healthyStatesRate.toFixed(5);
      if (healthyStatesRate < 0.005) {
        result.push({ state: dataSet[i].state, mortality: healthyStatesRate });
      }
    }
    res.status(200).json({
      result
    })
  }
  catch(err){
    res.status(500).json({
      status: "failed",
      message: err.message
    })
  }
  
})







app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;