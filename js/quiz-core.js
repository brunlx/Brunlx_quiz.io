"use strict";

/* Núcleo da aplicação: banco de perguntas e lógica pura do quiz.
   Independe de DOM e de localStorage, o que permite testes em Node. */

const CATEGORIAS = {
    todas: "Todas as categorias",
    seguranca: "Segurança da Informação",
    hardware: "Hardware",
    fundamentos: "Fundamentos da Computação",
    redes: "Redes e Dados"
};

const DIFICULDADES = {
    todas: "Todas as dificuldades",
    facil: "Fácil",
    medio: "Médio",
    dificil: "Difícil"
};

const PERGUNTAS = [
    {
        id: 1,
        categoria: "seguranca",
        dificuldade: "dificil",
        texto: "Qual o sistema operacional mais utilizado para pentest?",
        tipo: "radio",
        opcoes: ["Debian Linux", "Kali Linux", "Arch Linux", "Windows 11"],
        respostaCorreta: 1,
        explicacao:
            "O Kali Linux é uma distribuição baseada em Debian, criada especificamente para testes de penetração e auditoria de segurança, com centenas de ferramentas pré-instaladas."
    },
    {
        id: 2,
        categoria: "seguranca",
        dificuldade: "dificil",
        texto: "Qual é uma das principais ferramentas usadas para mapeamento de portas em redes?",
        tipo: "radio",
        opcoes: ["Nmap", "Medusa", "Metasploit", "Hydra"],
        respostaCorreta: 0,
        explicacao:
            "O Nmap é a ferramenta padrão da indústria para descoberta de rede e auditoria de segurança, especializada em mapeamento de portas e serviços."
    },
    {
        id: 3,
        categoria: "fundamentos",
        dificuldade: "facil",
        texto: "Quantos caracteres existem no sistema hexadecimal?",
        tipo: "radio",
        opcoes: ["8 caracteres", "16 caracteres", "6 caracteres", "32 caracteres"],
        respostaCorreta: 1,
        explicacao:
            "O sistema hexadecimal utiliza 16 símbolos: os dígitos de 0 a 9 e as letras de A a F."
    },
    {
        id: 4,
        categoria: "redes",
        dificuldade: "medio",
        texto: "Quais destas opções abaixo são relacionadas a banco de dados?",
        tipo: "checkbox",
        multipla: true,
        opcoes: ["Oracle DB", "C#", "C++", "MySQL"],
        respostasCorretas: [0, 3],
        explicacao:
            "Oracle DB e MySQL são sistemas de gerenciamento de banco de dados (SGBD). Já C# e C++ são linguagens de programação de propósito geral."
    },
    {
        id: 5,
        categoria: "fundamentos",
        dificuldade: "facil",
        texto: "Qual foi a tecnologia principal utilizada para criar a estrutura deste site?",
        tipo: "radio",
        opcoes: ["Python", "C++", "HTML", "Java"],
        respostaCorreta: 2,
        explicacao:
            "O HTML (HyperText Markup Language) é a linguagem de marcação usada para estruturar o conteúdo de páginas web."
    },
    {
        id: 6,
        categoria: "fundamentos",
        dificuldade: "facil",
        texto: "Qual o sistema operacional mais utilizado no mundo?",
        tipo: "radio",
        opcoes: ["Android", "iOS", "Windows", "Unix"],
        respostaCorreta: 0,
        explicacao:
            "O Android é o sistema operacional mais utilizado do mundo, presente em bilhões de dispositivos móveis."
    },
    {
        id: 7,
        categoria: "hardware",
        dificuldade: "facil",
        texto: "O hardware de armazenamento mais veloz é o:",
        tipo: "radio",
        opcoes: ["Disquete", "DVD", "HDD", "SSD"],
        respostaCorreta: 3,
        explicacao:
            "O SSD utiliza memória flash e não possui partes mecânicas, sendo significativamente mais rápido que HDDs, DVDs e disquetes."
    },
    {
        id: 8,
        categoria: "hardware",
        dificuldade: "facil",
        texto: "Qual o hardware representado na imagem?",
        tipo: "radio",
        imagem: "img/radeon-gpu.webp",
        imagemAlt: "Placa de vídeo Radeon",
        opcoes: ["Placa de vídeo", "Placa-mãe", "Fonte", "Teclado"],
        respostaCorreta: 0,
        explicacao:
            "A imagem mostra uma placa de vídeo (GPU), componente responsável pelo processamento gráfico e também muito usado em mineração de criptomoedas."
    },
    {
        id: 9,
        categoria: "seguranca",
        dificuldade: "dificil",
        texto: "Qual das ferramentas abaixo é usada para brute force?",
        tipo: "radio",
        opcoes: ["Msfvenom", "Hydra", "Aircrack-ng", "Wireshark"],
        respostaCorreta: 1,
        explicacao:
            "O Hydra é uma ferramenta de força bruta usada para atacar serviços de autenticação como SSH, FTP e HTTP."
    },
    {
        id: 10,
        categoria: "hardware",
        dificuldade: "medio",
        texto: "Qual o principal hardware usado para mineração de criptomoedas?",
        tipo: "radio",
        opcoes: ["Processador", "Placa de vídeo", "Fonte", "ASICs"],
        respostaCorreta: 3,
        explicacao:
            "Os ASICs são o hardware principal para mineração de criptomoedas por sua alta eficiência energética e alto hashrate, sendo projetados especificamente para algoritmos como o SHA-256 do Bitcoin."
    },
    {
        id: 11,
        categoria: "fundamentos",
        dificuldade: "facil",
        texto: "Qual a única linguagem nativa dos computadores?",
        tipo: "radio",
        opcoes: ["Binário", "Hexadecimal", "Decimal", "Portugol"],
        respostaCorreta: 0,
        explicacao:
            "Os computadores processam informações em binário (0s e 1s), a única linguagem que o hardware entende diretamente."
    },
    {
        id: 12,
        categoria: "redes",
        dificuldade: "dificil",
        texto: "Qual a camada mais profunda da internet?",
        tipo: "radio",
        opcoes: ["Surface Web", "Deep Web", "Dark Web", "Não há camadas"],
        respostaCorreta: 2,
        explicacao:
            "A Dark Web é a camada mais profunda e restrita da internet, acessível apenas através de softwares específicos como o Tor."
    },
    {
        id: 13,
        categoria: "redes",
        dificuldade: "medio",
        texto: "Em que ano foi criada a internet?",
        tipo: "number",
        anoCorreto: 1969,
        minimo: 1900,
        maximo: 2100,
        placeholder: "Ex.: 1969",
        explicacao:
            "A ARPANET, precursora da internet, enviou sua primeira mensagem em 29 de outubro de 1969, entre a UCLA e o Stanford Research Institute."
    },
    {
        id: 14,
        categoria: "hardware",
        dificuldade: "medio",
        texto: "Qual hardware faz a leitura de todo o algoritmo?",
        tipo: "radio",
        opcoes: ["Placa de rede", "Placa de vídeo", "Processador", "Memória RAM"],
        respostaCorreta: 2,
        explicacao:
            "O processador (CPU) é o componente responsável por executar instruções e processar todos os algoritmos e programas do computador."
    },
    {
        id: 15,
        categoria: "seguranca",
        dificuldade: "dificil",
        texto: "O código a seguir está correto?",
        tipo: "radio",
        codigo: 'hydra -l admin -P senhas.txt 192.168.1.100 http-post-form "/login.php:user=^USER^&pass=^PASS^:Login Failed"',
        opcoes: ["Sim", "Não"],
        respostaCorreta: 0,
        explicacao:
            "O comando está correto: usa -l para usuário único, -P para lista de senhas e o formato http-post-form com os placeholders ^USER^ e ^PASS^."
    },
    {
        id: 16,
        categoria: "hardware",
        dificuldade: "dificil",
        texto: "Qual componente armazena as configurações de inicialização (BIOS/UEFI) do computador?",
        tipo: "radio",
        opcoes: ["HDD", "Memória ROM/flash da placa-mãe", "SSD", "Memória cache"],
        respostaCorreta: 1,
        explicacao:
            "O firmware BIOS/UEFI fica gravado em uma memória ROM/flash localizada na placa-mãe, sendo responsável pelo POST e pela inicialização do sistema."
    },
    {
        id: 17,
        categoria: "hardware",
        dificuldade: "medio",
        texto: "Qual memória é a mais rápida e fica localizada dentro do processador?",
        tipo: "radio",
        opcoes: ["Memória cache", "Memória RAM", "HDD", "SSD"],
        respostaCorreta: 0,
        explicacao:
            "A memória cache (níveis L1, L2 e L3) fica dentro ou muito próxima do processador, sendo a mais rápida do sistema, usada para acelerar o acesso aos dados mais usados."
    },
    {
        id: 18,
        categoria: "seguranca",
        dificuldade: "facil",
        texto: "Qual prática é a mais segura no dia a dia para proteger suas senhas?",
        tipo: "radio",
        opcoes: [
            "Usar a mesma senha em todos os sites",
            "Usar senhas fortes e únicas com autenticação em duas etapas",
            "Anotar as senhas em papéis ao lado do computador",
            "Compartilhar senhas com amigos de confiança"
        ],
        respostaCorreta: 1,
        explicacao:
            "Senhas fortes, únicas por serviço e combinadas com autenticação em duas etapas (2FA) reduzem drasticamente o risco de invasões e vazamentos."
    },
    {
        id: 19,
        categoria: "seguranca",
        dificuldade: "medio",
        texto: "O que é phishing?",
        tipo: "radio",
        opcoes: [
            "Um vírus que apaga arquivos do computador",
            "Uma técnica de engenharia social que tenta enganar usuários para obter dados",
            "Um tipo de firewall de redes",
            "Um ataque de força bruta contra servidores"
        ],
        respostaCorreta: 1,
        explicacao:
            "Phishing é uma técnica de engenharia social: o atacante se passa por uma empresa ou pessoa confiável (via e-mail, SMS ou site falso) para roubar senhas e dados pessoais."
    },
    {
        id: 20,
        categoria: "fundamentos",
        dificuldade: "medio",
        texto: "Quantos bits formam 1 byte?",
        tipo: "radio",
        opcoes: ["4 bits", "8 bits", "16 bits", "32 bits"],
        respostaCorreta: 1,
        explicacao:
            "1 byte é formado por 8 bits, sendo a unidade básica de armazenamento usada para representar um caractere (letra, número ou símbolo)."
    },
    {
        id: 21,
        categoria: "fundamentos",
        dificuldade: "dificil",
        texto: "Qual algoritmo de ordenação possui complexidade O(n log n) no caso médio?",
        tipo: "radio",
        opcoes: ["Bubble sort", "Insertion sort", "Merge sort", "Selection sort"],
        respostaCorreta: 2,
        explicacao:
            "O Merge sort divide o problema recursivamente e tem complexidade O(n log n) no melhor, médio e pior caso. Bubble, Insertion e Selection sort são O(n²) no caso médio."
    },
    {
        id: 22,
        categoria: "redes",
        dificuldade: "facil",
        texto: "Qual destes é um navegador (browser) de internet?",
        tipo: "radio",
        opcoes: ["Windows", "Google Chrome", "Photoshop", "Linux"],
        respostaCorreta: 1,
        explicacao:
            "O Google Chrome é um navegador web. Windows e Linux são sistemas operacionais e o Photoshop é um editor de imagens."
    },
    {
        id: 23,
        categoria: "redes",
        dificuldade: "medio",
        texto: "Em que ano Tim Berners-Lee criou a World Wide Web (WWW)?",
        tipo: "number",
        anoCorreto: 1989,
        minimo: 1900,
        maximo: 2100,
        placeholder: "Ex.: 1989",
        explicacao:
            "Em 1989, Tim Berners-Lee propôs a World Wide Web no CERN, criando o primeiro navegador e o protocolo HTTP. A internet em si (ARPANET) é de 1969 — são coisas diferentes."
    }
];

