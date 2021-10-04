import express from "express";
import fs from "fs";
import path from "path";

import React from "react";
import ReactDOMServer from "react-dom/server";

import Home from "../src/App";
import Login from "../src/pages/Login";

const PORT = 8000;

const app = express();
var  bodyParser = require('body-parser')
var crypto = require("crypto");
var consumerSecretApp = process.env.CANVAS_CONSUMER_SECRET || '4781198AC130D7DD102AB6F3F19F6DC224FA5E4F541E3879FB8D5FF232FD5113';
console.log('consumer secret - '+consumerSecretApp);

app.post('/', function (req, res) { 
  var bodyArray = req.body.signed_request.split(".");
    var consumerSecret = bodyArray[0];
    var encoded_envelope = bodyArray[1];

    var check = crypto.createHmac("sha256", consumerSecretApp).update(encoded_envelope).digest("base64");
    console.log('check',check);
    console.log('consumerSecret',consumerSecret);
    if (check === consumerSecret) { 
        var envelope = JSON.parse(new Buffer(encoded_envelope, "base64").toString("ascii"));
        //req.session.salesforce = envelope;
        console.log("got the session object:");
        console.log(envelope);
        console.log(JSON.stringify(envelope) );

        fs.readFile(path.resolve("./build/index.html"), "utf-8", (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).send("Some error happened");
          }
          return res.send(
            data.replace(
              '<div id="root"></div>',
              `<div id="root">${ReactDOMServer.renderToString(<Home />)}</div>`
            )
          );
        });
    }else{
        res.send("authentication failed");
    } 
})
 

app.use("^/$", (req, res, next) => {
  fs.readFile(path.resolve("./build/index.html"), "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Some error happened");
    }
    return res.send(
      data.replace(
        '<div id="root"></div>',
        `<div id="root">${ReactDOMServer.renderToString(<Login />)}</div>`
      )
    );
  });
});

app.use(express.static(path.resolve(__dirname, '..', 'build')))

app.listen(PORT, () => {
  console.log(`App launched on ${PORT}`);
});
