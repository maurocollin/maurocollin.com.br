require("dotenv").config(); // Adicione na primeira linha
const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcryptjs");
const mariadb = require("mariadb");
const app = express();

// ✅ Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));

// ✅ SESSÃO (APENAS UMA VEZ!)
 app.use(
    session({
        secret: process.env.SESSION_SECRET,
        name: "maurocollin.sid",
        secret: "chave-super-secreta-123",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 // 1 hora
        }
    })
);

// ✅ MIDDLEWARE DE AUTENTICAÇÃO
function autenticar(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/");
    }

    next(); // continua para a rota
}

// ✅ CONEXÃO COM O MARIADB
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5
});
// const pool = mariadb.createPool({
//     host: "maurocollin.com.br",
//     user: "mauro",
//     password: "LA01ks92",
//     database: "maurocollin",
//     connectionLimit: 5
// });



// ✅ ROTA PRINCIPAL (LOGIN)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ ROTA PROTEGIDA COM MIDDLEWARE
app.get("/principal", autenticar, (req, res) => {
    res.sendFile(path.join(__dirname, "protected", "principal.html"));
});

// ✅ CADASTRO
app.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.json({ sucesso: false, mensagem: "Preencha todos os campos!" });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const conn = await pool.getConnection();

        await conn.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            [nome, email, hash]
        );

        conn.release();

        return res.json({ sucesso: true, mensagem: "Cadastro realizado com sucesso!" });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.json({ sucesso: false, mensagem: "Este email já está cadastrado!" });
        }

        console.error("Erro no cadastro:", err);
        return res.json({ sucesso: false, mensagem: "Erro no servidor!" });
    }
});

// ✅ LOGIN COM SESSÃO REAL (CORRIGIDO!)
app.post("/login", async (req, res) => {
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

        // ✅ GRAVA A SESSÃO CORRETAMENTE
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
app.get("/usuario-logado", (req, res) => {
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
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// ✅ INICIA SERVIDOR
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
