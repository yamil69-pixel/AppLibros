const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const bodyParser = require('body-parser');

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');

// Middleware para manejar datos de formularios
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Rutas
const bookRoutes = require('./rutas/routes');
app.use('/', bookRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});