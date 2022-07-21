import express from "express";
import path from "path";

let app = express();

app.use(express.static("webapp"));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded());

app.listen(3002, () => {
  console.log("listening");
});
