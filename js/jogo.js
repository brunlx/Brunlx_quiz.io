"use strict";

/* Lógica da partida de quiz. Controla o estado, a renderização da pergunta
   atual, o progresso e a finalização. */

const Jogo = {
    perguntas: [],
    indice: 0,
    respostas: {},
    configuracao: { categoria: "todas", dificuldade: "todas", quantidade: "todas" },
    elementos: {},

    init() {
        this.cacheElementos();
        Tema.iniciar();

        const progresso = Storage.carregarProgresso();
        if (progresso) {
            this.carregarPartidaSalva(progresso);
        } else {
            this.iniciarPartidaNova(this.lerDaURL());
        }

        this.configurarEventos();
    },

    cacheElementos() {
        const r = (id) => document.getElementById(id);
        this.elementos = {
            btnTema: r("btn-tema"),
            painel: r("quiz-painel"),
            progressoBarra: r("quiz-progresso-barra"),
            contadorRespondidas: r("quiz-respondidas"),
            contadorTotal: r("quiz-total"),
            contadorTotalResponder: r("quiz-total-responder"),
            contadorAtual: r("quiz-atual"),
            btnAnterior: r("btn-anterior"),
            btnProxima: r("btn-proxima"),
            aviso: r("quiz-aviso"),
            modalResultado: r("modal-resultado-overlay"),
            resultadoConteudo: r("resultado-conteudo"),
            resultadoTitulo: r("modal-resultado-titulo"),
            modalContinuar: r("modal-continuar-overlay"),
            btnContinuar: r("btn-continuar"),
            btnNovoQuiz: r("btn-novo-quiz"),
            linkReiniciar: r("btn-reiniciar")
        };
    },

    lerDaURL() {
        const params = new URLSearchParams(window.location.search);
        return normalizarConfiguracao({
            categoria: params.get("categoria") || "todas",
            dificuldade: params.get("dificuldade") || "todas",
            quantidade: params.get("quantidade") || "todas"
        });
    },

    iniciarPartidaNova(configuracao) {
        this.configuracao = configuracao;
        this.perguntas = filtrarPerguntas(configuracao);

        if (this.perguntas.length === 0) {
            window.location.href = "index.html";
            return;
        }

        this.indice = 0;
        this.respostas = {};
        this.atualizarBadgeCategoria();
        this.definirTotais();
        this.renderizarPergunta(0);
        this.atualizarControlesDeNavegacao();
        Timer.iniciar(0);
    },

    atualizarBadgeCategoria() {
        const el = document.getElementById("quiz-categoria");
        if (el) el.textContent = CATEGORIAS[this.configuracao.categoria] || "Categoria";
    },

    carregarPartidaSalva(progresso) {
        const perguntas = perguntasPorIds(progresso.ids);
        if (perguntas.length === 0) {
            Storage.limparProgresso();
            this.iniciarPartidaNova(this.lerDaURL());
            return;
        }

        this.perguntas = perguntas;
        this.configuracao = progresso.configuracao || this.lerDaURL();
        this.indice = Math.min(progresso.indice || 0, perguntas.length - 1);
        this.respostas = progresso.respostas || {};

        this.definirTotais();
        this.renderizarPergunta(this.indice);
        this.atualizarControlesDeNavegacao();
        this.atualizarBadgeCategoria();
        this.exibirModalContinuar(progresso.tempoDecorrido || 0);
    },

    definirTotais() {
        this.elementos.contadorTotal.textContent = this.perguntas.length;
        this.elementos.contadorTotalResponder.textContent = this.perguntas.length;
        this.atualizarProgresso();
    },

    configurarEventos() {
        const e = this.elementos;

        e.painel.addEventListener("change", (ev) => this.tratarMudancaDeResposta(ev));

        e.btnAnterior.addEventListener("click", () => this.voltarPergunta());
        e.btnProxima.addEventListener("click", () => this.avancarPergunta());

        e.btnContinuar.addEventListener("click", () => {
            UI.fecharModal(e.modalContinuar);
            Timer.iniciar(this.tempoContinuacao || 0);
        });

        e.btnNovoQuiz.addEventListener("click", () => {
            UI.fecharModal(e.modalContinuar);
            Storage.limparProgresso();
            this.iniciarPartidaNova(this.lerDaURL());
        });

        if (e.linkReiniciar) {
            e.linkReiniciar.addEventListener("click", () => this.reiniciar());
        }

        document.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
                UI.fecharModal(e.modalResultado);
                UI.fecharModal(e.modalContinuar);
            }
        });

        document.addEventListener("click", (ev) => {
            const fechar = ev.target.closest("[data-fechar-modal]");
            if (!fechar) return;
            const overlay = fechar.closest(".modal-overlay");
            if (overlay) UI.fecharModal(overlay);
        });
    },

    tratarMudancaDeResposta(ev) {
        const campo = ev.target;
        if (!campo || !campo.closest("[data-pergunta-indice]")) return;

        const pergunta = this.perguntas[this.indice];
        const resposta = this.coletarResposta(pergunta);

        if (resposta === null) {
            if (this.respostas[this.indice] && pergunta.tipo === "checkbox") {
                delete this.respostas[this.indice];
                this.esconderAviso();
                this.renderizarPergunta(this.indice);
                this.salvarProgresso();
            }
            return;
        }

        this.respostas[this.indice] = resposta;
        this.esconderAviso();
        this.renderizarPergunta(this.indice);
        this.salvarProgresso();

        const seletor = campo.type === "checkbox"
            ? `input[name="resposta"][value="${campo.value}"]`
            : campo.type === "number"
                ? 'input[name="resposta"]'
                : `input[name="resposta"][value="${campo.value}"]`;
        const alvo = this.elementos.painel.querySelector(seletor);
        if (alvo) alvo.focus({ preventScroll: true });
    },

    coletarResposta(pergunta) {
        const raiz = this.elementos.painel;

        if (pergunta.tipo === "radio") {
            const selecionado = raiz.querySelector('input[name="resposta"]:checked');
            return selecionado ? { tipo: "radio", valor: Number(selecionado.value) } : null;
        }

        if (pergunta.tipo === "checkbox") {
            const marcados = Array.from(
                raiz.querySelectorAll('input[name="resposta"]:checked')
            ).map((input) => Number(input.value));
            return marcados.length > 0 ? { tipo: "checkbox", valores: marcados } : null;
        }

        if (pergunta.tipo === "number") {
            const input = raiz.querySelector('input[name="resposta"]');
            if (!input) return null;
            const valor = input.value.trim();
            return valor !== "" ? { tipo: "number", valor: Number(valor) } : null;
        }

        return null;
    },

    renderizarPergunta(indice) {
        const pergunta = this.perguntas[indice];
        const painel = this.elementos.painel;
        painel.innerHTML = "";

        this.elementos.contadorAtual.textContent = indice + 1;

        painel.appendChild(this.criarBadges(pergunta));

        const artigo = document.createElement("article");
        artigo.className = "pergunta";
        artigo.dataset.perguntaIndice = String(indice);

        const titulo = document.createElement("h2");
        titulo.className = "pergunta__titulo";
        titulo.textContent = pergunta.texto;
        artigo.appendChild(titulo);

        if (pergunta.imagem) {
            const figura = document.createElement("figure");
            figura.className = "pergunta__figura";
            const img = document.createElement("img");
            img.className = "pergunta__imagem";
            img.src = pergunta.imagem;
            img.alt = pergunta.imagemAlt || "";
            img.width = 350;
            img.height = 200;
            img.loading = "lazy";
            img.decoding = "async";
            figura.appendChild(img);
            artigo.appendChild(figura);
        }

        if (pergunta.codigo) {
            const pre = document.createElement("pre");
            pre.className = "pergunta__codigo";
            const code = document.createElement("code");
            code.textContent = pergunta.codigo;
            pre.appendChild(code);
            artigo.appendChild(pre);
        }

        if (pergunta.tipo === "checkbox" || pergunta.tipo === "radio") {
            artigo.appendChild(this.criarOpcoes(pergunta));
        } else if (pergunta.tipo === "number") {
            artigo.appendChild(this.criarCampoNumero(pergunta));
        }

        painel.appendChild(artigo);

        const resposta = this.respostas[indice];
        if (resposta) {
            const feedback = this.criarFeedback(pergunta, resposta);
            if (feedback) painel.appendChild(feedback);
        }

        this.atualizarProgresso();
        this.atualizarControlesDeNavegacao();
    },

    criarBadges(pergunta) {
        const div = document.createElement("div");
        div.className = "pergunta__badges";

        const categoria = document.createElement("span");
        categoria.className = "badge badge--categoria";
        categoria.textContent = CATEGORIAS[pergunta.categoria] || pergunta.categoria;

        const dificuldade = document.createElement("span");
        dificuldade.className = `badge badge--dificuldade badge--dificuldade-${pergunta.dificuldade}`;
        dificuldade.textContent = DIFICULDADES[pergunta.dificuldade] || pergunta.dificuldade;

        div.append(categoria, dificuldade);
        return div;
    },

    criarOpcoes(pergunta) {
        const fieldset = document.createElement("fieldset");
        fieldset.className = "opcoes";

        const legendaTexto = pergunta.tipo === "checkbox"
            ? "Selecione todas as respostas corretas"
            : "Escolha uma das alternativas";
        const legenda = document.createElement("legend");
        legenda.className = "opcoes__legenda";
        legenda.textContent = legendaTexto;
        fieldset.appendChild(legenda);

        if (pergunta.tipo === "checkbox" && pergunta.multipla) {
            const dica = document.createElement("p");
            dica.className = "opcoes__dica";
            dica.textContent = "Atenção: esta pergunta possui mais de uma resposta correta.";
            fieldset.appendChild(dica);
        }

        pergunta.opcoes.forEach((opcao, i) => {
            const label = document.createElement("label");
            label.className = "opcao";

            const input = document.createElement("input");
            input.type = pergunta.tipo;
            input.name = "resposta";
            input.value = String(i);

            const etiqueta = document.createElement("span");
            etiqueta.className = "opcao__etiqueta";
            etiqueta.textContent = opcao;

            label.append(input, etiqueta);
            fieldset.appendChild(label);
        });

        const resposta = this.respostas[this.indice];
        if (resposta) {
            this.marcarRespostaNoCampo(pergunta, resposta, fieldset);
        }

        return fieldset;
    },

    marcarRespostaNoCampo(pergunta, resposta, fieldset) {
        const inputs = fieldset.querySelectorAll('input[name="resposta"]');

        inputs.forEach((input) => {
            const valor = Number(input.value);
            const selecionado = pergunta.tipo === "checkbox"
                ? (resposta.valores || []).includes(valor)
                : Number(resposta.valor) === valor;
            input.checked = selecionado;

            const label = input.closest(".opcao");
            if (!label) return;

            const correta = pergunta.tipo === "checkbox"
                ? (pergunta.respostasCorretas || []).includes(valor)
                : valor === pergunta.respostaCorreta;

            label.classList.add("opcao--respondida");
            if (selecionado && correta) label.classList.add("opcao--correta");
            if (selecionado && !correta) label.classList.add("opcao--errada");
            if (!selecionado && correta) label.classList.add("opcao--nao-selecionada");
        });
    },

    criarCampoNumero(pergunta) {
        const div = document.createElement("div");
        div.className = "opcao opcao--numero";

        const label = document.createElement("label");
        label.className = "opcao__etiqueta";
        label.htmlFor = "resposta-numero";
        label.textContent = "Digite o ano (ex.: 1969):";

        const input = document.createElement("input");
        input.type = "number";
        input.id = "resposta-numero";
        input.name = "resposta";
        input.className = "opcao__numero";
        input.min = pergunta.minimo ?? 1900;
        input.max = pergunta.maximo ?? 2100;
        input.placeholder = pergunta.placeholder || "Digite o ano";

        const resposta = this.respostas[this.indice];
        if (resposta && resposta.tipo === "number") {
            input.value = resposta.valor;
        }

        div.append(label, input);
        return div;
    },

    criarFeedback(pergunta, resposta) {
        const acertou = calcularAcerto(pergunta, resposta);
        const feedback = document.createElement("div");
        feedback.className = acertou
            ? "feedback feedback--correto"
            : "feedback feedback--errado";
        feedback.setAttribute("role", "status");

        const statusEl = document.createElement("p");
        statusEl.className = "feedback__status";
        statusEl.textContent = acertou ? "Resposta correta!" : "Resposta incorreta.";
        feedback.appendChild(statusEl);

        if (!acertou) {
            const correta = document.createElement("p");
            correta.className = "feedback__correta";
            correta.textContent = `Resposta correta: ${this.textoDaRespostaCorreta(pergunta)}`;
            feedback.appendChild(correta);
        }

        const explicacao = document.createElement("p");
        explicacao.className = "feedback__explicacao";
        explicacao.textContent = pergunta.explicacao || "";
        if (explicacao.textContent) feedback.appendChild(explicacao);

        return feedback;
    },

    textoDaRespostaCorreta(pergunta) {
        if (pergunta.tipo === "radio") return pergunta.opcoes[pergunta.respostaCorreta];
        if (pergunta.tipo === "checkbox") {
            return pergunta.respostasCorretas.map((i) => pergunta.opcoes[i]).join(", ");
        }
        return String(pergunta.anoCorreto);
    },

    avancarPergunta() {
        const pergunta = this.perguntas[this.indice];
        const resposta = this.respostas[this.indice];

        if (!pergunta || !resposta) {
            this.exibirAviso();
            return;
        }

        const ultima = this.indice === this.perguntas.length - 1;
        if (ultima) {
            this.finalizar();
            return;
        }

        this.indice += 1;
        this.renderizarPergunta(this.indice);
        this.salvarProgresso();
    },

    voltarPergunta() {
        if (this.indice === 0) return;
        this.indice -= 1;
        this.esconderAviso();
        this.renderizarPergunta(this.indice);
        this.salvarProgresso();
    },

    exibirAviso() {
        this.elementos.aviso.hidden = false;
        this.elementos.btnProxima.classList.add("animacao-sacudir");
        setTimeout(() => this.elementos.btnProxima.classList.remove("animacao-sacudir"), 400);
    },

    esconderAviso() {
        this.elementos.aviso.hidden = true;
    },

    atualizarControlesDeNavegacao() {
        this.elementos.btnAnterior.disabled = this.indice === 0;
        const ultima = this.indice === this.perguntas.length - 1;
        this.elementos.btnProxima.textContent = ultima ? "Finalizar" : "Próxima";
    },

    atualizarProgresso() {
        const respondidas = Object.keys(this.respostas).length;
        const total = this.perguntas.length;
        const proporcao = total ? Math.round((respondidas / total) * 100) : 0;

        this.elementos.contadorRespondidas.textContent = String(respondidas);
        this.elementos.progressoBarra.style.width = `${proporcao}%`;
        this.elementos.progressoBarra.setAttribute("aria-valuenow", String(proporcao));
    },

    salvarProgresso() {
        Storage.salvarProgresso({
            ids: this.perguntas.map((p) => p.id),
            indice: this.indice,
            respostas: this.respostas,
            tempoDecorrido: Timer.decorrido(),
            configuracao: this.configuracao
        });
    },

    exibirModalContinuar(tempoDecorrido) {
        UI.abrirModal(this.elementos.modalContinuar);
        this.tempoContinuacao = tempoDecorrido;
    },

    finalizar() {
        const tempo = Timer.parar();
        const resultado = calcularResultado(this.perguntas, this.respostas);
        const desempenho = classificarDesempenho(resultado.pontos, resultado.total);

        Storage.registrarPartida(
            resultado.pontos,
            resultado.total,
            tempo,
            this.configuracao
        );
        Storage.limparProgresso();

        this.exibirResultado(resultado, desempenho, tempo);
    },

    exibirResultado(resultado, desempenho, tempo) {
        const e = this.elementos;
        const corretas = resultado.pontos;
        const incorretas = resultado.total - corretas;

        e.resultadoTitulo.textContent = "Resultado";
        e.resultadoConteudo.innerHTML = "";

        const resumo = document.createElement("div");
        resumo.className = "resultado";

        const circulo = document.createElement("div");
        circulo.className = `resultado__circulo resultado__circulo--${desempenho.classe}`;
        circulo.setAttribute("role", "img");
        circulo.setAttribute("aria-label", `${resultado.pontos} de ${resultado.total} acertos`);

        const pontosEl = document.createElement("span");
        pontosEl.className = "resultado__pontos";
        pontosEl.textContent = `${resultado.pontos}/${resultado.total}`;

        const pctEl = document.createElement("span");
        pctEl.className = "resultado__percentual";
        pctEl.textContent = `${resultado.percentual}% de acertos`;

        circulo.append(pontosEl, pctEl);
        resumo.appendChild(circulo);

        const rotulo = document.createElement("div");
        rotulo.className = `resultado__rotulo resultado__rotulo--${desempenho.classe}`;
        rotulo.textContent = desempenho.rotulo;
        resumo.appendChild(rotulo);

        const mensagem = document.createElement("p");
        mensagem.className = "resultado__mensagem";
        mensagem.textContent = desempenho.mensagem;
        resumo.appendChild(mensagem);

        const grade = document.createElement("div");
        grade.className = "resultado__grade";
        grade.appendChild(this.criarEstatistica("Corretas", corretas, "corretas"));
        grade.appendChild(this.criarEstatistica("Incorretas", incorretas, "incorretas"));
        grade.appendChild(this.criarEstatistica("Tempo", formatarTempo(tempo, true), "tempo"));

        resumo.appendChild(grade);
        e.resultadoConteudo.appendChild(resumo);

        const tituloDetalhes = document.createElement("h3");
        tituloDetalhes.className = "resultado__subtitulo";
        tituloDetalhes.textContent = "Revisão das questões";
        e.resultadoConteudo.appendChild(tituloDetalhes);

        const lista = document.createElement("div");
        lista.className = "resultado__lista";

        resultado.itens.forEach((item, indice) => {
            lista.appendChild(this.criarItemResultado(item, indice + 1));
        });

        e.resultadoConteudo.appendChild(lista);
        UI.abrirModal(e.modalResultado);
    },

    criarEstatistica(rotulo, valor, classe) {
        const div = document.createElement("div");
        div.className = `resultado__estatistica resultado__estatistica--${classe}`;
        const valorEl = document.createElement("strong");
        valorEl.textContent = String(valor);
        const rotuloEl = document.createElement("span");
        rotuloEl.textContent = rotulo;
        div.append(valorEl, rotuloEl);
        return div;
    },

    criarItemResultado(item, numero) {
        const details = document.createElement("details");
        details.className = "resultado__item";
        details.classList.add(item.acertou ? "resultado__item--correto" : "resultado__item--errado");

        const summary = document.createElement("summary");
        summary.className = "resultado__item-resumo";
        const icone = document.createElement("span");
        icone.className = "resultado__item-icone";
        icone.setAttribute("aria-hidden", "true");
        icone.textContent = item.acertou ? "OK" : "X";
        const texto = document.createElement("span");
        texto.textContent = `${numero}. ${item.pergunta.texto}`;
        summary.append(icone, texto);
        details.appendChild(summary);

        const corpo = document.createElement("div");
        corpo.className = "resultado__item-corpo";

        const sua = document.createElement("p");
        sua.className = "resultado__item-linha";
        sua.textContent = `Sua resposta: ${this.textoRespostaUsuario(item)}`;

        const certa = document.createElement("p");
        certa.className = "resultado__item-linha";
        certa.textContent = `Resposta correta: ${this.textoDaRespostaCorreta(item.pergunta)}`;

        const explicacao = document.createElement("p");
        explicacao.className = "resultado__item-explicacao";
        explicacao.textContent = item.pergunta.explicacao || "";

        corpo.append(sua, certa, explicacao);
        details.appendChild(corpo);

        return details;
    },

    textoRespostaUsuario(item) {
        if (!item.resposta) return "Não respondida";
        if (item.pergunta.tipo === "radio" || item.pergunta.tipo === "checkbox") {
            const indices = item.pergunta.tipo === "radio"
                ? [Number(item.resposta.valor)]
                : (item.resposta.valores || []).map(Number);
            const textos = indices.map((i) => item.pergunta.opcoes[i]).filter(Boolean);
            return textos.length > 0 ? textos.join(", ") : "Nenhuma opção selecionada";
        }
        return String(item.resposta.valor ?? "");
    },

    reiniciar() {
        UI.fecharModal(this.elementos.modalResultado);
        this.indice = 0;
        this.respostas = {};
        this.renderizarPergunta(0);
        this.atualizarControlesDeNavegacao();
        Timer.iniciar(0);
        this.salvarProgresso();
        if (typeof window.scrollTo === "function") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
};

document.addEventListener("DOMContentLoaded", () => Jogo.init());