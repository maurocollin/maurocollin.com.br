// db.js (O "Model" do banco de dados)

require("dotenv").config(); // Garante que as variáveis de ambiente estão carregadas

const mariadb = require("mariadb");

// Usamos as variáveis de ambiente já configuradas
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

// Exportamos o pool para que qualquer parte do código possa usá-lo
module.exports = pool;