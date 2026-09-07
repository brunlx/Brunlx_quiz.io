/* Service Worker do QuizTech.
   Estratégia: cache-first para estáticos e network-first com
   fallback offline para navegações. */

const VERSAO_CACHE = "quiztech-v1";
const ARQUIVOS_ESTATICOS = [
    "./",
    "./index.html",
    "./jogo.html",
    "./css/base.css",
    "./css/index.css",
    "./css/jogo.css",
    "./js/config.js",
    "./js/quiz-core.js",
    "./js/storage.js",
    "./js/timer.js",
    "./js/ui.js",
    "./js/tema.js",
    "./js/pagina-inicial.js",
    "./js/jogo.js",
    "./manifest.webmanifest",
    "./favicon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./img/brain-512758_1280.webp",
    "./img/radeon-gpu.webp"
];

self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches
            .open(VERSAO_CACHE)
            .then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
            .catch((erro) => {
                console.warn("QuizTech SW: falha ao pré-cachear recursos.", erro);
            })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches
            .keys()
            .then((chaves) =>
                Promise.all(
                    chaves
                        .filter((chave) => chave !== VERSAO_CACHE)
                        .map((chave) => caches.delete(chave))
                )
            )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
    const requisicao = evento.request;

    if (requisicao.method !== "GET") return;

    const url = new URL(requisicao.url);
    if (url.origin !== self.location.origin) return;

    /* Navegações: rede primeiro, cache como fallback offline. */
    if (requisicao.mode === "navigate") {
        evento.respondWith(
            fetch(requisicao)
                .then((resposta) => {
                    const copia = resposta.clone();
                    caches.open(VERSAO_CACHE).then((cache) => cache.put(requisicao, copia));
                    return resposta;
                })
                .catch(() =>
                    caches.match(requisicao).then((emCache) =>
                        emCache || caches.match("./index.html")
                    )
                )
        );
        return;
    }

    /* Demais recursos: cache primeiro. */
    evento.respondWith(
        caches.match(requisicao).then((emCache) => {
            if (emCache) return emCache;
            return fetch(requisicao).then((resposta) => {
                if (resposta.ok) {
                    const copia = resposta.clone();
                    caches.open(VERSAO_CACHE).then((cache) => cache.put(requisicao, copia));
                }
                return resposta;
            });
        })
    );
});