"use strict";

/* Gerenciamento do tema (claro/escuro) com persistência da preferência. */

const Tema = {
    atual() {
        return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    },

    aplicar(tema) {
        const valor = tema === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = valor;
        try {
            Storage.setTema(valor);
        } catch (erro) {
            console.warn("QuizTech: não foi possível salvar a preferência de tema.", erro);
        }
        this.atualizarBotao();
    },

    alternar() {
        const novo = this.atual() === "dark" ? "light" : "dark";
        this.aplicar(novo);
        return novo;
    },

    iniciar() {
        const salvo = Storage.getTema();
        if (!salvo) {
            const sistema = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            this.aplicar(sistema ? "dark" : "light");
        } else {
            this.aplicar(salvo);
        }

        this.registrarBotao();
        this.registrarMudancaDoSistema();
    },

    atualizarBotao() {
        const botao = document.getElementById("btn-tema");
        if (!botao) return;
        const escuro = this.atual() === "dark";
        botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
        botao.setAttribute("title", escuro ? "Ativar modo claro" : "Ativar modo escuro");
        botao.innerHTML = "";
        botao.append(this.iconeSol(escuro), this.iconeLua(!escuro));
    },

    iconeSol(visivel) {
        const span = document.createElement("span");
        span.className = "icone-tema" + (visivel ? " icone-tema--ativo" : "");
        span.setAttribute("aria-hidden", "true");
        span.innerHTML =
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
        return span;
    },

    iconeLua(visivel) {
        const span = document.createElement("span");
        span.className = "icone-tema" + (visivel ? " icone-tema--ativo" : "");
        span.setAttribute("aria-hidden", "true");
        span.innerHTML =
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        return span;
    },

    registrarBotao() {
        const botao = document.getElementById("btn-tema");
        if (botao && !botao.dataset.temaRegistrado) {
            botao.dataset.temaRegistrado = "1";
            botao.addEventListener("click", () => Tema.alternar());
        }
    },

    registrarMudancaDoSistema() {
        if (!window.matchMedia) return;
        const consulta = window.matchMedia("(prefers-color-scheme: dark)");
        const tratar = () => {
            if (!Storage.getTema()) {
                this.aplicar(consulta.matches ? "dark" : "light");
            }
        };
        if (consulta.addEventListener) {
            consulta.addEventListener("change", tratar);
        } else if (consulta.addListener) {
            consulta.addListener(tratar);
        }
    }
};