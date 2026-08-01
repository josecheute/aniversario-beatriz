const dataEvento = new Date("2026-10-03T19:00:00");
const telefoneConfirmacao = "5541999262663";
const tokenAcessoEsperado = "9f4c2d7b8a1e6f3c5b0d2a4e7c9f1b6a";
const nomesFotosGaleria = [
    "foto1.jpg",
    "foto2.jpg",
    "foto3.jpg",
    "foto4.jpg",
    "foto5.jpg",
    "foto6.jpg"
];
const caminhosBaseImagens = ["imagens", "./imagens", "/imagens"];

let fotosGaleria = nomesFotosGaleria.map((nome) => `imagens/${nome}`);
let caminhoImagensAtivo = "imagens";

let indiceFoto = 0;
let intervaloContador = null;
let intervaloGaleria = null;
let cacheFotosGaleria = [];

function obterTokenDaUrl() {
    const params = new URLSearchParams(window.location.search);
    const tokenPorQuery = params.get("token") || params.get("t");

    if (tokenPorQuery) {
        return tokenPorQuery.trim();
    }

    const hash = window.location.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(hash);
    const tokenPorHash = hashParams.get("token") || hashParams.get("t");

    return tokenPorHash ? tokenPorHash.trim() : "";
}

function validarAcessoPorToken() {
    const tokenRecebido = obterTokenDaUrl();
    const tokenValido = tokenRecebido && tokenRecebido === tokenAcessoEsperado;

    if (!tokenValido) {
        document.body.classList.add("acesso-negado");
        return false;
    }

    document.body.classList.remove("acesso-pendente");
    document.body.classList.remove("acesso-negado");
    return true;
}

