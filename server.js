require("dotenv").config(); // Adicione na primeira linha
const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcryptjs");
const authRouter = require("./routers/authRoutes");
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

// ✅ ROTA PRINCIPAL (LOGIN)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ ROTA PROTEGIDA COM MIDDLEWARE
app.get("/principal", autenticar, (req, res) => {
    res.sendFile(path.join(__dirname, "protected", "principal.html"));
});

// ✅ ROTAS (AUTENTICAÇÃO)
app.use("/auth", authRouter); // Exemplo: Rotas definidas em authRoutes.js serão acessadas via /auth/

// ✅ INICIA SERVIDOR
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
