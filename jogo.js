function resultado() {
    let pontos = 0;
    let total = 15;

    // ===== PERGUNTAS 1 a 15 (exceto 4 e 13) =====
    for (let i = 1; i <= 15; i++) {
        if (i === 4 || i === 13) continue;

        let opcoes = document.getElementsByName("pergunta" + i);

        for (let opcao of opcoes) {
            if (opcao.checked && opcao.value === "true") {
                pontos++;
            }
        }
    }

    // ===== PERGUNTA 4 (CHECKBOX) =====
    let p4 = document.getElementsByName("pergunta4");
    let acertos = 0;
    let erros = 0;

    for (let opcao of p4) {
        if (opcao.checked && opcao.value === "true") acertos++;
        if (opcao.checked && opcao.value === "false") erros++;
    }

    // só ganha ponto se marcar TODAS corretas e nenhuma errada
    if (acertos === 2 && erros === 0) {
        pontos++;
    }

    // ===== PERGUNTA 13 (DATA) =====
    let data = document.getElementById("p13").value;

    // aceita qualquer data de 1969 (evita erro chato)
    if (data.startsWith("1969-10-29")) {
        pontos++;
    }

    // ===== RESULTADO =====
    let mensagem = "";

    if (pontos <= 5) {
        mensagem = "Você precisa estudar mais 😅";
    } else if (pontos <= 10) {
        mensagem = "Você foi bem 👍";
    } else if (pontos <= 14) {
        mensagem = "Mandou muito bem 🔥";
    } else {
        mensagem = "PERFEITO! Você zerou o quiz 😎🏆";
    }

    alert("Pontuação: " + pontos + "/" + total + "\n" + mensagem);
}