"use strict";

/* Configurações centrais da aplicação QuizTech. */

const APLICACAO = {
    nome: "QuizTech",
    slogan: "Teste seus conhecimentos em tecnologia",
    descricao:
        "Quiz de múltipla escolha sobre segurança da informação, hardware, " +
        "fundamentos e redes para você testar seus conhecimentos.",
    versao: "1.0.0"
};

const STORAGE_KEYS = {
    progresso: "quiztech.progresso.v1",
    ranking: "quiztech.ranking.v1",
    historico: "quiztech.historico.v1",
    tema: "quiztech.tema.v1"
};

const LIMITES = {
    expiracaoDias: 7,
    maxRanking: 10,
    maxHistorico: 20
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = { APLICACAO, STORAGE_KEYS, LIMITES };
}