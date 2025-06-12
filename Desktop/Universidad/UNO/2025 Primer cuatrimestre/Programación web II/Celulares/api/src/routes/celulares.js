const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all celulares
router.get('/', (req, res) => {
    db.all('SELECT * FROM Celulares', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET a single celular by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM Celulares WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Celular not found' });
        }
    });
});

// POST a new celular (CREATE)
router.post('/', (req, res) => {
    const { marca, modelo, peso, ram, camara_frontal, camara_trasera, procesador, capacidad_bateria, tamanio_pantalla, precio, lanzamiento } = req.body;
    if (!marca || !modelo || !precio) {
        return res.status(400).json({ message: 'Marca, modelo y precio son campos requeridos.' });
    }

    const sql = `INSERT INTO Celulares (marca, modelo, peso, ram, camara_frontal, camara_trasera, procesador, capacidad_bateria, tamanio_pantalla, precio, lanzamiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [marca, modelo, peso, ram, camara_frontal, camara_trasera, procesador, capacidad_bateria, tamanio_pantalla, precio, lanzamiento], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// PUT/PATCH update an existing celular (UPDATE)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { marca, modelo, peso, ram, camara_frontal, camara_trasera, procesador, capacidad_bateria, tamanio_pantalla, precio, lanzamiento } = req.body;
    const sql = `UPDATE Celulares SET
                    marca = COALESCE(?, marca),
                    modelo = COALESCE(?, modelo),
                    peso = COALESCE(?, peso),
                    ram = COALESCE(?, ram),
                    camara_frontal = COALESCE(?, camara_frontal),
                    camara_trasera = COALESCE(?, camara_trasera),
                    procesador = COALESCE(?, procesador),
                    capacidad_bateria = COALESCE(?, capacidad_bateria),
                    tamanio_pantalla = COALESCE(?, tamanio_pantalla),
                    precio = COALESCE(?, precio),
                    lanzamiento = COALESCE(?, lanzamiento)
                WHERE id = ?`;
    db.run(sql, [marca, modelo, peso, ram, camara_frontal, camara_trasera, procesador, capacidad_bateria, tamanio_pantalla, precio, lanzamiento, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Celular not found' });
        } else {
            res.json({ message: 'Celular updated successfully', changes: this.changes });
        }
    });
});

// DELETE a celular (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Celulares WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Celular not found' });
        } else {
            res.json({ message: 'Celular deleted successfully', changes: this.changes });
        }
    });
});

module.exports = router;