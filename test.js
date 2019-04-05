// Prequisites: node, npm

// Swim dependencies:

// 1. run `npm install swim-client-js` (without backticks)
// 2. run `npm install recon-js`

// Run:

// `node test.js`

// TODO:
// 1. Stand up a websocket server, build dependencie
// 2. Change the "console.logs" to instead publish messages to your websocket

const swim = require('swim-client-js')
const recon = require('recon-js')
const https = require('https')

function downlinkMap(node, lane, du) {
  var link = swim.downlinkMap()
    .host(host)
    .node(node)
    .lane(lane)
    .didUpdate(du)
    .open();
  return link;
}

function intToColor(i) {
  return 1 === i ? "RED" : 2 === i ? "YELLOW" : "GREEN";
}

// script begins here
const host = "warps://traffic.swim.services";

function postToAtomist(data) {
  const options = {
    hostname: "webhook.atomist.com",
    port: 443,
    path: "/atomist/teams/ANEH67BKA/ingestion/TrafficLight/2de35b6f-d1f0-4621-b5b8-7cdad5c52482",
    method: 'POST',
    headers: {
      'Content-Type': "application/json"
    }
  }
  var req = https.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.write(JSON.stringify(data));

  req.end();
}

// runs forever (until termination_
downlinkMap('/intersection/US/CA/PaloAlto/52', 'phase/state',
  (k, v) => {
    if (k === 1) {
      console.log("Webster Street: " + intToColor(v));
      postToAtomist({
        color: intToColor(v),
        street: "Webster"
      });
    } else { // k == 0
      console.log("University Avenue: " + intToColor(v));
      postToAtomist({
        color: intToColor(v),
        street: "University"
      });
    }
  });