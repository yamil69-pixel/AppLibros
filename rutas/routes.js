const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql');

// Crear conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'app-libros'
});

// Conectar y crear tablas si no existen
connection.connect((error) => {
    if (error) throw error;
    console.log('Conexión establecida con éxito');

    // Script para crear las tablas
    const createTableUsers = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL
    )`;
    
    const createTableBooks = `CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        description TEXT,
        cover_image VARCHAR(255),
        genre VARCHAR(100)
    );`;
    
    const createTableUserFavoriteBooks = `CREATE TABLE IF NOT EXISTS userFavoriteBooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        bookId INT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (bookId) REFERENCES books(id),
        UNIQUE(userId, bookId)
    );`;

    connection.query(createTableUsers, (error, result) => {
        if (error) throw error;
        console.log('Tabla de usuarios creada o ya existente');
    });

    connection.query(createTableBooks, (error, result) => {
        if (error) throw error;
        console.log('Tabla de libros creada o ya existente');
    });
    connection.query(createTableUserFavoriteBooks, (error, result) => {
        if (error) throw error;
        console.log('Tabla de libros favoritos de usuarios creada o ya existente');
    });
});

// Ruta de la página principal
router.get('/', async (req, res) => {
    try {
        // Lógica para obtener libros recomendados
        const recommendedBooks = await getRecommendedBooks();
        res.render('index', { books: recommendedBooks });
    } catch (error) {
        console.error('Error al obtener libros de la API:', error);
        res.status(500).send('Error al obtener libros de la API');
    }
});

// Ruta para mostrar detalles de un libro
router.get('/book/:id', async (req, res) => {
    try {
        // Lógica para obtener detalles de un libro
        const bookId = req.params.id;
        const book = await getBookDetails(bookId);
        res.render('book-details', { book });
    } catch (error) {
        console.error('Error al obtener detalles del libro:', error);
        res.status(500).send('Error al obtener detalles del libro');
    }
});

// Ruta para la búsqueda de libros
router.get('/search', async (req, res) => {
    try {
        // Lógica para buscar libros
        const searchTerm = req.query.q;
        const searchResults = await searchBooks(searchTerm);
        res.render('search', { searchTerm, results: searchResults });
    } catch (error) {
        console.error('Error al buscar libros en la API:', error);
        res.status(500).send('Error al buscar libros en la API');
    }
});

// Ruta para mostrar la lista de libros favoritos
router.get('/favorites', (req, res) => {
    // Lógica para obtener la lista de libros favoritos desde la base de datos
    const favoriteBooks = []; 
    res.render('favorites', { favoriteBooks });
});

// Funciones de ayuda
async function getRecommendedBooks() {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
            q: 'fiction', 
            maxResults: 10, 
            key: 'AIzaSyA4qpaus17TSxheo_5s_YxVP3lMlbQ4pZg'
        }
    });
    return response.data.items.map(item => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Desconocido',
        genre: item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Desconocido',
        synopsis: item.volumeInfo.description ? item.volumeInfo.description.substring(0, 100) + '...' : 'Sin descripción disponible',
        id: item.id
    }));
}

async function getBookDetails(bookId) {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
    const bookData = response.data.volumeInfo;
    return {
        title: bookData.title,
        author: bookData.authors ? bookData.authors.join(', ') : 'Desconocido',
        genre: bookData.categories ? bookData.categories.join(', ') : 'Desconocido',
        synopsis: bookData.description ? bookData.description.substring(0, 100) + '...' : 'Sin descripción disponible'
    };
}

async function searchBooks(searchTerm) {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
            q: searchTerm,
            maxResults: 10, 
            key: 'AIzaSyA4qpaus17TSxheo_5s_YxVP3lMlbQ4pZg'
        }
    });
    return response.data.items.map(item => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Desconocido',
        genre: item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Desconocido',
        synopsis: item.volumeInfo.description ? item.volumeInfo.description.substring(0, 100) + '...' : 'Sin descripción disponible'
    }));
}

module.exports = router;
