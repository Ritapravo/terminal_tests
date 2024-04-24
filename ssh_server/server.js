const express = require("express");
const http = require("http");
const SSHClient = require("ssh2").Client;
const utf8 = require("utf8");

const app = express();
const serverPort = 8080;
const server = http.createServer(app);

// Socket.IO setup with allowed origins
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("SSH Terminal Backend");
});

server.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});

io.on("connection", function (socket) {
  var ssh = new SSHClient();

  ssh
    .on("ready", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
      ssh.shell(function (err, stream) {
        if (err)
          return socket.emit(
            "data",
            "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
          );
        socket.on("data", function (data) {
          stream.write(data);
        });
        stream
          .on("data", function (d) {
            socket.emit("data", utf8.decode(d.toString("binary")));
          })
          .on("close", function () {
            ssh.end();
          });
      });
    })
    .on("close", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
    })
    .on("error", function (err) {
      console.log(err);
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );
    })
    .connect({
      host: "10.130.151.162",
      port: "22",
      username: "ritpravo",
      password: "kuchupuchu",
    });
});
