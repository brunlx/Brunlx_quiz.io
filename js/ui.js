const UI = {
    elementos: {},

    cacheElementos() {
        this.elementos = {
            quizList: document.getElementById("quiz-list"),
            progressoAtual: document.getElementById("progresso-atual"),
            progressoTotal: document.getElementById("progresso-total"),
            btnFinalizar: document.getElementById("btn-finalizar"),
            btnVoltar: document.getElementById("btn-voltar"),
            modalResultado: document.getElementById("modal-resultado-overlay"),
            modalContinuar: document.getElementById("modal-continuar-overlay"),
            modalConteudo: document.getElementById("result-content"),
            btnFecharModal: document.getElementById("btn-fechar-modal"),
            btnReiniciar: document.getElementById("btn-reiniciar"),
            btnContinuar: document.getElementById("btn-continuar"),
            btnNovoQuiz: document.getElementById("btn-novo-quiz")
        };
    },

    renderizarQuiz(perguntas) {
        const container = this.elementos.quizList;
        container.innerHTML = "";

        perguntas.forEach((pergunta, indice) => {
            const itemEl = document.createElement("div");
            itemEl.classList.add("quiz-item");
            itemEl.id = `quiz-item-${indice}`;
            itemEl.setAttribute("role", "group");
            itemEl.setAttribute("aria-labelledby", `quiz-item-titulo-${indice}`);

            let html = `<h2 class="quiz-item__titulo" id="quiz-item-titulo-${indice}">${indice + 1}. ${pergunta.texto}</h2>`;

            if (pergunta.imagem) {
                html += `<img src="${pergunta.imagem}" alt="${pergunta.imagemAlt}" class="quiz-item__imagem" width="350" height="200" loading="lazy" decoding="async">`;
            }

            if (pergunta.codigo) {
                html += `<pre class="quiz-item__codigo"><code>${this.escapeHtml(pergunta.codigo)}</code></pre>`;
            }

            if (pergunta.multipla) {
                html += `<p class="quiz-item__multipla">Ha Mais De Uma Resposta Correta!</p>`;
            }

            html += this.renderizarOpcoes(pergunta, indice);

            itemEl.innerHTML = html;
            container.appendChild(itemEl);
        });

        this.elementos.progressoTotal.textContent = perguntas.length;
    },

    renderizarOpcoes(pergunta, indice) {
        if (pergunta.tipo === "radio") {
            return this.renderizarListaOpcoes(pergunta, indice, "radio");
        } else if (pergunta.tipo === "checkbox") {
            return this.renderizarListaOpcoes(pergunta, indice, "checkbox");
        } else if (pergunta.tipo === "number") {
            return `<input type="number" class="quiz-item__numero" name="pergunta-${indice}" id="pergunta-${indice}-input" min="1900" max="2100" placeholder="Ano" aria-labelledby="quiz-item-titulo-${indice}">`;
        }
        return "";
    },

    renderizarListaOpcoes(pergunta, indice, tipo) {
        let html = `<ul class="quiz-item__opcoes">`;
        pergunta.opcoes.forEach((opcao, i) => {
            html += `
                <li>
                    <input type="${tipo}" name="pergunta-${indice}" id="pergunta-${indice}-${i}" value="${i}" aria-labelledby="quiz-item-titulo-${indice}">
                    <label for="pergunta-${indice}-${i}">${opcao}</label>
                </li>`;
        });
        html += `</ul>`;
        return html;
    },

    atualizarProgresso(perguntas) {
        let respondidas = 0;

        perguntas.forEach((pergunta, indice) => {
            if (pergunta.tipo === "radio") {
                const selecionado = document.querySelector(`input[name="pergunta-${indice}"]:checked`);
                if (selecionado) respondidas++;
            } else if (pergunta.tipo === "checkbox") {
                const selecionados = document.querySelectorAll(`input[name="pergunta-${indice}"]:checked`);
                if (selecionados.length > 0) respondidas++;
            } else if (pergunta.tipo === "number") {
                const input = document.getElementById(`pergunta-${indice}-input`);
                if (input && input.value) respondidas++;
            }
        });

        this.elementos.progressoAtual.textContent = respondidas;
    },

    abrirModal(modalEl) {
        modalEl.classList.add("modal-overlay--ativo");
        modalEl.setAttribute("aria-hidden", "false");
    },

    fecharModal(modalEl) {
        modalEl.classList.remove("modal-overlay--ativo");
        modalEl.setAttribute("aria-hidden", "true");
    },

    exibirResultado(resultado) {
        const { pontos, detalhes, tempoGasto } = resultado;
        const total = PERGUNTAS.length;
        const mensagem = this.getMensagem(pontos, total);

        let html = `
            <div class="result__pontuacao">Pontuacao: ${pontos}/${total}</div>
            <div class="result__mensagem">${mensagem}</div>
            <div class="result__timer">Tempo: ${tempoGasto}</div>
            <div class="result__detalhes">
                <h3>Detalhamento das Respostas</h3>`;

        detalhes.forEach((detalhe, indice) => {
            const classe = detalhe.acertou ? "result__item--correto" : "result__item--errado";
            const icone = detalhe.acertou ? "✓" : "✗";
            html += `
                <div class="result__item ${classe}">
                    <p class="result__item-pergunta">${icone} ${indice + 1}. ${this.escapeHtml(detalhe.pergunta)}</p>
                    <p class="result__item-resposta">Sua resposta: ${this.escapeHtml(detalhe.respostaUsuario)}</p>`;
            if (!detalhe.acertou) {
                html += `<p class="result__item-resposta">Resposta correta: ${this.escapeHtml(detalhe.respostaCorreta)}</p>`;
            }
            html += `<p class="result__item-explicacao">${detalhe.explicacao}</p></div>`;
        });

        html += `</div>`;
        html += this.renderizarRanking();

        this.elementos.modalConteudo.innerHTML = html;
        this.abrirModal(this.elementos.modalResultado);
        this.elementos.btnFecharModal.focus();
    },

    renderizarRanking() {
        const ranking = Storage.getRanking();
        if (ranking.length === 0) {
            return `<div class="ranking__titulo">Ranking</div><p class="ranking__vazio">Nenhuma pontuacao registrada ainda.</p>`;
        }

        let html = `<div class="ranking__titulo">Ranking - Top 10</div><ul class="ranking__lista">`;
        ranking.forEach((item, indice) => {
            html += `
                <li class="ranking__item">
                    <span>#${indice + 1} - ${item.pontos}/${PERGUNTAS.length}</span>
                    <span>${item.tempo}</span>
                    <span>${this.formatarData(item.data)}</span>
                </li>`;
        });
        html += `</ul>`;
        return html;
    },

    exibirModalContinuar() {
        this.abrirModal(this.elementos.modalContinuar);
    },

    fecharModalContinuar() {
        this.fecharModal(this.elementos.modalContinuar);
    },

    carregarRespostasSalvas(respostas) {
        Object.entries(respostas).forEach(([indice, resposta]) => {
            if (resposta.tipo === "radio") {
                const input = document.querySelector(`input[name="pergunta-${indice}"][value="${resposta.valor}"]`);
                if (input) input.checked = true;
            } else if (resposta.tipo === "checkbox") {
                resposta.valores.forEach(valor => {
                    const input = document.querySelector(`input[name="pergunta-${indice}"][value="${valor}"]`);
                    if (input) input.checked = true;
                });
            } else if (resposta.tipo === "number") {
                const input = document.getElementById(`pergunta-${indice}-input`);
                if (input) input.value = resposta.valor;
            }
        });
        this.atualizarProgresso(PERGUNTAS);
    },

    resetarFormulario() {
        document.getElementById("quiz-form").reset();
        document.querySelectorAll(".quiz-item").forEach(el => {
            el.classList.remove("quiz-item--correto", "quiz-item--errado");
        });
        this.atualizarProgresso(PERGUNTAS);
    },

    getMensagem(pontos, total) {
        const percentual = (pontos / total) * 100;
        if (percentual === 100) return "PERFEITO! Voce zerou o quiz!";
        if (percentual >= 80) return "Mandou muito bem!";
        if (percentual >= 60) return "Voce foi bem!";
        if (percentual >= 40) return "Pode melhorar!";
        return "Voce precisa estudar mais!";
    },

    formatarData(dataStr) {
        const data = new Date(dataStr);
        return data.toLocaleDateString("pt-BR");
    },

    escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto;
        return div.innerHTML;
    }
};
