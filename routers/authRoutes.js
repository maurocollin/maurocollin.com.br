// authRoutes.js
const express = require('express');
const router = express.Router();
// NOTA: Vamos mover as dependências de banco e bcrypt aqui depois, mas por enquanto, vamos importar de server.js para testar a rota

// ✅ Importando a lógica de banco (o Model)
const pool = require('../models/db'); 

// ✅ Importando bcrypt (aqui, pois é o controller que o utiliza)
const bcrypt = require("bcryptjs");

// Rota de Cadastro - AGORA DENTRO DO CONTROLLER
router.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.json({ sucesso: false, mensagem: "Preencha todos os campos!" });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const conn = await pool.getConnection(); // ⚠️ pool e bcrypt não estão definidos aqui!

        await conn.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            [nome, email, hash]
        );

        conn.release();

        return res.json({ sucesso: true, mensagem: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
             return res.json({ sucesso: false, mensagem: "Este email já está cadastrado!" });
        }
        console.error("Erro no cadastro:", err);
        return res.json({ sucesso: false, mensagem: "Erro ao cadastrar usuário." });
    }
});
// ----------------------------------------------------
// ⚠️ ESTE É UM ARQUIVO DE ROTA. A LÓGICA SERÁ INSERIDA AQUI!
// ----------------------------------------------------

// Exemplo de rota de teste:
router.get('/', (req, res) => {
    res.send('Controller de Autenticação OK!');
});

module.exports = router; // Exportamos o objeto 'router'