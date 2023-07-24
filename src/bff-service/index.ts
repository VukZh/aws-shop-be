import express from "express";
import dotenv from "dotenv";
import * as process from "process";
import axios from "axios";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.listen(port, () => console.log(`Running on port ${port}`));

app.use(cors());
app.use(express.json());

type Recipient = "CARTS" | "PRODUCTS";

const cache = {
  products: {
    data: {},
    timestamp: 0,
  },
};

app.all("*/", (req, res) => {
  console.log("origURL", req.originalUrl);
  console.log("reqMethod", req.method);
  console.log("body", req.body);
  const recipient = req.originalUrl.split("/")[1];
  console.log("recipient", recipient);
  const recipientURL = process.env[recipient];
  console.log("recipientURL", recipientURL);
  if (recipientURL) {
    const reqConfig = {
      method: req.method,
      url: `${recipientURL}${req.originalUrl}`,
      ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
    };
    console.log("reqConfig", reqConfig);

    const now = Date.now();
    if (
      req.originalUrl === "/products" &&
      req.method === "GET" &&
      cache.products &&
      now - cache.products.timestamp < 120000
    ) {
      console.log("......... sent cache .........");
      return res.json(cache.products.data);
    } else {
      axios(reqConfig)
        .then((resp) => {
          console.log("response from recipient", resp.data);
          if (req.originalUrl === "/products" && req.method === "GET") {
            console.log("......... save cache .........");
            cache.products = {
              data: resp.data,
              timestamp: Date.now(),
            };
          }
          res.json(resp.data);
        })
        .catch((err) => {
          console.log("req error: ", JSON.stringify(err));
          if (err.response) {
            const { status, data } = err.response;
            res.status(status).json(data);
          } else {
            res.status(500).json({ error: err.message });
          }
        });
    }
  }
});
