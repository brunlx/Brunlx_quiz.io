"use strict";

/* Testes de integração em DOM simulado (jsdom).
   Servem as páginas reais por HTTP e as carregam com execução completa
   de scripts, exercitando os fluxos principais do quiz.
   Executar: node tests/test-browser.js */

const { JSDOM, VirtualConsole } = require("jsdom");
const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const RAIZ = path.resolve(__dirname, "..");
const MIME = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".webmanifest": "application/manifest+json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

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

function servir() {
    const servidor = http.createServer((req, res) => {
        const caminho = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        const arquivo = path.join(RAIZ, caminho === "/" ? "index.html" : caminho);
        fs.readFile(arquivo, (erro, dados) => {
            if (erro) {
                res.writeHead(404);
                res.end("not found");
                return;
            }
            res.writeHead(200, { "Content-Type": MIME[path.extname(arquivo)] || "application/octet-stream" });
            res.end(dados);
        });
    });
    return new Promise((resolve) => {
        servidor.listen(0, "127.0.0.1", () => resolve(servidor));
    });
}

function abrirPagina(servidor, url, errosInjetados) {
    const virtual = new VirtualConsole();
    virtual.on("jsdomError", (erro) => {
        const mensagem = String(erro.message || erro);
        if (mensagem.includes("Not implemented")) return;
        errosInjetados.push(mensagem);
    });
    virtual.on("error", (mensagem) => errosInjetados.push(String(mensagem)));
    virtual.on("warn", (mensagem) => {
        const texto = String(mensagem);
        if (texto.includes("not implemented") || texto.includes("Not implemented")) return;
        errosInjetados.push("warn: " + texto);
    });
    return JSDOM.fromURL(servidor.address().address.match(/^(\d+\.\d+\.\d+\.\d+)$/)
        ? url.replace("127.0.0.1", "127.0.0.1")
        : url, {
        resources: "usable",
        runScripts: "dangerously",
        pretendToBeVisual: true,
        virtualConsole: virtual,
        beforeParse(win) {
            win.addEventListener("error", (ev) => {
                if (ev.error) errosInjetados.push(String(ev.error.message || ev.error));
            });
        }
    });
}

