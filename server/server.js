const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;

const htmlFileDir = path.join(__dirname, "index.html");
console.log(htmlFileDir);

const server = http.createServer((req, res) => {
  if (req.url === "/index.html") {
    fs.readFile("./index.html", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else {
    console.log("connection received");
    res.writeHead(404);
    res.end("Page not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on Port ${PORT}`);
});
