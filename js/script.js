let selecoes = [];

const grid = document.querySelector("#memory-grid");
const movesElement = document.querySelector("#moves");
const pairsElement = document.querySelector("#pairs");
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart");

let cartas = [];
let primeiraCarta = null;
let segundaCarta = null;
let bloqueado = false;

let movimentos = 0;
let paresEncontrados = 0;


// Carrega os dados do arquivo JSON
async function carregarDados() {

    try {

        const resposta = await fetch("./data/selecoes.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o JSON.");
        }

        selecoes = await resposta.json();

        pairsElement.textContent =
            `0 / ${selecoes.length}`;

        criarCartas();

    } catch (erro) {

        console.error(erro);

        statusElement.textContent =
            "Erro ao carregar os dados do jogo.";
    }
}


// Embaralha as cartas
function embaralhar(array) {

    return array.sort(() => Math.random() - 0.5);
}


// Cria as cartas
function criarCartas() {

    const cartasDuplicadas = [
        ...selecoes,
        ...selecoes
    ];

    cartas = embaralhar(cartasDuplicadas);

    grid.innerHTML = "";

    cartas.forEach((selecao, index) => {

        const carta = document.createElement("button");

        carta.classList.add("card");

        carta.dataset.id = selecao.id;

        carta.setAttribute(
            "aria-label",
            `Carta ${index + 1}`
        );

        carta.innerHTML = `
            <div class="card-inner">

                <div class="card-face card-back"></div>

                <div class="card-face card-front">

                    <div
                        class="crest"
                        style="--crest-color: ${selecao.cor}"
                    >
                        ${selecao.bandeira}
                    </div>

                    <span class="country">
                        ${selecao.pais}
                    </span>

                </div>

            </div>
        `;

        carta.addEventListener(
            "click",
            () => virarCarta(carta)
        );

        grid.appendChild(carta);
    });
}


// Vira uma carta
function virarCarta(carta) {

    if (bloqueado) return;

    if (carta === primeiraCarta) return;

    if (carta.classList.contains("is-matched")) return;

    carta.classList.add("is-flipped");

    if (!primeiraCarta) {

        primeiraCarta = carta;

        statusElement.textContent =
            "Escolha a segunda carta.";

        return;
    }

    segundaCarta = carta;

    movimentos++;

    atualizarPlacar();

    verificarPar();
}


// Verifica se é um par
function verificarPar() {

    const primeiroId =
        primeiraCarta.dataset.id;

    const segundoId =
        segundaCarta.dataset.id;

    if (primeiroId === segundoId) {

        primeiraCarta.classList.add("is-matched");
        segundaCarta.classList.add("is-matched");

        primeiraCarta.disabled = true;
        segundaCarta.disabled = true;

        paresEncontrados++;

        atualizarPlacar();

        statusElement.textContent =
            "Par encontrado! ⚽";

        resetarEscolha();

        verificarFim();

    } else {

        bloqueado = true;

        statusElement.textContent =
            "Não foi dessa vez...";

        setTimeout(() => {

            primeiraCarta.classList.remove(
                "is-flipped"
            );

            segundaCarta.classList.remove(
                "is-flipped"
            );

            resetarEscolha();

            bloqueado = false;

            statusElement.textContent =
                "Tente novamente!";

        }, 800);
    }
}


// Reseta a seleção
function resetarEscolha() {

    primeiraCarta = null;
    segundaCarta = null;
}


// Atualiza o placar
function atualizarPlacar() {

    movesElement.textContent =
        movimentos;

    pairsElement.textContent =
        `${paresEncontrados} / ${selecoes.length}`;
}


// Verifica se o jogador ganhou
function verificarFim() {

    if (paresEncontrados === selecoes.length) {

        statusElement.textContent =
            `Parabéns! Você terminou em ${movimentos} movimentos! 🏆`;
    }
}


// Reinicia o jogo
function reiniciarJogo() {

    movimentos = 0;
    paresEncontrados = 0;

    primeiraCarta = null;
    segundaCarta = null;

    bloqueado = false;

    atualizarPlacar();

    statusElement.textContent =
        "Boa sorte! ⚽";

    criarCartas();
}


restartButton.addEventListener(
    "click",
    reiniciarJogo
);


// Primeiro carrega o JSON
carregarDados();
