"use strict";

/* Servidor de desenvolvimento local (sem dependências).
   Uso: node tests/servidor.js [porta] */

const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const PORTA = Number(process.argv[2]) || 8080;

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

const servidor = http.createServer((req, res) => {
    let caminho;
    try {
        caminho = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    } catch (erro) {
        res.writeHead(400);
        res.end("Requisição inválida");
        return;
    }

    if (caminho === "/") caminho = "/index.html";

    const arquivo = path.join(RAIZ, caminho);
    if (!arquivo.startsWith(RAIZ)) {
        res.writeHead(403);
        res.end("Proibido");
        return;
    }

    fs.readFile(arquivo, (erro, dados) => {
        if (erro) {
            res.writeHead(404);
            res.end("Não encontrado");
            return;
        }
        res.writeHead(200, {
            "Content-Type": MIME[path.extname(arquivo)] || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        res.end(dados);
    });
});

servidor.listen(PORTA, () => {
    console.log(`QuizTech definido em http://localhost:${PORTA}`);
});