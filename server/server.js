import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  const messages = [];

  io.on("connection", (socket) => {
    console.log("🔥 connection:", socket.id);
    console.log("📮 Messages:", messages);
    socket.emit("initial emit messages", messages);

    // server catching new message
    socket.on("new message", (data) => {
      console.log("📤 new message", data);
      messages.push(data);
      io.emit("new message", data);
    });
  });

  io.on("disconnect", () => {
    console.log("🔥 disconnect:", socket.id);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
