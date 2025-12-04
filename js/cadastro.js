document.getElementById("formCadastro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar").value;

  const mensagem = document.getElementById("mensagem");

  console.log("Senha:", senha);
  console.log("Confirmar:", confirmar);

  if (senha !== confirmar) {
    mensagem.innerText = "As senhas não conferem!";
    mensagem.style.color = "red";
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });

    const resultado = await resposta.json();

    mensagem.innerText = resultado.mensagem;
    mensagem.style.color = resultado.sucesso ? "green" : "red";

    if (resultado.sucesso) {
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    }

  } catch (erro) {
    mensagem.innerText = "Erro ao conectar com o servidor!";
    mensagem.style.color = "red";
  }
});
