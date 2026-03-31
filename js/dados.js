const QUIZ_CONFIG = {
    STORAGE_KEYS: {
        PROGRESS: "quiz_tech_progresso",
        RANKING: "quiz_tech_ranking"
    },
    EXPIRATION_DAYS: 7,
    MAX_RANKING: 10,
    PAGINA_INICIAL: "Pg_inicial.html"
};

const PERGUNTAS = [
    {
        id: 1,
        tipo: "radio",
        texto: "Qual o SO Mais Utilizado Para Pentest?",
        opcoes: ["Debian Linux", "Kali Linux", "Arch Linux", "Windows 11"],
        respostaCorreta: 1,
        explicacao: "Kali Linux e uma distribuicao baseada em Debian, criada especificamente para testes de penetracao e auditoria de seguranca, com centenas de ferramentas pre-instaladas."
    },
    {
        id: 2,
        tipo: "radio",
        texto: "Qual Uma Das Principais Ferramentas Usadas Para Mapeamento de Portas em Rede?",
        opcoes: ["Nmap", "Medusa", "Metasploit", "Hydra"],
        respostaCorreta: 0,
        explicacao: "Nmap (Network Mapper) e a ferramenta padrao da industria para descoberta de rede e auditoria de seguranca, especializada em mapeamento de portas."
    },
    {
        id: 3,
        tipo: "radio",
        texto: "Quantos Caracteres Existem no Hexadecimal?",
        opcoes: ["8 Caracteres", "16 Caracteres", "6 Caracteres", "32 Caracteres"],
        respostaCorreta: 1,
        explicacao: "O sistema hexadecimal utiliza 16 simbolos: os digitos 0-9 e as letras A-F, totalizando 16 caracteres."
    },
    {
        id: 4,
        tipo: "checkbox",
        texto: "Quais Dessas Opcoes Abaixo Sao Relacionadas a Banco de Dados?",
        multipla: true,
        opcoes: ["Oracle DB", "C#", "C++", "MySQL"],
        respostasCorretas: [0, 3],
        explicacao: "Oracle DB e MySQL sao sistemas de gerenciamento de banco de dados (SGBD). C# e C++ sao linguagens de programacao de proposito geral."
    },
    {
        id: 5,
        tipo: "radio",
        texto: "Qual Foi a Tecnologia Principal Utilizada Para Criar a Estrutura Deste Site?",
        opcoes: ["Python", "C++", "HTML", "Java"],
        respostaCorreta: 2,
        explicacao: "HTML (HyperText Markup Language) e a linguagem de marcacao usada para estruturar o conteudo de paginas web."
    },
    {
        id: 6,
        tipo: "radio",
        texto: "Qual o SO Mais Utilizado No Mundo?",
        opcoes: ["Android", "iOS", "Windows", "Unix"],
        respostaCorreta: 0,
        explicacao: "Android e o sistema operacional mais utilizado no mundo, presente em bilhoes de dispositivos moveis globalmente."
    },
    {
        id: 7,
        tipo: "radio",
        texto: "O Hardware de Armazenamento Mais Veloz e o:",
        opcoes: ["Disquete", "DVD", "HDD", "SSD"],
        respostaCorreta: 3,
        explicacao: "SSD (Solid State Drive) utiliza memoria flash sem partes mecanicas, sendo significativamente mais rapido que HDDs, DVDs e disquetes."
    },
    {
        id: 8,
        tipo: "radio",
        texto: "Qual o Hardware Representado Na Imagem?",
        imagem: "../img/radeon-gpu.webp",
        imagemAlt: "Placa de video Radeon",
        opcoes: ["Placa De Video", "Placa-Mae", "Fonte", "Teclado"],
        respostaCorreta: 0,
        explicacao: "A imagem mostra uma placa de video (GPU), componente responsavel pelo processamento grafico e tambem utilizado em mineracao de criptomoedas."
    },
    {
        id: 9,
        tipo: "radio",
        texto: "Qual Das Ferramentas Abaixo e Usada Para Brute Force?",
        opcoes: ["Msfvenom", "Hydra", "Aircrack-ng", "Wireshark"],
        respostaCorreta: 1,
        explicacao: "Hydra e uma ferramenta de teste de forca bruta usada para atacar servicos de autenticacao como SSH, FTP, HTTP e outros."
    },
    {
        id: 10,
        tipo: "radio",
        texto: "Qual o Principal Hardware Usado Para Mineracao De Criptomoedas?",
        opcoes: ["Processador", "Placa De Video", "Fonte", "ASICs"],
        respostaCorreta: 3,
        explicacao: "ASICs são o hardware principal para mineracao de criptomoedas devido a sua alta eficiência energetica e alto hashrate, sendo desenhado expecificamente para a finalidade de trabalhar com algoritmos de mineração como o SHA-256 do Bitcoin."
    },
    {
        id: 11,
        tipo: "radio",
        texto: "Qual a Unica Linguagem Nativa Dos Computadores?",
        opcoes: ["Binario", "Hexadecimal", "Decimal", "Portugol"],
        respostaCorreta: 0,
        explicacao: "Computadores processam informacoes em binario (0s e 1s), que e a unica linguagem que o hardware entende diretamente."
    },
    {
        id: 12,
        tipo: "radio",
        texto: "Qual a Camada Mais Funda Da Internet?",
        opcoes: ["Surface Web", "Deep Web", "Dark Web", "Nao ha camadas"],
        respostaCorreta: 2,
        explicacao: "A Dark Web e a camada mais profunda e restrita da internet, acessivel apenas atraves de softwares especificos como o Tor."
    },
    {
        id: 13,
        tipo: "number",
        texto: "Em Que Ano Foi Criada a Internet?",
        anoCorreto: 1969,
        explicacao: "A ARPANET, precursora da internet, teve sua primeira mensagem enviada em 29 de outubro de 1969, entre a UCLA e o Stanford Research Institute."
    },
    {
        id: 14,
        tipo: "radio",
        texto: "Qual Hardware Faz a Leitura De Todo o Algoritmo?",
        opcoes: ["Placa de Rede", "Placa de Video", "Processador", "Memoria RAM"],
        respostaCorreta: 2,
        explicacao: "O processador (CPU) e o componente responsavel por executar instrucoes e processar todos os algoritmos e programas do computador."
    },
    {
        id: 15,
        tipo: "radio",
        texto: "O Codigo a Seguir Esta Correto?",
        codigo: 'hydra -l admin -P senhas.txt 192.168.1.100 http-post-form "/login.php:user=^USER^&pass=^PASS^:Login Failed"',
        opcoes: ["Sim", "Nao"],
        respostaCorreta: 0,
        explicacao: "O comando esta correto. Usa -l para usuario unico, -P para lista de senhas, e o formato http-post-form com os placeholders ^USER^ e ^PASS^."
    }
];
