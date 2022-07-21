const express = require('express')
const path = require('path');
const scheduler = require('./src/scheduler.ts');

app = express()

app.use(express.static('webapp'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.listen(3002, () => {
    console.log('listening');
})

let Scheduler
