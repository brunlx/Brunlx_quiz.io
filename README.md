# QuizTech — Quiz de Tecnologia

Quiz interativo de múltipla escolha sobre **segurança da informação, hardware, fundamentos
e redes**, feito com HTML, CSS e JavaScript puros — sem frameworks e sem backend.

O projeto nasceu como um trabalho de escola (1º ano — Informática A) e evoluiu para uma
aplicação completa, moderna, responsiva e pronta para publicação como PWA.

## Funcionalidades

- **Página inicial profissional** com apresentação, estatísticas e instruções de uso.
- **Configuração da partida**: categoria, dificuldade e quantidade de perguntas.
- **Banco com 23 perguntas comentadas** organizadas por categoria e dificuldade:
  - Categorias: Segurança da Informação, Hardware, Fundamentos e Redes e Dados.
  - Dificuldades: Fácil, Médio e Difícil.
  - Tipos de pergunta: múltipla escolha, múltipla seleção e resposta numérica.
- **Fluxo de jogo completo**:
  - Uma pergunta por vez com barra de progresso e contador.
  - Feedback imediato (correto/incorreto) com explicação do conteúdo.
  - Navegação entre perguntas (voltar/avançar) com validação de resposta.
  - Cronômetro visível durante a partida.
- **Resultado detalhado**: pontuação, percentual de acertos, classificação de desempenho
  (Excelente / Muito bom / Bom / Em desenvolvimento / Precisa estudar), tempo utilizado e
  revisão de cada questão com explicação.
- **Ranking (top 10) e histórico de partidas** persistidos em `localStorage`.
- **Modo claro e modo escuro** com persistência da preferência e respeito à preferência do sistema.
- **Página de jogo responsiva** validada para celulares, tablets e desktops.
- **Acessibilidade**: HTML semântico, navegação por teclado, foco visível, `aria` e
  suporte razoável a leitores de tela.
- **PWA**: manifest, ícones e service worker com funcionamento offline básico.
- **Progresso salvo**: se o usuário fechar o navegador, pode continuar a partida de onde parou
  (válido por 7 dias).

## Tecnologias

- **HTML5** semântico
- **CSS3** com variáveis (design tokens), temas claro/escuro e `prefers-reduced-motion`
- **JavaScript** (ES6+) organizado em módulos por responsabilidade
- **Node.js** apenas para testes (sem build e sem runtime de produção)
- **Service Worker + Web App Manifest** para PWA
- **GitHub Pages** como sugestão de hospedagem (workflow incluído)

## Estrutura

```
├── index.html            # Página inicial (hero, como funciona, sobre, modais)
├── jogo.html             # Página da partida
├── css/
│   ├── base.css          # Design tokens, tema, botões, modais e componentes comuns
│   ├── index.css         # Estilos da página inicial
│   └── jogo.css          # Estilos da partida e do resultado
├── js/
│   ├── config.js         # Constantes da aplicação (chaves, limites, assets PWA)
│   ├── quiz-core.js      # Banco de perguntas e lógica pura (testável)
│   ├── storage.js        # Abstração de persistência (localStorage / memória)
│   ├── timer.js          # Cronômetro da partida
│   ├── ui.js             # Utilitários de DOM e acessibilidade
│   ├── tema.js           # Modo claro/escuro
│   ├── pagina-inicial.js # Lógica da página inicial
│   └── jogo.js           # Lógica da partida
├── img/                  # Imagens do quiz
├── icons/                # Ícones PWA (192 e 512)
├── tests/
│   ├── test-core.js      # Testes de unidade da lógica pura (Node puro)
│   ├── test-browser.js   # Testes de integração em DOM (jsdom)
│   └── servidor.js       # Servidor de desenvolvimento local
├── sw.js                 # Service worker
├── manifest.webmanifest  # Manifest PWA
├── favicon.svg           # Favicon
├── .github/workflows/    # CI + deploy no GitHub Pages
└── package.json
```

## Como executar localmente

A aplicação é 100% estática. Há duas formas:

### 1. Abrindo direto (sem servidor)

Abra `index.html` no navegador. A maior parte dos recursos funciona, mas o service worker
(PWA/offline) só é ativado servindo o projeto por HTTP/HTTPS.

### 2. Com servidor local (recomendado)

```bash
npm install   # apenas para os testes (jsdom)
npm run serve
```

Depois acesse <http://localhost:8080>.

## Testes

```bash
npm test
```

- `tests/test-core.js` — **40 testes de unidade** (banco de perguntas, filtros, correção de
  respostas, resultado, desempenho, formatação de tempo e persistência). Sem dependências.
- `tests/test-browser.js` — **21 testes de integração** (carregamento das páginas, fluxo da
  partida, validações, resultado, histórico e PWA) executados em DOM simulado (jsdom).

Resultado esperado:

```
40 testes executados, 0 falha(s).
21 testes executados, 0 falha(s).
```

## Publicar (deploy)

### GitHub Pages (automatizado)

O workflow `.github/workflows/deploy.yml` roda os testes e publica o site no GitHub Pages
a cada push na branch `main`.

Configuração única (manual):

1. No repositório, vá em *Settings → Pages*.
2. Em *Source*, selecione **GitHub Actions**.

O site fica disponível em `https://<usuário>.github.io/<repositório>/`.

### Outra hospedagem estática

Basta enviar os arquivos do repositório (todos os caminhos são relativos). Exemplos:
Netlify, Vercel, Cloudflare Pages, Render ou qualquer servidor web simples.

## Decisões arquiteturais

- **Sem framework**: HTML + CSS + JS puro são suficientes para o escopo real do projeto.
  Isso mantém a aplicação leve, rápida e sem dependências de runtime.
- **Núcleo testável**: a lógica do quiz fica isolada em `quiz-core.js` (sem DOM e sem
  localStorage), o que permite testes automatizados simples com Node.
- **Persistência local**: `localStorage` é suficiente para ranking, histórico, progresso e
  tema. Nenhum dado sensível é armazenado.
- **Design tokens em CSS**: cores, espaçamentos, sombras e tipografia centralizados em
  variáveis CSS, evitando duplicação e permitindo os dois temas.

## Contribuindo

1. Faça um *fork* do repositório.
2. Crie uma branch para sua funcionalidade.
3. Rode os testes (`npm test`) antes de enviar.
4. Abra um *Pull Request* descrevendo a mudança.

## Créditos

Feito por **Bruno** — 1º ano (Informática A) · @brunlx.xz

## Licença

MIT — veja o arquivo [LICENSE](LICENSE).