const RANKING_CHAVE = "quiz_tech_ranking";

const PaginaInicial = {
    init() {
        this.configurarEventListeners();
    },

    configurarEventListeners() {
        document.getElementById("btn-jogar").addEventListener("click", () => {
            window.location.href = "Jogo.html";
        });

        document.getElementById("btn-ranking").addEventListener("click", () => this.abrirRanking());
        document.getElementById("btn-fechar-ranking").addEventListener("click", () => this.fecharRanking());

        const modalOverlay = document.getElementById("modal-ranking-overlay");
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) this.fecharRanking();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.fecharRanking();
        });
    },

    abrirRanking() {
        const ranking = this.getRanking();
        const lista = document.getElementById("ranking-lista");

        if (ranking.length === 0) {
            lista.innerHTML = `<p class="ranking__vazio">Nenhuma pontuacao registrada ainda. Jogue o quiz para aparecer aqui!</p>`;
        } else {
            let html = `<ul class="ranking__lista">`;
            ranking.forEach((item, indice) => {
                html += `
                    <li class="ranking__item">
                        <span>#${indice + 1} - ${item.pontos}/15</span>
                        <span>${item.tempo}</span>
                        <span>${this.formatarData(item.data)}</span>
                    </li>`;
            });
            html += `</ul>`;
            lista.innerHTML = html;
        }

        const modalOverlay = document.getElementById("modal-ranking-overlay");
        modalOverlay.classList.add("modal-overlay--ativo");
        modalOverlay.setAttribute("aria-hidden", "false");
        document.getElementById("btn-fechar-ranking").focus();
    },

    fecharRanking() {
        const modalOverlay = document.getElementById("modal-ranking-overlay");
        modalOverlay.classList.remove("modal-overlay--ativo");
        modalOverlay.setAttribute("aria-hidden", "true");
    },

    getRanking() {
        try {
            const dados = localStorage.getItem(RANKING_CHAVE);
            return dados ? JSON.parse(dados) : [];
        } catch (erro) {
            return [];
        }
    },

    formatarData(dataStr) {
        const data = new Date(dataStr);
        return data.toLocaleDateString("pt-BR");
    }
};

document.addEventListener("DOMContentLoaded", () => PaginaInicial.init());
