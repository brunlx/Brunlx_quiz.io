"use strict";

/* Lógica da página inicial: tema, ranking/histórico e configuração da partida. */

const PaginaInicial = {
    elementos: {},

    init() {
        this.cacheElementos();
        Tema.iniciar();
        this.configurarEventos();
        this.atualizarContadores();
    },

    cacheElementos() {
        const r = (id) => document.getElementById(id);
        this.elementos = {
            btnJogar: r("btn-jogar"),
            btnRanking: r("btn-ranking"),
            btnTema: r("btn-tema"),
            modalConfig: r("modal-config-overlay"),
            formConfig: r("form-config"),
            fecharConfig: r("btn-fechar-config"),
            iniciarConfig: r("btn-iniciar-config"),
            configDisponiveis: r("config-disponiveis"),
            modalRanking: r("modal-ranking-overlay"),
            fecharRanking: r("btn-fechar-ranking"),
            abaRanking: r("aba-ranking"),
            abaHistorico: r("aba-historico"),
            abaRankingPainel: r("painel-ranking"),
            abaHistoricoPainel: r("painel-historico"),
            rankingLista: r("ranking-lista"),
            historicoLista: r("historico-lista"),
            contPerguntas: r("cont-perguntas"),
            contCategorias: r("cont-categorias"),
            contDificuldades: r("cont-dificuldades")
        };
    },

    configurarEventos() {
        const e = this.elementos;

        e.btnJogar.addEventListener("click", () => this.abrirConfig());
        e.btnRanking.addEventListener("click", () => this.abrirRanking());
        e.fecharConfig.addEventListener("click", () => UI.fecharModal(e.modalConfig));
        e.fecharRanking.addEventListener("click", () => UI.fecharModal(e.modalRanking));

        e.modalConfig.addEventListener("click", (ev) => {
            if (ev.target === ev.currentTarget) UI.fecharModal(e.modalConfig);
        });
        e.modalRanking.addEventListener("click", (ev) => {
            if (ev.target === ev.currentTarget) UI.fecharModal(e.modalRanking);
        });

        e.abaRanking.addEventListener("click", () => this.alternarAba("ranking"));
        e.abaHistorico.addEventListener("click", () => this.alternarAba("historico"));

        e.formConfig.addEventListener("change", () => this.atualizarDisponiveis());
        e.formConfig.addEventListener("submit", (ev) => {
            ev.preventDefault();
            this.iniciarPartida();
        });

        document.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
                UI.fecharModal(e.modalConfig);
                UI.fecharModal(e.modalRanking);
            }
        });

        document.addEventListener("click", (ev) => {
            const fechar = ev.target.closest("[data-fechar-modal]");
            if (!fechar) return;
            const overlay = fechar.closest(".modal-overlay");
            if (overlay) UI.fecharModal(overlay);
        });
    },

    alternarAba(aba) {
        const e = this.elementos;
        const rankingAtiva = aba === "ranking";
        e.abaRanking.classList.toggle("aba-aberta", rankingAtiva);
        e.abaHistorico.classList.toggle("aba-aberta", !rankingAtiva);
        e.abaRanking.setAttribute("aria-selected", String(rankingAtiva));
        e.abaHistorico.setAttribute("aria-selected", String(!rankingAtiva));
        e.abaRankingPainel.hidden = !rankingAtiva;
        e.abaHistoricoPainel.hidden = rankingAtiva;

        if (rankingAtiva) this.renderizarRanking();
        else this.renderizarHistorico();
    },

    abrirConfig() {
        this.atualizarDisponiveis();
        UI.abrirModal(this.elementos.modalConfig);
    },

    abrirRanking() {
        this.alternarAba("ranking");
        UI.abrirModal(this.elementos.modalRanking);
    },

    atualizarDisponiveis() {
        const dados = new FormData(this.elementos.formConfig);
        const configuracao = {
            categoria: String(dados.get("categoria") || "todas"),
            dificuldade: String(dados.get("dificuldade") || "todas"),
            quantidade: dados.get("quantidade") || "todas"
        };

        const disponiveis = (configuracao.quantidade === "todas")
            ? filtrarPerguntas(configuracao).length
            : Math.min(Number(configuracao.quantidade), filtrarPerguntas({ ...configuracao, quantidade: "todas" }).length);

        const selecionada = filtrarPerguntas({ ...configuracao, quantidade: "todas" }).length;
        this.elementos.configDisponiveis.textContent =
            `${selecionada} ${selecionada === 1 ? "pergunta disponível" : "perguntas disponíveis"}` +
            (disponiveis !== selecionada && configuracao.quantidade !== "todas"
                ? ` (${disponiveis} na partida)`
                : "");
    },

    iniciarPartida() {
        const dados = new FormData(this.elementos.formConfig);
        const params = new URLSearchParams({
            categoria: String(dados.get("categoria") || "todas"),
            dificuldade: String(dados.get("dificuldade") || "todas"),
            quantidade: String(dados.get("quantidade") || "todas")
        });
        window.location.href = `jogo.html?${params.toString()}`;
    },

    renderizarRanking() {
        const ranking = Storage.getRanking();
        const lista = this.elementos.rankingLista;
        lista.innerHTML = "";

        if (ranking.length === 0) {
            lista.appendChild(this.criarVazio("Nenhuma pontuação registrada ainda. Complete o quiz para aparecer aqui!"));
            return;
        }

        const ul = document.createElement("ol");
        ul.className = "lista-ranking";

        ranking.forEach((item, indice) => {
            const li = document.createElement("li");
            li.className = "lista-ranking__item" + (indice < 3 ? ` lista-ranking__item--top${indice + 1}` : "");

            const posicao = document.createElement("span");
            posicao.className = "lista-ranking__posicao";
            posicao.textContent = `#${indice + 1}`;

            const info = document.createElement("span");
            info.className = "lista-ranking__info";
            info.textContent = `${item.percentual}% · ${item.pontos}/${item.total}`;

            const detalhes = document.createElement("span");
            detalhes.className = "lista-ranking__detalhes";
            detalhes.textContent = `${formatarTempo(item.tempo)} · ${this.formatarData(item.data)}`;

            li.append(posicao, info, detalhes);
            ul.appendChild(li);
        });

        lista.appendChild(ul);
    },

    renderizarHistorico() {
        const historico = Storage.getHistorico();
        const lista = this.elementos.historicoLista;
        lista.innerHTML = "";

        if (historico.length === 0) {
            lista.appendChild(this.criarVazio("Nenhuma partida registrada ainda."));
            return;
        }

        const ul = document.createElement("ol");
        ul.className = "lista-ranking lista-ranking--historico";

        historico.forEach((item) => {
            const li = document.createElement("li");
            li.className = "lista-ranking__item";

            const info = document.createElement("span");
            info.className = "lista-ranking__info";
            info.textContent = `${item.pontos}/${item.total} (${item.percentual}%)`;

            const detalhes = document.createElement("span");
            detalhes.className = "lista-ranking__detalhes";
            detalhes.textContent =
                `${CATEGORIAS[item.categoria] || item.categoria} · ${DIFICULDADES[item.dificuldade] || item.dificuldade}`;

            const data = document.createElement("span");
            data.className = "lista-ranking__detalhes";
            data.textContent = `${formatarTempo(item.tempo)} · ${this.formatarData(item.data)}`;

            li.append(info, detalhes, data);
            ul.appendChild(li);
        });

        lista.appendChild(ul);
    },

    criarVazio(mensagem) {
        const p = document.createElement("p");
        p.className = "estado-vazio";
        p.textContent = mensagem;
        return p;
    },

    formatarData(dataBruta) {
        const data = new Date(dataBruta);
        if (Number.isNaN(data.getTime())) return "—";
        return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    },

    atualizarContadores() {
        this.elementos.contPerguntas.textContent = PERGUNTAS.length;
        this.elementos.contCategorias.textContent = Object.keys(CATEGORIAS).length - 1;
        this.elementos.contDificuldades.textContent = Object.keys(DIFICULDADES).length - 1;
    }
};

document.addEventListener("DOMContentLoaded", () => PaginaInicial.init());