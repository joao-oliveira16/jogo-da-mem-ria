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


let selecoes = [];
let cartas = [];
let primeiraCarta = null;
let segundaCarta = null;
let bloqueado = false;
let movimentos = 0;
let paresEncontrados = 0;


/* BUSCAR DADOS DO JSON */

async function carregarDados() {

    try {

        const resposta = await fetch("dados/selecoes.json");
        selecoes = await resposta.json();
        iniciarJogo();

    } catch (erro) {

        console.error("Erro ao carregar o JSON:", erro);

        tabuleiro.innerHTML = `
            <p>
                Não foi possível carregar os dados do jogo.
            </p>
        `;
    }
}


/* INICIAR JOGO */

function iniciarJogo() {

    movimentos = 0;
    paresEncontrados = 0;
    primeiraCarta = null;
    segundaCarta = null;
    bloqueado = false;

    movimentosElemento.textContent = movimentos;
    paresElemento.textContent = paresEncontrados;
    modalFinal.classList.remove("ativo");
    tabuleiro.innerHTML = "";

    /* Cria duas cartas para cada seleção */

    cartas = [];

    selecoes.forEach(selecao => {

        cartas.push(selecao);
        cartas.push(selecao);
    });


    /* Embaralha as cartas */

    cartas.sort(() => Math.random() - 0.5);


    /* Cria as cartas na tela */

    cartas.forEach((selecao, index) => {

        const carta = document.createElement("div");
        carta.classList.add("carta");
        carta.dataset.id = selecao.id;
        carta.innerHTML = `

            <div class="carta-inner">

                <div class="carta-verso">
                    
                </div>

                <div class="carta-frente">

                    <img
                        src="${selecao.imagem}"
                        alt="${selecao.nome}"
                    >

                    <span>
                        ${selecao.nome}
                    </span>
                </div>
            </div>
        `;

        carta.addEventListener("click", () => virarCarta(carta));
        tabuleiro.appendChild(carta);

    });
}


/* VIRAR CARTA */

function virarCarta(carta) {

    if (bloqueado) return;
    if (carta === primeiraCarta) return;
    if (carta.classList.contains("encontrada")) return;
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


/* VERIFICAR PAR */

function verificarPar() {

    const mesmoId =
        primeiraCarta.dataset.id === segundaCarta.dataset.id;

    if (mesmoId) {

        encontrouPar();

    } else {

        errouPar();
    }
}


/* ACERTOU */

function encontrouPar() {

    primeiraCarta.classList.add("encontrada");
    segundaCarta.classList.add("encontrada");

    const id = Number(primeiraCarta.dataset.id);
    const selecao = selecoes.find(item => item.id === id);

    paresEncontrados++;
    paresElemento.textContent = paresEncontrados;
    primeiraCarta = null;
    segundaCarta = null;


    /* Abre a pergunta depois de um pequeno intervalo */

    setTimeout(() => {

        mostrarPergunta(selecao);
    }, 500);
}


/* ERROU */

function errouPar() {

    bloqueado = true;

    setTimeout(() => {

        primeiraCarta.classList.remove("virada");
        segundaCarta.classList.remove("virada");
        primeiraCarta = null;
        segundaCarta = null;
        bloqueado = false;
    }, 900);
}


/* MOSTRAR PERGUNTA */

function mostrarPergunta(selecao) {

    modalPergunta.classList.add("ativo");

    perguntaConteudo.innerHTML = `

        <img
            class="pergunta-imagem"
            src="${selecao.imagem}"
            alt="${selecao.nome}"
        >

        <h2>
            🇺🇳 ${selecao.nome}
        </h2>

        <p class="pergunta">
            ${selecao.pergunta}
        </p>

        <div class="opcoes">

            ${selecao.opcoes.map(opcao => `

                <button
                    class="opcao"
                    data-resposta="${opcao}"
                >
                    ${opcao}
                </button>

            `).join("")}
        </div>
    `;


    const botoes = document.querySelectorAll(".opcao");


    botoes.forEach(botao => {

        botao.addEventListener("click", () => {

            verificarResposta(
                botao.dataset.resposta,
                selecao
            );
        });
    });
}


/* VERIFICAR RESPOSTA DO QUIZ */

function verificarResposta(resposta, selecao) {

    const acertou = resposta === selecao.resposta;
    const botoes = document.querySelectorAll(".opcao");

    botoes.forEach(botao => {

        botao.disabled = true;

        if (botao.dataset.resposta === selecao.resposta) {

            botao.style.background = "#198754";
            botao.style.color = "white";
        }
    });


    if (acertou) {

        perguntaConteudo.innerHTML += `

            <div class="resultado correto">

                ✅ Resposta correta!
            </div>

            <div class="curiosidade">

                💡 <strong>Curiosidade:</strong><br>
                ${selecao.curiosidade}
            </div>
        `;

    } else {

        perguntaConteudo.innerHTML += `

            <div class="resultado errado">

                ❌ Resposta incorreta.<br>
                A resposta correta é:
                <strong>${selecao.resposta}</strong>
            </div>

            <div class="curiosidade">

                💡 <strong>Curiosidade:</strong><br>
                ${selecao.curiosidade}
            </div>
        `;
    }


    /* Botão para continuar */

    const botaoContinuar = document.createElement("button");

    botaoContinuar.classList.add("botao");
    botaoContinuar.textContent = "Continuar";

    botaoContinuar.addEventListener("click", () => {
        modalPergunta.classList.remove("ativo");
        verificarFim();
    });
    perguntaConteudo.appendChild(botaoContinuar);

}


/* VERIFICAR FIM DO JOGO */

function verificarFim() {
    if (paresEncontrados === selecoes.length) {
        setTimeout(() => {

            movimentosFinal.textContent = movimentos;
            modalFinal.classList.add("ativo");
        }, 400);
    }
}


/* FECHAR MODAL */

fecharModal.addEventListener("click", () => {

    modalPergunta.classList.remove("ativo");
    verificarFim();
});


/* NOVO JOGO */

novoJogo.addEventListener("click", () => {
    iniciarJogo();
});


jogarNovamente.addEventListener("click", () => {
    iniciarJogo();
});


/* COMEÇAR */

carregarDados();