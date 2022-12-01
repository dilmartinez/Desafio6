const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IO } = require("socket.io");

const PORT = 8080;

//--------------------------------------------
// instancio servidor, socket y api
const app = express();
const httpServer = new HttpServer(app);
const io = new IO(httpServer);

//--------------------------------------------
// agrego middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("views", "./views/pages");
app.set("view engine", "ejs");

//--------------------------------------------
// configuro el socket mensajes y productos
const messages = [{ author: "Juan", text: "Hola, que tal" }];

const products = []

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // envio el historial del array que tengo cuando un cliente nuevo se conecte
  socket.emit("message", messages);

  // una vez escuchamos al cliente y recibimos un mensaje, realizamos el envio a todos los demas pusheandolo a un array
  socket.on("new-message", (data) => {
    messages.push(data);

    // reenviamos por medio broadcast los msn a todos los clientes que esten conectados en ese momento
    io.sockets.emit("message", messages);
  });

});

//--------------------------------------------
// endpoints
app.get("/productos", (req, res) => {
  res.render("stock", { products });
});

app.get("/cargaProd", (req, res) => {
  res.render("inicio", { products });
});

app.post("/productos", (req, res) => {
  products.push(req.body);
  res.redirect("/productos");
});

//--------------------------------------------
// inicio el servidor

const servidor = httpServer.listen(PORT, () => {
  console.log(
    `Servidor http escuchando en el puerto ${servidor.address().port}`
  );
});
servidor.on("error", (error) => console.log(`Error en servidor ${error}`));
