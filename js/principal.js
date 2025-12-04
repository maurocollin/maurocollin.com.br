fetch("/usuario-logado")
  .then(res => res.json())
  .then(dados => {
    if (!dados.logado) {
      window.location.href = "/";
      return;
    }

    document.getElementById("boas-vindas").innerText =
      "Bem-vindo, " + dados.nome;
  });
