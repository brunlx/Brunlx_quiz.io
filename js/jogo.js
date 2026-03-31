const Jogo = {
    init() {
        UI.cacheElementos();
        UI.renderizarQuiz(PERGUNTAS);
        this.configurarEventListeners();
        this.verificarProgressoSalvo();
    },

    configurarEventListeners() {
        const el = UI.elementos;

        el.btnFinalizar.addEventListener("click", () => this.finalizarQuiz());
        el.btnVoltar.addEventListener("click", () => {
            window.location.href = QUIZ_CONFIG.PAGINA_INICIAL;
        });
        el.btnFecharModal.addEventListener("click", () => UI.fecharModal(el.modalResultado));
        el.btnReiniciar.addEventListener("click", () => this.reiniciarQuiz());
        el.btnContinuar.addEventListener("click", () => this.continuarProgresso());
        el.btnNovoQuiz.addEventListener("click", () => this.iniciarNovoQuiz());

        document.querySelectorAll(".quiz-item__opcoes input").forEach(input => {
            input.addEventListener("change", () => {
                this.salvarProgressoAtual();
                UI.atualizarProgresso(PERGUNTAS);
            });
        });

        document.querySelectorAll(".quiz-item__numero").forEach(input => {
            input.addEventListener("change", () => {
                this.salvarProgressoAtual();
                UI.atualizarProgresso(PERGUNTAS);
            });
        });

        el.modalResultado.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) UI.fecharModal(el.modalResultado);
        });

        el.modalContinuar.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) UI.fecharModalContinuar();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                UI.fecharModal(el.modalResultado);
                UI.fecharModalContinuar();
            }
        });
    },

    verificarProgressoSalvo() {
        const respostas = Storage.carregarProgresso();
        if (respostas) {
            UI.exibirModalContinuar();
        } else {
            Timer.iniciar();
        }
    },

    salvarProgressoAtual() {
        const respostas = {};

        PERGUNTAS.forEach((pergunta, indice) => {
            if (pergunta.tipo === "radio") {
                const selecionado = document.querySelector(`input[name="pergunta-${indice}"]:checked`);
                if (selecionado) respostas[indice] = { tipo: "radio", valor: selecionado.value };
            } else if (pergunta.tipo === "checkbox") {
                const selecionados = Array.from(document.querySelectorAll(`input[name="pergunta-${indice}"]:checked`))
                    .map(el => el.value);
                if (selecionados.length > 0) respostas[indice] = { tipo: "checkbox", valores: selecionados };
            } else if (pergunta.tipo === "number") {
                const input = document.getElementById(`pergunta-${indice}-input`);
                if (input && input.value) respostas[indice] = { tipo: "number", valor: parseInt(input.value) };
            }
        });

        Storage.salvarProgresso(respostas);
    },

    continuarProgresso() {
        const respostas = Storage.carregarProgresso();
        if (respostas) {
            UI.carregarRespostasSalvas(respostas);
        }
        UI.fecharModalContinuar();
        Timer.iniciar();
    },

    iniciarNovoQuiz() {
        Storage.limparProgresso();
        UI.fecharModalContinuar();
        Timer.iniciar();
    },

    calcularResultado() {
        let pontos = 0;
        const detalhes = [];

        PERGUNTAS.forEach((pergunta, indice) => {
            let acertou = false;
            let respostaUsuario = "";
            let respostaCorreta = "";

            if (pergunta.tipo === "radio") {
                const selecionado = document.querySelector(`input[name="pergunta-${indice}"]:checked`);
                if (selecionado) {
                    const valor = parseInt(selecionado.value);
                    acertou = valor === pergunta.respostaCorreta;
                    respostaUsuario = pergunta.opcoes[valor];
                }
                respostaCorreta = pergunta.opcoes[pergunta.respostaCorreta];
            } else if (pergunta.tipo === "checkbox") {
                const selecionados = Array.from(document.querySelectorAll(`input[name="pergunta-${indice}"]:checked`))
                    .map(el => parseInt(el.value));
                const corretasOrdenadas = [...pergunta.respostasCorretas].sort();
                const usuarioOrdenado = [...selecionados].sort();
                acertou = JSON.stringify(corretasOrdenadas) === JSON.stringify(usuarioOrdenado);
                respostaUsuario = selecionados.length > 0
                    ? selecionados.map(i => pergunta.opcoes[i]).join(", ")
                    : "Nenhuma selecionada";
                respostaCorreta = pergunta.respostasCorretas.map(i => pergunta.opcoes[i]).join(", ");
            } else if (pergunta.tipo === "number") {
                const input = document.getElementById(`pergunta-${indice}-input`);
                const valor = input ? parseInt(input.value) : null;
                acertou = valor === pergunta.anoCorreto;
                respostaUsuario = valor ? valor.toString() : "Nao informada";
                respostaCorreta = pergunta.anoCorreto.toString();
            }

            if (acertou) pontos++;

            detalhes.push({
                pergunta: pergunta.texto,
                acertou,
                respostaUsuario,
                respostaCorreta,
                explicacao: pergunta.explicacao
            });
        });

        return { pontos, detalhes };
    },

    finalizarQuiz() {
        const tempoGasto = Timer.parar();
        const { pontos, detalhes } = this.calcularResultado();

        Storage.salvarRanking(pontos, tempoGasto);
        Storage.limparProgresso();

        UI.exibirResultado({ pontos, detalhes, tempoGasto });
    },

    reiniciarQuiz() {
        UI.fecharModal(UI.elementos.modalResultado);
        UI.resetarFormulario();
        Timer.iniciar();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};

document.addEventListener("DOMContentLoaded", () => Jogo.init());
