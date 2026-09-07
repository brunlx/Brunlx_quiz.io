"use strict";

/* Testes automatizados da lógica pura do QuizTech. Executar com:
   node tests/test-core.js
   (sem dependências externas; usa apenas Node.js puro.) */

const assert = require("assert");

const core = require("../js/quiz-core.js");
const Storage = require("../js/storage.js");

const {
    CATEGORIAS,
    DIFICULDADES,
    PERGUNTAS,
    filtrarPerguntas,
    perguntasPorIds,
    normalizarConfiguracao,
    calcularAcerto,
    calcularResultado,
    classificarDesempenho,
    formatarTempo
} = core;

let testes = 0;
let falhas = 0;

function testar(nome, fn) {
    testes += 1;
    try {
        fn();
        console.log(`  ok  ${nome}`);
    } catch (erro) {
        falhas += 1;
        console.error(`  FALHOU  ${nome}\n    ${erro.message}`);
    }
}

function secao(nome) {
    console.log(`\n# ${nome}`);
}

/* ---------- Banco de perguntas ---------- */

secao("Banco de perguntas");

testar("contém 23 perguntas válidas", () => {
    assert.strictEqual(PERGUNTAS.length, 23);
});

testar("cada pergunta tem id, texto, tipo, categoria e dificuldade", () => {
    PERGUNTAS.forEach((pergunta) => {
        assert.ok(pergunta.id, "id ausente");
        assert.ok(pergunta.texto, "texto ausente");
        assert.ok(pergunta.explicacao, "explicação ausente");
        assert.ok(CATEGORIAS[pergunta.categoria], `categoria inválida: ${pergunta.categoria}`);
        assert.ok(DIFICULDADES[pergunta.dificuldade], `dificuldade inválida: ${pergunta.dificuldade}`);
    });
    assert.strictEqual(new Set(PERGUNTAS.map((p) => p.id)).size, PERGUNTAS.length, "ids duplicados");
});

testar("perguntas de múltipla escolha têm opções e resposta correta", () => {
    PERGUNTAS.filter((p) => p.tipo === "radio").forEach((pergunta) => {
        assert.ok(pergunta.opcoes.length >= 2, "menos de 2 opções");
        assert.ok(
            pergunta.respostaCorreta >= 0 && pergunta.respostaCorreta < pergunta.opcoes.length,
            "respostaCorreta fora do intervalo"
        );
    });
});

testar("checkbox tem respostasCorretas válidas", () => {
    const multipla = PERGUNTAS.find((p) => p.tipo === "checkbox");
    assert.ok(multipla);
    multipla.respostasCorretas.forEach((indice) => {
        assert.ok(indice >= 0 && indice < multipla.opcoes.length);
    });
});

testar("pergunta numérica tem anoCorreto válido", () => {
    const numerica = PERGUNTAS.find((p) => p.tipo === "number");
    assert.ok(numerica);
    assert.strictEqual(numerica.anoCorreto, 1969);
});

/* ---------- Filtragem ---------- */

secao("Filtragem de perguntas");

testar("sem filtros retorna todas as perguntas", () => {
    const todas = filtrarPerguntas({});
    assert.strictEqual(todas.length, PERGUNTAS.length);
});

testar("filtra por categoria", () => {
    const seguranca = filtrarPerguntas({ categoria: "seguranca" });
    assert.strictEqual(seguranca.length, 6);
    assert.ok(seguranca.every((p) => p.categoria === "seguranca"));
});

testar("filtra por dificuldade", () => {
    const dificil = filtrarPerguntas({ dificuldade: "dificil" });
    assert.strictEqual(dificil.length, 7);
    assert.ok(dificil.every((p) => p.dificuldade === "dificil"));
});

testar("filtra por categoria e dificuldade combinadas", () => {
    const combo = filtrarPerguntas({ categoria: "hardware", dificuldade: "facil" });
    assert.strictEqual(combo.length, 2);
    assert.ok(combo.every((p) => p.categoria === "hardware" && p.dificuldade === "facil"));
});

testar("limita a quantidade solicitada", () => {
    const comLimite = filtrarPerguntas({ quantidade: 5 });
    assert.strictEqual(comLimite.length, 5);
});

testar("não estoura o limite mesmo pedindo mais do que existe", () => {
    const pedindoMuito = filtrarPerguntas({ categoria: "seguranca", quantidade: 10 });
    assert.strictEqual(pedindoMuito.length, 6);
});