/* Filtra o banco de perguntas de acordo com a configuração da partida. */
function filtrarPerguntas(opcoes = {}) {
    const categoria = opcoes.categoria || "todas";
    const dificuldade = opcoes.dificuldade || "todas";

    let lista = PERGUNTAS.filter(
        (pergunta) =>
            (categoria === "todas" || pergunta.categoria === categoria) &&
            (dificuldade === "todas" || pergunta.dificuldade === dificuldade)
    );

    if (opcoes.quantidade && opcoes.quantidade !== "todas") {
        lista = lista.slice(0, Number(opcoes.quantidade));
    }

    return lista;
}

/* Reconstrói uma lista de perguntas a partir de IDs persistidos. */
function perguntasPorIds(ids) {
    if (!Array.isArray(ids)) return [];
    return ids
        .map((id) => PERGUNTAS.find((p) => p.id === Number(id)))
        .filter(Boolean);
}

/* Valida uma configuração vinda da URL, usando valores padrão seguros. */
function normalizarConfiguracao(opcoes = {}) {
    const categoria = CATEGORIAS[opcoes.categoria] ? opcoes.categoria : "todas";
    const dificuldade = DIFICULDADES[opcoes.dificuldade] ? opcoes.dificuldade : "todas";
    const quantidade = opcoes.quantidade === undefined ? "todas" : opcoes.quantidade;
    return { categoria, dificuldade, quantidade };
}

