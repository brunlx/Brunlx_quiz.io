const Timer = {
    inicio: null,
    intervalo: null,

    iniciar() {
        this.inicio = Date.now();
        this.intervalo = setInterval(() => {
            const decorrido = Math.floor((Date.now() - this.inicio) / 1000);
            const min = Math.floor(decorrido / 60);
            const seg = decorrido % 60;
            document.title = `Quiz - ${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
        }, 1000);
    },

    parar() {
        clearInterval(this.intervalo);
        const decorrido = Math.floor((Date.now() - this.inicio) / 1000);
        const min = Math.floor(decorrido / 60);
        const seg = decorrido % 60;
        return `${min}m ${seg}s`;
    },

    resetar() {
        this.parar();
        this.inicio = null;
        this.intervalo = null;
        document.title = "Quiz de Tecnologia";
    }
};
