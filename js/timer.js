"use strict";

/* Cronômetro da partida. Atualiza um elemento visível e o título da página. */

const Timer = {
    acumulado: 0,
    inicio: null,
    intervalo: null,

    iniciar(acumuladoInicial = 0) {
        this.parar();
        this.acumulado = Number(acumuladoInicial) || 0;
        this.inicio = Date.now();
        this.atualizarDisplay();
        this.intervalo = setInterval(() => this.atualizarDisplay(), 1000);
    },

    parar() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }
        return this.decorrido();
    },

    decorrido() {
        let total = Number(this.acumulado) || 0;
        if (this.inicio) {
            total += Math.floor((Date.now() - this.inicio) / 1000);
        }
        return total;
    },

    atualizarDisplay() {
        const tempo = this.decorrido();
        const elemento = document.getElementById("quiz-tempo");
        if (elemento) {
            elemento.textContent = formatarTempo(tempo);
        }
        document.title = `${APLICACAO.nome} — ${formatarTempo(tempo)}`;
    }
};