/* Verifica se a resposta do usuário para uma pergunta está correta. */
function calcularAcerto(pergunta, resposta) {
    if (!resposta) return false;

    switch (pergunta.tipo) {
        case "radio":
            return Number(resposta.valor) === pergunta.respostaCorreta;

        case "checkbox": {
            const usuario = (resposta.valores || []).map(Number).sort();
            const corretas = (pergunta.respostasCorretas || []).map(Number).sort();
            return usuario.length > 0 && JSON.stringify(usuario) === JSON.stringify(corretas);
        }

        case "number":
            return Number(resposta.valor) === Number(pergunta.anoCorreto);

        default:
            return false;
    }
}

/* Constrói um resumo completo do resultado de uma partida. */
function calcularResultado(perguntas, respostas) {
    const itens = perguntas.map((pergunta, indice) => {
        const resposta = respostas[indice] || null;
        return {
            pergunta,
            indice,
            acertou: calcularAcerto(pergunta, resposta),
            resposta
        };
    });

    const pontos = itens.filter((item) => item.acertou).length;
    const total = perguntas.length;
    const percentual = total ? Math.round((pontos / total) * 100) : 0;

    return { pontos, total, percentual, itens };
}

/* Classifica o desempenho de acordo com o percentual de acertos. */
function classificarDesempenho(pontos, total) {
    const percentual = total ? Math.round((pontos / total) * 100) : 0;

    if (percentual === 100) {
        return { rotulo: "Excelente", classe: "excelente", mensagem: "Perfeito! Você dominou todas as questões." };
    }
    if (percentual >= 80) {
        return { rotulo: "Muito bom", classe: "muito-bom", mensagem: "Mandou muito bem, quase perfeito!" };
    }
    if (percentual >= 60) {
        return { rotulo: "Bom", classe: "bom", mensagem: "Você foi bem, continue praticando!" };
    }
    if (percentual >= 40) {
        return { rotulo: "Em desenvolvimento", classe: "desenvolvimento", mensagem: "Você pode melhorar, revise o conteúdo." };
    }
    return { rotulo: "Precisa estudar", classe: "estudar", mensagem: "Não desanime: estude um pouco mais e tente novamente." };
}

/* Formata uma quantidade de segundos em minutos:segundos (mm:ss). */
function formatarTempo(segundos, mostrarHoras = false) {
    if (segundos === null || segundos === undefined || Number.isNaN(segundos)) {
        return "--:--";
    }
    const total = Math.max(0, Math.floor(segundos));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return mostrarHoras ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/* Exporta para testes em Node quando o arquivo for carregado via require. */
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
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
    };
}