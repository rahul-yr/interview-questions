const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const { connect } = require("mongoose");
const { success, error, info } = require("consola");

// User defined imports
const { DB, PORT } = require("./config");

// create constants
const app = express();

// use the properties
app.use(bodyParser.json())
app.use(cors())

// Routers
app.use("/api/login", require("./login/routes"));
app.use("/api/subjects", require("./subjects/routes"));
app.use("/api/questions", require("./questions/routes"));
app.use("/api/topics", require("./topics/routes"));

const startApp = async () => {
    try {
        // Connection With DB
        info({
          message:`Initializing the Express Server`,
          badge:true
        });
        await connect(DB, {
          useFindAndModify: false,
          useCreateIndex: true,
          useUnifiedTopology: true,
          useNewUrlParser: true
        });
    
        success({
          message: `Successfully connected with the Mongo DB`,
          badge: true
        });
    
        // Start Listenting for the server on PORT
        app.listen(PORT, () =>
          success({ message: `Express Server started on PORT ${PORT}`, badge: true })
        );
    } catch (err) {
        error({
          message: `Unable to connect with Database ${err}`,
          badge: true
        });
        startApp();
    }
};
  
startApp();