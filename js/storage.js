"use strict";

/* Abstração de persistência local.
   Usa localStorage no navegador e um armazenamento em memória
   quando executado fora dele (ex.: testes com Node). */

(() => {
    /* No navegador, STORAGE_KEYS e LIMITES vêm do config.js (globais).
       No Node, precisam ser carregados como dependência. */
    if (typeof STORAGE_KEYS === "undefined" && typeof require === "function") {
        const config = require("./config.js");
        globalThis.STORAGE_KEYS = config.STORAGE_KEYS;
        globalThis.LIMITES = config.LIMITES;
    }
})();

const Storage = (() => {
    const usaLocalStorage = typeof localStorage !== "undefined" && localStorage;
    const memoria = new Map();

    function rawSet(chave, valor) {
        if (usaLocalStorage) {
            try {
                localStorage.setItem(chave, valor);
                return;
            } catch (erro) {
                console.warn("QuizTech: não foi possível salvar no localStorage.", erro);
            }
        }
        memoria.set(chave, valor);
    }

    function rawGet(chave) {
        if (usaLocalStorage) {
            try {
                return localStorage.getItem(chave);
            } catch (erro) {
                console.warn("QuizTech: não foi possível ler o localStorage.", erro);
                return null;
            }
        }
        return memoria.has(chave) ? memoria.get(chave) : null;
    }

    function rawRemove(chave) {
        if (usaLocalStorage) {
            try {
                localStorage.removeItem(chave);
            } catch (erro) {
                console.warn("QuizTech: não foi possível remover do localStorage.", erro);
            }
        }
        memoria.delete(chave);
    }

    function get(chave) {
        const bruto = rawGet(chave);
        if (!bruto) return null;
        try {
            return JSON.parse(bruto);
        } catch (erro) {
            console.warn("QuizTech: dados corrompidos em", chave, erro);
            return null;
        }
    }

    function set(chave, dados) {
        try {
            rawSet(chave, JSON.stringify(dados));
        } catch (erro) {
            console.warn("QuizTech: erro ao serializar dados de", chave, erro);
        }
    }

    function remove(chave) {
        rawRemove(chave);
    }

    /* ---------- Progresso da partida ---------- */

    function salvarProgresso(dados) {
        set(STORAGE_KEYS.progresso, {
            versao: 1,
            ids: dados.ids,
            indice: dados.indice,
            respostas: dados.respostas,
            tempoDecorrido: dados.tempoDecorrido,
            configuracao: dados.configuracao,
            salvoEm: Date.now()
        });
    }

    function carregarProgresso() {
        const dados = get(STORAGE_KEYS.progresso);
        if (!dados) return null;

        const diasPassados = (Date.now() - dados.salvoEm) / (1000 * 60 * 60 * 24);
        if (diasPassados > LIMITES.expiracaoDias) {
            limparProgresso();
            return null;
        }

        if (!Array.isArray(dados.ids) || dados.ids.length === 0) {
            limparProgresso();
            return null;
        }

        return dados;
    }

    function limparProgresso() {
        remove(STORAGE_KEYS.progresso);
    }

    /* ---------- Ranking e histórico ---------- */

    function registrarPartida(pontos, total, tempoSegundos, configuracao) {
        const percentual = total ? Math.round((pontos / total) * 100) : 0;
        const registro = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            pontos,
            total,
            percentual,
            tempo: tempoSegundos,
            categoria: configuracao.categoria,
            dificuldade: configuracao.dificuldade,
            data: new Date().toISOString()
        };

        const ranking = getRanking();
        ranking.push({ ...registro });
        ranking.sort((a, b) => b.percentual - a.percentual || a.tempo - b.tempo);
        set(STORAGE_KEYS.ranking, ranking.slice(0, LIMITES.maxRanking));

        const historico = getHistorico();
        historico.unshift({
            id: registro.id,
            pontos: registro.pontos,
            total: registro.total,
            percentual: registro.percentual,
            tempo: registro.tempo,
            categoria: registro.categoria,
            dificuldade: registro.dificuldade,
            data: registro.data
        });
        set(STORAGE_KEYS.historico, historico.slice(0, LIMITES.maxHistorico));

        return registro;
    }

    function getRanking() {
        const dados = get(STORAGE_KEYS.ranking);
        return Array.isArray(dados) ? dados : [];
    }

    function getHistorico() {
        const dados = get(STORAGE_KEYS.historico);
        return Array.isArray(dados) ? dados : [];
    }

    /* ---------- Tema ---------- */

    function getTema() {
        const valor = rawGet(STORAGE_KEYS.tema);
        return valor === "dark" || valor === "light" ? valor : null;
    }

    function setTema(tema) {
        rawSet(STORAGE_KEYS.tema, tema === "dark" ? "dark" : "light");
    }

    return {
        get,
        set,
        remove,
        salvarProgresso,
        carregarProgresso,
        limparProgresso,
        registrarPartida,
        getRanking,
        getHistorico,
        getTema,
        setTema
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Storage;
}