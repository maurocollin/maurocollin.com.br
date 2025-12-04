// migrar_senhas.js
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");

const file = path.join(__dirname, "usuarios.json");
const SALT_ROUNDS = 10;

if (!fs.existsSync(file)) {
  console.log("Arquivo usuarios.json não existe.");
  process.exit(0);
}

let usuarios = JSON.parse(fs.readFileSync(file, "utf8"));

// Para cada usuário, se a senha parecer não-hash (curta, sem caractere $), faz hash.
// OBS: isso é uma heurística. Verifique manualmente o resultado.
(async () => {
  for (let u of usuarios) {
    if (typeof u.senha === "string" && !u.senha.startsWith("$2a$") && !u.senha.startsWith("$2y$") && !u.senha.startsWith("$2b$")) {
      console.log("Hashing senha do usuário:", u.email);
      u.senha = await bcrypt.hash(u.senha, SALT_ROUNDS);
    } else {
      console.log("Senha já parece hash:", u.email);
    }
  }

  fs.writeFileSync(file, JSON.stringify(usuarios, null, 2));
  console.log("Migração concluída.");
})();
