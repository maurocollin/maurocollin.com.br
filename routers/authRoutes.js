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
    // NOTA: Precisaremos de pool e bcrypt aqui! Por enquanto, vamos manter
    // a lógica de banco (pool) no server.js. No próximo passo, vamos separá-la.
    const { nome, email, senha } = req.body;

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
        console.error("Erro no cadastro:", err);
        return res.json({ sucesso: false, mensagem: "Erro ao cadastrar usuário." });
    }
});

// ✅ Rota de Login
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.json({ sucesso: false, mensagem: "Preencha todos os campos!" });
    }

    try {
        const conn = await pool.getConnection();

        const rows = await conn.query(
            "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
            [email]
        );

        conn.release();

        if (rows.length === 0) {
            return res.json({ sucesso: false, mensagem: "Email ou senha inválidos!" });
        }

        const usuario = rows[0];
        const senhaOk = await bcrypt.compare(senha, usuario.senha);

        if (!senhaOk) {
            return res.json({ sucesso: false, mensagem: "Email ou senha inválidos!" });
        }

        // ✅ GRAVA A SESSÃO
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        return res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso!"
        });

    } catch (err) {
        console.error("Erro no login:", err);
        return res.json({ sucesso: false, mensagem: "Erro no servidor!" });
    }
});

// ✅ ROTA PARA BUSCAR DADOS DO USUÁRIO LOGADO
router.get("/usuario-logado", (req, res) => {
    if (!req.session.usuario) {
        return res.json({ logado: false });
    }

    return res.json({
        logado: true,
        nome: req.session.usuario.nome,
        email: req.session.usuario.email
    });
});

// ✅ LOGOUT REAL
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        // Redireciona para a raiz que é a página de login
        res.redirect("/");
    });
});
// ----------------------------------------------------
// ⚠️ ESTE É UM ARQUIVO DE ROTA. A LÓGICA SERÁ INSERIDA AQUI!
// ----------------------------------------------------

// Exemplo de rota de teste:
router.get('/', (req, res) => {
    res.send('Controller de Autenticação OK!');
});

module.exports = router; // Exportamos o objeto 'router'