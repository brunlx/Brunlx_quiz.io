const Storage = {
    get(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (erro) {
            console.warn("Erro ao ler storage:", erro);
            return null;
        }
    },

    set(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (erro) {
            console.warn("Erro ao salvar storage:", erro);
        }
    },

    remove(chave) {
        try {
            localStorage.removeItem(chave);
        } catch (erro) {
            console.warn("Erro ao remover storage:", erro);
        }
    },

    salvarProgresso(respostas) {
        const dados = {
            respostas,
            timestamp: Date.now()
        };
        this.set(QUIZ_CONFIG.STORAGE_KEYS.PROGRESS, dados);
    },

    carregarProgresso() {
        const dados = this.get(QUIZ_CONFIG.STORAGE_KEYS.PROGRESS);
        if (!dados) return null;

        const diasPassados = (Date.now() - dados.timestamp) / (1000 * 60 * 60 * 24);
        if (diasPassados > QUIZ_CONFIG.EXPIRATION_DAYS) {
            this.limparProgresso();
            return null;
        }

        if (Object.keys(dados.respostas).length === 0) return null;

        return dados.respostas;
    },

    limparProgresso() {
        this.remove(QUIZ_CONFIG.STORAGE_KEYS.PROGRESS);
    },

    salvarRanking(pontos, tempo) {
        const ranking = this.getRanking();

        ranking.push({
            pontos,
            tempo,
            data: new Date().toISOString()
        });

        ranking.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            return this.parseTempo(a.tempo) - this.parseTempo(b.tempo);
        });

        const top10 = ranking.slice(0, QUIZ_CONFIG.MAX_RANKING);
        this.set(QUIZ_CONFIG.STORAGE_KEYS.RANKING, top10);
    },

    getRanking() {
        return this.get(QUIZ_CONFIG.STORAGE_KEYS.RANKING) || [];
    },

    parseTempo(tempoStr) {
        const match = tempoStr.match(/(\d+)m\s*(\d+)s/);
        if (match) {
            return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return Infinity;
    }
};
