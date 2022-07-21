import Express from "express";
import Path from "path";
import { Scheduler } from "./scheduler";

let app = Express();

app.use(Express.static("webapp"));
app.use(Express.json()); // to support JSON-encoded bodies
app.use(Express.urlencoded());

app.listen(3002, () => {
  console.log("listening");
});

let scheduler = new Scheduler();

scheduler.run();
