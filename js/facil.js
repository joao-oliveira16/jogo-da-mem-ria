const tabuleiro = document.getElementById("tabuleiro");
const movimentosElemento = document.getElementById("movimentos");
const paresElemento = document.getElementById("pares");
const modalPergunta = document.getElementById("modalPergunta");
const perguntaConteudo = document.getElementById("perguntaConteudo");
const fecharModal = document.getElementById("fecharModal");
const modalFinal = document.getElementById("modalFinal");
const movimentosFinal = document.getElementById("movimentosFinal");
const novoJogo = document.getElementById("novoJogo");
const jogarNovamente = document.getElementById("jogarNovamente");

let selecoes = [], primeiraCarta = null, segundaCarta = null;
let movimentos = 0, paresEncontrados = 0, bloqueado = false;

async function carregarDados() {
    try {
        const resposta = await fetch("dados/selecoes.json");
        selecoes = await resposta.json();
        iniciarJogo();
    } catch (erro) {
        console.error("Erro ao carregar o JSON:", erro);
        tabuleiro.innerHTML = "<p>Não foi possível carregar os dados do jogo.</p>";
    }
}

function iniciarJogo() {
    movimentos = 0;
    paresEncontrados = 0;
    primeiraCarta = segundaCarta = null;
    bloqueado = false;

    movimentosElemento.textContent = 0;
    paresElemento.textContent = 0;
    modalFinal.classList.remove("ativo");
    tabuleiro.innerHTML = "";

    const cartas = [...selecoes, ...selecoes]
        .sort(() => Math.random() - 0.5);

    cartas.forEach(selecao => {
        const carta = document.createElement("div");

        carta.className = "carta";
        carta.dataset.id = selecao.id;

        carta.innerHTML = `
            <div class="carta-inner">
                <div class="carta-verso"></div>
                <div class="carta-frente">
                    <img src="${selecao.imagem}" alt="${selecao.nome}">
                    <span>${selecao.nome}</span>
                </div>
            </div>
        `;

        carta.onclick = () => virarCarta(carta);
        tabuleiro.appendChild(carta);
    });
}

function virarCarta(carta) {
    if (
        bloqueado ||
        carta === primeiraCarta ||
        carta.classList.contains("encontrada")
    ) return;

    carta.classList.add("virada");

    if (!primeiraCarta) {
        primeiraCarta = carta;
        return;
    }

    segundaCarta = carta;
    movimentos++;
    movimentosElemento.textContent = movimentos;
    verificarPar();
}

function verificarPar() {
    if (primeiraCarta.dataset.id === segundaCarta.dataset.id) {
        encontrouPar();
    } else {
        bloqueado = true;

        setTimeout(() => {
            primeiraCarta.classList.remove("virada");
            segundaCarta.classList.remove("virada");
            primeiraCarta = segundaCarta = null;
            bloqueado = false;
        }, 900);
    }
}

function encontrouPar() {
    primeiraCarta.classList.add("encontrada");
    segundaCarta.classList.add("encontrada");

    const selecao = selecoes.find(
        item => item.id == primeiraCarta.dataset.id
    );

    paresEncontrados++;
    paresElemento.textContent = paresEncontrados;
    primeiraCarta = segundaCarta = null;

    setTimeout(() => mostrarPergunta(selecao), 500);
}

function mostrarPergunta(selecao) {
    modalPergunta.classList.add("ativo");

    perguntaConteudo.innerHTML = `
        <img class="pergunta-imagem" src="${selecao.imagem}">
        <h2>🇺🇳 ${selecao.nome}</h2>
        <p class="pergunta">${selecao.pergunta}</p>

        <div class="opcoes">
            ${selecao.opcoes.map(opcao => `
                <button class="opcao" data-resposta="${opcao}">
                    ${opcao}
                </button>
            `).join("")}
        </div>
    `;

    document.querySelectorAll(".opcao").forEach(botao => {
        botao.onclick = () =>
            verificarResposta(botao.dataset.resposta, selecao);
    });
}

function verificarResposta(resposta, selecao) {
    const acertou = resposta === selecao.resposta;

    document.querySelectorAll(".opcao").forEach(botao => {
        botao.disabled = true;

        if (botao.dataset.resposta === selecao.resposta) {
            botao.style.background = "#198754";
            botao.style.color = "white";
        }
    });

    perguntaConteudo.innerHTML += `
        <div class="resultado ${acertou ? "correto" : "errado"}">
            ${acertou ? "✅ Resposta correta!" :
            `❌ Resposta incorreta.<br>
            A resposta correta é: <strong>${selecao.resposta}</strong>`}
        </div>

        <div class="curiosidade">
            💡 <strong>Curiosidade:</strong><br>
            ${selecao.curiosidade}
        </div>
    `;

    const continuar = document.createElement("button");
    continuar.className = "botao";
    continuar.textContent = "Continuar";
    continuar.onclick = () => {
        modalPergunta.classList.remove("ativo");
        verificarFim();
    };

    perguntaConteudo.appendChild(continuar);
}

function verificarFim() {
    if (paresEncontrados === selecoes.length) {
        setTimeout(() => {
            movimentosFinal.textContent = movimentos;
            modalFinal.classList.add("ativo");
        }, 400);
    }
}

fecharModal.onclick = () => {
    modalPergunta.classList.remove("ativo");
    verificarFim();
};

novoJogo.onclick = iniciarJogo;
jogarNovamente.onclick = iniciarJogo;

carregarDados();