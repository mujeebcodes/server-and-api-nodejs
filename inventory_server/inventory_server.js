const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = 4000;
const dbDir = path.join(__dirname, "items.json");

const getAllItems = (res) => {
  fs.readFile(dbDir, "utf-8", (err, data) => {
    if (err) {
      res.writeHead(400);
      res.end("An error occurred");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(data);
  });
};

const getOneItem = (req, res) => {
  const itemId = Number(req.url.split("/")[2]);
  if (itemId) {
    fs.readFile(dbDir, "utf-8", (err, data) => {
      if (err) {
        res.writeHead(400);
        res.end("An error occurred");
        return;
      }

      const allItems = JSON.parse(data);
      const itemRequested = allItems.filter((item) => item.id === itemId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(itemRequested));
    });
  }
};

const addItem = (req, res) => {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const receivedData = Buffer.concat(body).toString();
    const parsedData = JSON.parse(receivedData);

    fs.readFile(dbDir, "utf-8", (err, data) => {
      if (err) {
        res.writeHead(400);
        res.end("An error occurred");
        return;
      }

      const allItems = JSON.parse(data);
      const newItems = [
        ...allItems,
        { ...parsedData, id: allItems.length + 1 },
      ];

      fs.writeFile(dbDir, JSON.stringify(newItems), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end("An error occured");
        }

        res.writeHead(200);
        res.end("New Item added successfully");
      });
    });
  });
};
const updateItem = (req, res) => {
  try {
    const indexToUpdate = Number(req.url.split("/")[2]) - 1;
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const receivedData = Buffer.concat(body).toString();
      const parsedData = JSON.parse(receivedData);

      fs.readFile(dbDir, "utf-8", (err, data) => {
        if (err) {
          res.writeHead(400);
          res.end("An error occurred");
          return;
        }

        const allItems = JSON.parse(data);
        parsedData.id = indexToUpdate + 1;
        allItems[indexToUpdate] = parsedData;

        fs.writeFile(dbDir, JSON.stringify(allItems), (err) => {
          if (err) {
            console.log(err);
            res.writeHead(500);
            res.end("An error occured");
          }

          res.writeHead(200);
          res.end("Item updated successfully");
        });
      });
    });
  } catch (error) {
    res.writeHead(500);
    res.end("An error occured");
  }
};

const deleteItem = (req, res) => {
  try {
    const idToDelete = Number(req.url.split("/")[2]);
    fs.readFile(dbDir, "utf-8", (err, data) => {
      if (err) {
        res.writeHead(400);
        res.end("An error occurred");
        return;
      }

      const allItems = JSON.parse(data);
      const newItems = allItems.filter((item) => item.id !== idToDelete);
      console.log(newItems);
      fs.writeFile(dbDir, JSON.stringify(newItems), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end("An error occured");
        }

        res.writeHead(200);
        res.end("Item deleted successfully");
      });
    });
  } catch (error) {
    res.writeHead(500);
    res.end("An error occured");
  }
};
const requestHandler = (req, res) => {
  if ((req.url === "/items" || req.url === "/items/") && req.method === "GET") {
    getAllItems(res);
  } else if (req.url.startsWith("/items/") && req.method === "GET") {
    getOneItem(req, res);
  } else if (req.url === "/items" && req.method === "POST") {
    addItem(req, res);
  } else if (req.url.startsWith("/items/") && req.method === "PUT") {
    updateItem(req, res);
  } else if (req.url.startsWith("/items/") && req.method === "DELETE") {
    deleteItem(req, res);
  } else {
    console.log("invalid method");
  }
};
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
