"use strict";

/* Utilitários compartilhados de DOM e acessibilidade. */

const UI = {
    focoAnterior: null,

    abrirModal(overlay) {
        if (!overlay) return;
        this.focoAnterior = document.activeElement;

        overlay.classList.add("modal-overlay--ativo");
        overlay.setAttribute("aria-hidden", "false");
        overlay.addEventListener("keydown", this.tratarTab);

        const fechar = overlay.querySelector("[data-fechar-modal]");
        if (fechar) fechar.focus();
    },

    fecharModal(overlay) {
        if (!overlay) return;
        overlay.removeEventListener("keydown", this.tratarTab);
        overlay.classList.remove("modal-overlay--ativo");
        overlay.setAttribute("aria-hidden", "true");

        if (this.focoAnterior && document.contains(this.focoAnterior)) {
            this.focoAnterior.focus();
        }
        this.focoAnterior = null;
    },

    /* Mantém o foco dentro do modal enquanto ele estiver aberto. */
    tratarTab(ev) {
        if (ev.key !== "Tab") return;
        const modal = ev.currentTarget.querySelector('[role="dialog"]') || ev.currentTarget;
        const focaveis = modal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        );
        if (focaveis.length === 0) return;

        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        const ativo = document.activeElement;

        if (ev.shiftKey && (ativo === primeiro || ativo === modal)) {
            ev.preventDefault();
            ultimo.focus();
        } else if (!ev.shiftKey && ativo === ultimo) {
            ev.preventDefault();
            primeiro.focus();
        }
    }
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = UI;
}