function testarCarregamentoImagem(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

async function detectarCaminhoImagens() {
    for (const base of caminhosBaseImagens) {
        const carregou = await testarCarregamentoImagem(`${base}/${nomesFotosGaleria[0]}`);

        if (carregou) {
            caminhoImagensAtivo = base;
            fotosGaleria = nomesFotosGaleria.map((nome) => `${base}/${nome}`);
            return;
        }
    }
}

function preloadFotosGaleria() {
    cacheFotosGaleria = fotosGaleria.map((src) => {
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = src;
        return img;
    });
}

function montarMensagemConfirmacao(nomeCompleto) {
    return `Oi, confirmo minha ${nomeCompleto} presença no aniversário de 15 anos da Beatriz Couceiro Cheute dia 03/10/2026.`;
}

function enviarConfirmacaoWhatsapp() {
    const nomeInput = document.getElementById("nomeConvidado");

    if (!nomeInput) {
        return;
    }

    const nomeCompleto = nomeInput.value.trim();

    if (!nomeCompleto) {
        alert("Por favor, informe seu nome completo para confirmar presença.");
        nomeInput.focus();
        return;
    }

    const mensagem = montarMensagemConfirmacao(nomeCompleto);
    const url = `https://wa.me/${telefoneConfirmacao}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

function tentarTelaCheia() {
    const elemento = document.documentElement;

    if (elemento.requestFullscreen) {
        elemento.requestFullscreen().catch(() => {});
        return;
    }

    if (elemento.webkitRequestFullscreen) {
        elemento.webkitRequestFullscreen();
    }
}

function atualizarBotaoSom(estaTocando) {
    const botaoSom = document.getElementById("botaoSom");
    botaoSom.textContent = estaTocando ? "♫" : "▶";
}

function reproduzirMusica() {
    const musica = document.getElementById("musicaFundo");

    musica.volume = 0.45;

    return musica.play()
        .then(() => {
            atualizarBotaoSom(true);
        })
        .catch(() => {
            atualizarBotaoSom(false);
        });
}

function abrirConvite() {
    const abertura = document.getElementById("abertura");
    const convite = document.getElementById("convite");
    const video = document.getElementById("videoAbertura");
    const botaoSom = document.getElementById("botaoSom");

    abertura.style.display = "none";
    convite.style.display = "block";
    botaoSom.style.display = "block";

    document.body.classList.remove("bloqueado");

    if (video) {
        video.pause();
    }

    reproduzirMusica();
    tentarTelaCheia();
    atualizarEstadoSetas();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function rolarConvite(direcao) {
    const deslocamento = Math.round(window.innerHeight * 0.82) * direcao;

    window.scrollBy({
        top: deslocamento,
        behavior: "smooth"
    });
}

function atualizarEstadoSetas() {
    const setas = document.getElementById("setasNavegacao");
    const setaSubir = document.getElementById("setaSubir");
    const setaDescer = document.getElementById("setaDescer");
    const convite = document.getElementById("convite");

    if (!setas || !setaSubir || !setaDescer || !convite) {
        return;
    }

    if (convite.style.display !== "block") {
        setas.hidden = true;
        return;
    }

    setas.hidden = false;

    const noTopo = window.scrollY <= 24;
    const noFim = window.scrollY >= (document.documentElement.scrollHeight - window.innerHeight - 24);

    setaSubir.disabled = noTopo;
    setaDescer.disabled = noFim;
}

function alternarSom() {
    const musica = document.getElementById("musicaFundo");

    if (musica.paused) {
        reproduzirMusica();
        return;
    }

    musica.pause();
    atualizarBotaoSom(false);
}

function atualizarContador() {
    const agora = new Date();
    const diferenca = dataEvento.getTime() - agora.getTime();

    const diasEl = document.getElementById("dias");
    const horasEl = document.getElementById("horas");
    const minutosEl = document.getElementById("minutos");
    const segundosEl = document.getElementById("segundos");

    if (diferenca <= 0) {
        diasEl.textContent = "00";
        horasEl.textContent = "00";
        minutosEl.textContent = "00";
        segundosEl.textContent = "00";
        return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);

    diasEl.textContent = String(dias).padStart(2, "0");
    horasEl.textContent = String(horas).padStart(2, "0");
    minutosEl.textContent = String(minutos).padStart(2, "0");
    segundosEl.textContent = String(segundos).padStart(2, "0");
}

function trocarFotoGaleria() {
    const imagem = document.getElementById("fotoGaleria");

    if (!imagem || fotosGaleria.length === 0) {
        return;
    }

    indiceFoto = (indiceFoto + 1) % fotosGaleria.length;
    imagem.src = fotosGaleria[indiceFoto];
}

function definirFotoInicialGaleria() {
    const imagem = document.getElementById("fotoGaleria");

    if (!imagem || fotosGaleria.length === 0) {
        return;
    }

    indiceFoto = 0;
    imagem.src = fotosGaleria[indiceFoto];
}

function iniciarVideoAbertura() {
    const video = document.getElementById("videoAbertura");

    if (!video) {
        return;
    }

    video.muted = true;
    video.play().catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAbrir = document.getElementById("btnAbrirConvite");
    const botaoSom = document.getElementById("botaoSom");
    const btnConfirmarWhatsapp = document.getElementById("btnConfirmarWhatsapp");
    const nomeConvidado = document.getElementById("nomeConvidado");
    const setaSubir = document.getElementById("setaSubir");
    const setaDescer = document.getElementById("setaDescer");

    if (!validarAcessoPorToken()) {
        return;
    }

    btnAbrir.addEventListener("click", abrirConvite);
    botaoSom.addEventListener("click", alternarSom);
    btnConfirmarWhatsapp.addEventListener("click", enviarConfirmacaoWhatsapp);
    setaSubir.addEventListener("click", () => rolarConvite(-1));
    setaDescer.addEventListener("click", () => rolarConvite(1));

    nomeConvidado.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        enviarConfirmacaoWhatsapp();
    });

    window.addEventListener("scroll", atualizarEstadoSetas, { passive: true });
    window.addEventListener("resize", atualizarEstadoSetas);

    atualizarContador();
    iniciarVideoAbertura();
    atualizarEstadoSetas();

    intervaloContador = setInterval(atualizarContador, 1000);

    detectarCaminhoImagens().then(() => {
        definirFotoInicialGaleria();
        preloadFotosGaleria();

        if (intervaloGaleria) {
            clearInterval(intervaloGaleria);
        }

        intervaloGaleria = setInterval(trocarFotoGaleria, 4000);
    });
});

window.addEventListener("pagehide", () => {
    clearInterval(intervaloContador);
    clearInterval(intervaloGaleria);
});
