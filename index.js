const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();

app.use(morgan("dev"));
app.use(express.json());

let celulares = [];
let cont = 0;
let primerFila = true;

// Cargar datos desde el CSV al iniciar
fs.createReadStream("celulares.csv")
  .pipe(csv({ headers: false}))
  .on("data", (row) => {

    // Saltear primer fila del csv con datos no útiles
    if (primerFila){
      primerFila = false;
      return;
    }

    celulares.push({
      id: cont++,               // Id incremental
      empresa: row[0],          // Company Name
      modelo: row[1],           // Model Name
      peso: row[2],             // Mobile Weight
      ram: row[3],              // RAM
      camara_frontal: row[4],   // Front Camera
      camara_trasera: row[5],   // Back Camera
      procesador: row[6],       // Processor
      bateria: row[7],          // Battery Capacity
      pantalla: row[8],         // Screen Size
      precio: row[12],          // Launched Price (USA)
      anio: row[14]             // Launched Year
    });
  })
  .on("end", () => {
    console.log("CSV de celulares cargado en memoria");
  });


// Endpoints CRUD

app.get("/celulares", (req, res) => {
  res.json(celulares);
});

app.post("/celulares", (req, res) => {
  const nuevoCelular = req.body;
  celulares.push(nuevoCelular);
  res.status(201).json({ mensaje: "Celular agregado", celular: nuevoCelular });
});

app.put("/celulares/:id", (req, res) => {
  const id = req.params.id;
  const index = celulares.findIndex((c) => c.id == id);

  if (index === -1) {
    return res.status(404).json({ mensaje: "Celular no encontrado" });
  }

  celulares[index] = { ...celulares[index], ...req.body };
  res.json({ mensaje: "Celular actualizado con éxito" });
});

app.delete("/celulares/:id", (req, res) => {
  const id = req.params.id;
  const index = celulares.findIndex((c) => c.id == id);

  if (index === -1) {
    return res.status(404).json({ mensaje: "Celular no encontrado" });
  }

  celulares.splice(index, 1);
  res.sendStatus(204);
});

app.get("/celulares/:id", (req, res) => {
  const id = req.params.id;
  const celular = celulares.find((c) => c.id == id);

  if (!celular) {
    return res.status(404).json({ mensaje: "Celular no encontrado" });
  }

  res.json(celular);
});

app.listen(7050, () => {
  console.log("Servidor corriendo en http://localhost:7050");
});