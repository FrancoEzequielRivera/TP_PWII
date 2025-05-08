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

    const precioLimpio = row[12].replace(/^USD\s+/i, '');

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
      precio: precioLimpio,          // Launched Price (USA)
      anio: row[14]             // Launched Year
    });
  })
  .on("end", () => {
    console.log("CSV de celulares cargado en memoria");
  });


// Endpoints CRUD

app.get("/celulares", (req, res) => {
  res.status(200).json(celulares);
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
  res.status(200).json({ mensaje: "Celular actualizado con éxito" });
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

// Funciones adicionales

// Filtrar celulares por empresa
app.get("/celulares/empresa/:empresa", (req, res) => {
  const empresa = req.params.empresa.toLowerCase();
  const resultados = celulares.filter(c => 
    c.empresa.toLowerCase().includes(empresa)
  );
  
  if (resultados.length === 0) {
    return res.status(404).json({ 
      mensaje: `No se encontraron celulares de la empresa ${empresa}`,
      sugerencia: "Verifique el nombre de la empresa o intente con otro término"
    });
  }
  
  res.status(200).json({
    cantidad: resultados.length,
    resultados
  });
});

// Filtrar celulares por rango de precio
app.get("/celulares/precio", (req, res) => {
  const { min, max } = req.query;

  if (!min || !max) {
    return res.status(400).json({ 
      error: "Debe proporcionar los parámetros 'min' y 'max'",
      ejemplo: "/celulares/precio?min=100&max=500"
    });
  }

  if (isNaN(min) || isNaN(max)) {
    return res.status(400).json({ 
      error: "Los valores de precio deben ser números válidos" 
    });
  }

  const resultados = celulares.filter(c => 
    c.precio >= min && c.precio <= max
  ).sort((a, b) => a.precio - b.precio);

  res.status(200).json({
    rango: `$${min} - $${max}`,
    cantidad: resultados.length,
    celulares: resultados
  });
});

app.get("/celulares/:id", (req, res) => {
  const id = req.params.id;
  const celular = celulares.find((c) => c.id == id);

  if (!celular) {
    return res.status(404).json({ mensaje: "Celular no encontrado" });
  }

  res.status(200).json(celular);
});

app.listen(7050, () => {
  console.log("Servidor corriendo en http://localhost:7050");
});