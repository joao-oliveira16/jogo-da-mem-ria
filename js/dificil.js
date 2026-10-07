const tabuleiro = document.getElementById("tabuleiro");
const movimentosEl = document.getElementById("movimentos");
const paresEl = document.getElementById("pares");
const mensagem = document.getElementById("mensagem");
const contagem = document.getElementById("contagem");
const numeroContagem = document.getElementById("numeroContagem");
const modal = document.getElementById("modalPergunta");
const conteudo = document.getElementById("perguntaConteudo");
const modalFinal = document.getElementById("modalFinal");

let dados = [];
let primeira = null;
let segunda = null;
let movimentos = 0;
let pares = 0;
let bloqueado = true;

const LIMITE = 25;

async function iniciar() {
    dados = await fetch("../dados/dificil.json").then(r => r.json());

    const cartas = [...dados, ...dados].sort(() => Math.random() - 0.5);

    tabuleiro.innerHTML = cartas.map(carta => `
        <div class="carta" data-id="${carta.id}">
            <div class="carta-inner">
                <div class="carta-verso"></div>
                <div class="carta-frente">
                    <img src="../${carta.imagem}" alt="${carta.nome}">
                    <span>${carta.nome}</span>
                </div>
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".carta").forEach(carta => {
        carta.onclick = () => virar(carta);
    });

    memorizar();
}

function memorizar() {
    const cartas = document.querySelectorAll(".carta");
    cartas.forEach(c => c.classList.add("virada"));

    contagem.classList.add("ativo");

    let tempo = 3;
    numeroContagem.textContent = tempo;

    const timer = setInterval(() => {
        tempo--;
        numeroContagem.textContent = tempo;

        if (tempo === 0) {
            clearInterval(timer);
            contagem.classList.remove("ativo");
            cartas.forEach(c => c.classList.remove("virada"));
            bloqueado = false;
            mensagem.textContent = "Encontre os pares! Você tem 25 movimentos.";
        }
    }, 1000);
}

function virar(carta) {
    if (bloqueado || carta.classList.contains("encontrada") ||
        carta === primeira) return;

    carta.classList.add("virada");

    if (!primeira) {
        primeira = carta;
        return;
    }

    segunda = carta;
    movimentos++;
    movimentosEl.textContent = movimentos;

    if (movimentos > LIMITE) {
        perder();
        return;
    }

    if (primeira.dataset.id === segunda.dataset.id) {
        acertou();
    } else {
        bloqueado = true;

        setTimeout(() => {
            primeira.classList.remove("virada");
            segunda.classList.remove("virada");
            primeira = segunda = null;
            bloqueado = false;
        }, 800);
    }
}

function acertou() {
    primeira.classList.add("encontrada");
    segunda.classList.add("encontrada");

    const selecao = dados.find(
        item => item.id == primeira.dataset.id
    );

    pares++;
    paresEl.textContent = pares;

    primeira = segunda = null;

    setTimeout(() => pergunta(selecao), 300);
}

function pergunta(selecao) {
    modal.classList.add("ativo");

    conteudo.innerHTML = `
        <img class="pergunta-imagem" src="../${selecao.imagem}">
        <h2>${selecao.nome}</h2>

        <p class="pergunta">
            ${selecao.pergunta}
        </p>

        <div class="opcoes">
            ${selecao.opcoes.map(opcao => `
                <button class="opcao">${opcao}</button>
            `).join("")}
        </div>
    `;

    document.querySelectorAll(".opcao").forEach(botao => {
        botao.onclick = () => responder(botao, selecao);
    });
}

function responder(botao, selecao) {
    const acertou = botao.textContent === selecao.resposta;

    conteudo.innerHTML += `
        <div class="resultado ${acertou ? "correto" : "errado"}">
            ${acertou ? "✅ Resposta correta!" : "❌ Resposta incorreta!"}
            <br>
            Resposta: <strong>${selecao.resposta}</strong>
        </div>

        <div class="curiosidade">
            💡 ${selecao.curiosidade}
        </div>

        <button class="botao" onclick="continuar()">
            Continuar
        </button>
    `;
}

function continuar() {
    modal.classList.remove("ativo");

    if (pares === dados.length) {
        document.getElementById("movimentosFinal").textContent = movimentos;
        modalFinal.classList.add("ativo");
    }
}

function perder() {
    bloqueado = true;
    modal.classList.add("ativo");

    conteudo.innerHTML = `
        <h2>😔 Fim de jogo!</h2>
        <p class="pergunta">
            Você ultrapassou os 25 movimentos.
        </p>
        <button class="botao" onclick="location.reload()">
            🔄 Tentar novamente
        </button>
    `;
}

document.getElementById("novoJogo").onclick = iniciar;
document.getElementById("jogarNovamente").onclick = iniciar;

iniciar();