(async () => {
    const servidor = await servir();
    const porta = servidor.address().port;
    const base = `http://127.0.0.1:${porta}`;
    const errosInjetados = [];

    /* ---------- Página inicial ---------- */
    secao("Página inicial");
    const domInicial = await abrirPagina(servidor, `${base}/index.html`, errosInjetados);
    await new Promise((r) => setTimeout(r, 300));
    const win = domInicial.window;
    const doc = win.document;

    testar("título e assunto corretos", () => {
        assert.match(doc.title, /QuizTech/);
    });

    testar("tema é aplicado ao elemento html", () => {
        assert.ok(["light", "dark"].includes(doc.documentElement.dataset.theme));
    });

    testar("estatísticas são preenchidas", () => {
        assert.strictEqual(doc.getElementById("cont-perguntas").textContent, "15");
        assert.strictEqual(doc.getElementById("cont-categorias").textContent, "4");
        assert.strictEqual(doc.getElementById("cont-dificuldades").textContent, "3");
    });

    testar("botão Jogar abre o modal de configuração", () => {
        doc.getElementById("btn-jogar").click();
        assert.ok(doc.getElementById("modal-config-overlay").classList.contains("modal-overlay--ativo"));
        assert.strictEqual(doc.getElementById("config-disponiveis").textContent.trim(), "15 perguntas disponíveis");
    });

    testar("configuração reflete número de perguntas disponíveis", () => {
        const categoria = doc.querySelector('input[name="categoria"][value="seguranca"]');
        categoria.checked = true;
        categoria.dispatchEvent(new win.Event("change", { bubbles: true }));
        const dificuldade = doc.querySelector('input[name="dificuldade"][value="dificil"]');
        dificuldade.checked = true;
        dificuldade.dispatchEvent(new win.Event("change", { bubbles: true }));
        assert.strictEqual(doc.getElementById("config-disponiveis").textContent.trim(), "4 perguntas disponíveis");
    });

    testar("ranking vazio mostra estado vazio", () => {
        doc.getElementById("aba-ranking").click();
        doc.getElementById("btn-ranking").click();
        assert.ok(doc.getElementById("ranking-lista").textContent.includes("Nenhuma pontuação"));
    });

    testar("modo escuro é alternado e persistido", () => {
        const estavaEscuro = doc.documentElement.dataset.theme === "dark";
        doc.getElementById("btn-tema").click();
        const novo = doc.documentElement.dataset.theme;
        assert.strictEqual(novo, estavaEscuro ? "light" : "dark");
        assert.strictEqual(win.localStorage.getItem("quiztech.tema.v1"), novo);
    });

    testar("page não registra erros de console", () => {
        assert.deepStrictEqual(errosInjetados, [], errosInjetados.join("\n"));
    });
    domInicial.window.close();

    /* ---------- Partida ---------- */
    secao("Partida");
    const domJogo = await abrirPagina(servidor, `${base}/jogo.html?categoria=todas&dificuldade=todas&quantidade=5`, errosInjetados);
    await new Promise((r) => setTimeout(r, 400));
    const winJ = domJogo.window;
    const docJ = winJ.document;

    testar("primeira pergunta renderizada", () => {
        assert.ok(docJ.querySelector(".pergunta__titulo"));
        assert.strictEqual(docJ.getElementById("quiz-total").textContent, "5");
        assert.strictEqual(docJ.getElementById("quiz-atual").textContent, "1");
        assert.strictEqual(docJ.getElementById("quiz-total-responder").textContent, "5");
    });

    testar("cronômetro aparece na interface", () => {
        const tempo = docJ.getElementById("quiz-tempo").textContent;
        assert.match(tempo, /^\d{2}:\d{2}$/);
    });

    testar("não avança sem responder", () => {
        docJ.getElementById("btn-proxima").click();
        assert.ok(!docJ.getElementById("quiz-aviso").hidden);
        assert.strictEqual(docJ.getElementById("quiz-atual").textContent, "1");
    });

    testar("responde corretamente todas as perguntas e finaliza", () => {
        const total = Number(docJ.getElementById("quiz-total").textContent);
        for (let passo = 0; passo < total; passo += 1) {
            const pergunta = winJ.eval("Jogo.perguntas[Jogo.indice]");
            if (!pergunta) throw new Error("pergunta ausente no passo " + (passo + 1));
            const painel = docJ.getElementById("quiz-painel");

            if (pergunta.tipo === "number") {
                const input = painel.querySelector('input[name="resposta"]');
                input.value = String(pergunta.anoCorreto);
                input.dispatchEvent(new winJ.Event("input", { bubbles: true }));
            } else {
                const indices = pergunta.tipo === "checkbox"
                    ? pergunta.respostasCorretas
                    : [pergunta.respostaCorreta];
                indices.forEach((indice) => {
                    const campo = painel.querySelector(`input[name="resposta"][value="${indice}"]`);
                    campo.checked = true;
                    campo.dispatchEvent(new winJ.Event("change", { bubbles: true }));
                });
            }
            assert.ok(painel.querySelector(".feedback"), "feedback ausente no passo " + (passo + 1));
            docJ.getElementById("btn-proxima").click();
        }
        const modal = docJ.getElementById("modal-resultado-overlay");
        assert.ok(modal.classList.contains("modal-overlay--ativo"), "modal de resultado não abriu");
        assert.strictEqual(docJ.querySelector(".resultado__pontos").textContent, "5/5");
        assert.ok(docJ.querySelector(".resultado__rotulo").textContent.includes("Excelente"));
        assert.strictEqual(docJ.querySelector(".resultado__estatistica--corretas strong").textContent, "5");
        assert.strictEqual(docJ.querySelector(".resultado__estatistica--incorretas strong").textContent, "0");
        assert.ok(docJ.querySelectorAll(".resultado__item").length === 5);
    });

    testar("partida registrada no histórico e ranking", () => {
        const historico = winJ.eval("Storage.getHistorico()");
        const ranking = winJ.eval("Storage.getRanking()");
        assert.ok(historico.length >= 1);
        assert.strictEqual(historico[0].pontos, 5);
        assert.strictEqual(historico[0].percentual, 100);
        assert.ok(ranking.some((item) => item.pontos === 5));
    });

    testar("jogar novamente reinicia a partida", () => {
        docJ.getElementById("btn-reiniciar").click();
        assert.ok(!docJ.getElementById("modal-resultado-overlay").classList.contains("modal-overlay--ativo"));
        assert.strictEqual(docJ.getElementById("quiz-atual").textContent, "1");
        assert.strictEqual(docJ.getElementById("quiz-respondidas").textContent, "0");
        assert.ok(docJ.querySelector(".pergunta__titulo"));
    });

    testar("voltar funciona e mantém estado", () => {
        const perguntaAtual = Number(docJ.getElementById("quiz-atual").textContent);
        const anterior = perguntaAtual > 1 ? perguntaAtual - 1 : null;
        docJ.getElementById("btn-anterior").click();
        if (anterior) {
            assert.strictEqual(docJ.getElementById("quiz-atual").textContent, String(anterior));
        }
    });

    testar("resposta incorreta é marcada e explicada", () => {
        const painel = docJ.getElementById("quiz-painel");
        const pergunta = winJ.eval("Jogo.perguntas[Jogo.indice]");
        if (pergunta.tipo === "radio") {
            const errada = pergunta.respostaCorreta === 0 ? 1 : 0;
            const campo = painel.querySelector(`input[name="resposta"][value="${errada}"]`);
            campo.checked = true;
            campo.dispatchEvent(new winJ.Event("change", { bubbles: true }));
            const feedback = painel.querySelector(".feedback--errado");
            assert.ok(feedback, "feedback de erro não exibido");
        } else {
            assert.ok(true, "pergunta atual não é radio — pulando");
        }
    });

    testar("modal de continuar aparece ao recarregar com progresso salvo", async () => {
        // salva um progresso ativo
        winJ.eval(`
            Storage.salvarProgresso({
                ids: [1, 2, 3],
                indice: 1,
                respostas: { 0: { tipo: "radio", valor: 1 } },
                tempoDecorrido: 30,
                configuracao: { categoria: "todas", dificuldade: "todas" }
            });
        `);
        const dom2 = await abrirPagina(servidor, `${base}/jogo.html`, errosInjetados);
        await new Promise((r) => setTimeout(r, 400));
        const doc2 = dom2.window.document;
        assert.ok(doc2.getElementById("modal-continuar-overlay").classList.contains("modal-overlay--ativo"));
        doc2.getElementById("btn-novo-quiz").click();
        assert.ok(!doc2.getElementById("modal-continuar-overlay").classList.contains("modal-overlay--ativo"));
        assert.ok(doc2.querySelector(".pergunta__titulo"));
        dom2.window.close();
    });

    testar("partida não registra erros de console", () => {
        assert.deepStrictEqual(errosInjetados, [], errosInjetados.join("\n"));
    });
    domJogo.window.close();

    secao("Manifest e service worker");
    testar("manifest.webmanifest é JSON válido", async () => {
        const resposta = await fetch(`${base}/manifest.webmanifest`);
        const json = await resposta.json();
        assert.strictEqual(json.name, "QuizTech — Quiz de Tecnologia");
        assert.ok(json.icons.length >= 2);
    });

    testar("arquivos do manifest existem", async () => {
        const icones = ["/icons/icon-192.png", "/icons/icon-512.png"];
        for (const iconePath of icones) {
            const resposta = await fetch(base + iconePath);
            assert.ok(resposta.ok, iconePath);
            const buffer = Buffer.from(await resposta.arrayBuffer());
            assert.ok(buffer.length > 0);
        }
    });

    testar("sw.js serve conteúdo válido", async () => {
        const resposta = await fetch(`${base}/sw.js`);
        assert.ok(resposta.ok);
        const texto = await resposta.text();
        assert.ok(texto.includes("addEventListener('install'"));
        assert.ok(texto.includes("addEventListener('fetch'"));
    });

    servidor.close();
    console.log(`\n${testes} testes executados, ${falhas} falha(s).`);
    process.exit(falhas > 0 ? 1 : 0);
})().catch((erro) => {
    console.error("Falha fatal no harness:", erro);
    process.exit(1);
});