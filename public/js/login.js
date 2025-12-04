document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  try {
    const resposta = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();

    mensagem.innerText = resultado.mensagem;
    mensagem.style.color = resultado.sucesso ? "green" : "red";

    if (resultado.sucesso) {
      setTimeout(() => {
        window.location.href = "/principal";
      }, 800);
    }

  } catch (erro) {
    mensagem.innerText = "Erro ao conectar com o servidor!";
    mensagem.style.color = "red";
  }
});