testar("categoria inválida cai em 'todas' na normalização", () => {
    const normalizada = normalizarConfiguracao({ categoria: "inexistente" });
    assert.strictEqual(normalizada.categoria, "todas");
});

testar("perguntasPorIds reconstrói a lista a partir de ids", () => {
    const ids = [3, 8, 13];
    const resolvidas = perguntasPorIds(ids);
    assert.strictEqual(resolvidas.length, 3);
    assert.deepStrictEqual(resolvidas.map((p) => p.id), [3, 8, 13]);
});

testar("perguntasPorIds ignora ids inexistentes", () => {
    const resolvidas = perguntasPorIds([1, 999]);
    assert.strictEqual(resolvidas.length, 1);
    assert.strictEqual(resolvidas[0].id, 1);
});

/* ---------- Correção de respostas ---------- */

secao("Correção de respostas");

testar("radio: resposta correta", () => {
    const pergunta = PERGUNTAS[0];
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "radio", valor: pergunta.respostaCorreta }), true);
});

testar("radio: resposta errada", () => {
    const pergunta = PERGUNTAS[0];
    const errada = pergunta.respostaCorreta === 0 ? 1 : 0;
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "radio", valor: errada }), false);
});

testar("checkbox: conjunto exato é correto", () => {
    const pergunta = PERGUNTAS.find((p) => p.tipo === "checkbox");
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "checkbox", valores: [...pergunta.respostasCorretas] }), true);
});

testar("checkbox: conjunto incompleto é incorreto", () => {
    const pergunta = PERGUNTAS.find((p) => p.tipo === "checkbox");
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "checkbox", valores: [0] }), false);
});

testar("checkbox: conjunto com opção errada é incorreto", () => {
    const pergunta = PERGUNTAS.find((p) => p.tipo === "checkbox");
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "checkbox", valores: [0, 1, 3] }), false);
});

testar("checkbox: ordem não importa", () => {
    const pergunta = PERGUNTAS.find((p) => p.tipo === "checkbox");
    assert.strictEqual(
        calcularAcerto(pergunta, { tipo: "checkbox", valores: [...pergunta.respostasCorretas].reverse() }),
        true
    );
});

testar("número: valor correto", () => {
    const pergunta = PERGUNTAS.find((p) => p.tipo === "number");
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "number", valor: pergunta.anoCorreto }), true);
});

testar("número: valor incorreto", () => {
    const pergunta = PERGUNTAS.find((p) => p.tipo === "number");
    assert.strictEqual(calcularAcerto(pergunta, { tipo: "number", valor: 2000 }), false);
});

testar("resposta ausente nunca é considerada correta", () => {
    PERGUNTAS.forEach((pergunta) => {
        assert.strictEqual(calcularAcerto(pergunta, null), false);
    });
});

/* ---------- Cálculo de resultado ---------- */

secao("Cálculo de resultado");

testar("todas corretas resulta 100%", () => {
    const perguntas = filtrarPerguntas({ quantidade: 5 });
    const respostas = {};
    perguntas.forEach((pergunta, indice) => {
        respostas[indice] = pergunta.tipo === "radio"
            ? { tipo: "radio", valor: pergunta.respostaCorreta }
            : pergunta.tipo === "checkbox"
                ? { tipo: "checkbox", valores: pergunta.respostasCorretas }
                : { tipo: "number", valor: pergunta.anoCorreto };
    });
    const resultado = calcularResultado(perguntas, respostas);
    assert.strictEqual(resultado.pontos, 5);
    assert.strictEqual(resultado.percentual, 100);
});

testar("todas erradas resulta 0%", () => {
    const perguntas = filtrarPerguntas({ quantidade: 5 }).filter((p) => p.tipo === "radio");
    const respostas = {};
    perguntas.forEach((pergunta, indice) => {
        respostas[indice] = { tipo: "radio", valor: pergunta.respostaCorreta === 0 ? 1 : 0 };
    });
    const resultado = calcularResultado(perguntas, respostas);
    assert.strictEqual(resultado.pontos, 0);
    assert.strictEqual(resultado.percentual, 0);
});

testar("contabiliza corretas e incorretas", () => {
    const perguntas = filtrarPerguntas({ quantidade: 4 });
    const respostas = {
        0: { tipo: "radio", valor: perguntas[0].respostaCorreta },
        1: { tipo: "radio", valor: perguntas[1].respostaCorreta === 0 ? 1 : 0 }
    };
    const resultado = calcularResultado(perguntas, respostas);
    assert.strictEqual(resultado.pontos, 1);
    assert.strictEqual(resultado.total, 4);
    assert.strictEqual(resultado.percentual, 25);
});

testar("nível de dificuldade padrão é 'todas'", () => {
    const normalizada = normalizarConfiguracao({});
    assert.strictEqual(normalizada.dificuldade, "todas");
});

/* ---------- Desempenho ---------- */

secao("Classificação de desempenho");

testar("100% é Excelente", () => {
    assert.ok(classificarDesempenho(10, 10).rotulo.includes("Excelente"));
});

testar("80-99% é Muito bom", () => {
    assert.ok(classificarDesempenho(4, 5).rotulo.includes("Muito"));
});

testar("60-79% é Bom", () => {
    assert.strictEqual(classificarDesempenho(3, 5).rotulo, "Bom");
});

testar("40-59% é Em desenvolvimento", () => {
    assert.strictEqual(classificarDesempenho(2, 5).rotulo, "Em desenvolvimento");
});

testar("menos de 40% é Precisa estudar", () => {
    assert.strictEqual(classificarDesempenho(1, 5).rotulo, "Precisa estudar");
});

testar("total zero não quebra a classificação", () => {
    assert.ok(classificarDesempenho(0, 0).rotulo);
});

/* ---------- Formatação de tempo ---------- */

secao("Formatação de tempo");

testar("segundos viram mm:ss", () => {
    assert.strictEqual(formatarTempo(65), "01:05");
    assert.strictEqual(formatarTempo(0), "00:00");
    assert.strictEqual(formatarTempo(3599), "59:59");
});

testar("nulo ou inválido vira --:--", () => {
    assert.strictEqual(formatarTempo(null), "--:--");
    assert.strictEqual(formatarTempo(undefined), "--:--");
});

testar("formato com horas quando solicitado", () => {
    assert.strictEqual(formatarTempo(3723, true), "1:02:03");
});

/* ---------- Persistência ---------- */

secao("Persistência (storage em memória)");

testar("registrarPartida cria ranking e histórico ordenados", () => {
    const reg1 = Storage.registrarPartida(5, 10, 120, { categoria: "todas", dificuldade: "todas" });
    const reg2 = Storage.registrarPartida(9, 10, 90, { categoria: "hardware", dificuldade: "facil" });

    const ranking = Storage.getRanking();
    assert.strictEqual(ranking.length, 2);
    assert.strictEqual(ranking[0].pontos, 9, "ranking deve ordenar por pontos decrescente");

    const historico = Storage.getHistorico();
    assert.strictEqual(historico.length, 2);
    assert.strictEqual(historico[0].id, reg2.id, "histórico deve listar a mais recente primeiro");
    assert.strictEqual(historico[0].categoria, "hardware");
    assert.ok(historico[0].percentual >= 0 && historico[0].percentual <= 100);
});

testar("limite de partidas no histórico é respeitado", () => {
    Storage.remove("quiztech.historico.v1");
    for (let i = 0; i < 25; i += 1) {
        Storage.registrarPartida(i % 10, 10, 60, { categoria: "todas", dificuldade: "todas" });
    }
    assert.ok(Storage.getHistorico().length <= 20);
});

testar("progresso salvo é recuperado", () => {
    Storage.salvarProgresso({
        ids: [1, 2, 3],
        indice: 1,
        respostas: { 0: { tipo: "radio", valor: 0 } },
        tempoDecorrido: 42,
        configuracao: { categoria: "todas", dificuldade: "todas" }
    });
    const progresso = Storage.carregarProgresso();
    assert.strictEqual(progresso.indice, 1);
    assert.deepStrictEqual(progresso.ids, [1, 2, 3]);
    assert.strictEqual(progresso.tempoDecorrido, 42);
});

testar("limparProgresso remove o progresso", () => {
    Storage.limparProgresso();
    assert.strictEqual(Storage.carregarProgresso(), null);
});

/* ---------- Resumo ---------- */

console.log(`\n${testes} testes executados, ${falhas} falha(s).`);
process.exit(falhas > 0 ? 1 : 0);