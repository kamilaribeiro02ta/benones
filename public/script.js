// Elementos do DOM
const form = document.getElementById('welcomeForm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const enviarBtn = document.getElementById('enviarBtn');
const mensagensDiv = document.getElementById('mensagens');

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    form.addEventListener('submit', enviarFormulario);
});

// Função principal - enviar formulário
async function enviarFormulario(event) {
    event.preventDefault();

    const dados = {
        nome: nomeInput.value,
        email: emailInput.value
    };

    enviarBtn.disabled = true;

    try {
        const response = await fetch('/send-welcome', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (resultado.sucesso) {
            mostrarMensagem(resultado.mensagem, 'sucesso');
            form.reset();
        } else {
            mostrarMensagem(resultado.mensagem, 'erro');
        }

    } catch (error) {
        mostrarMensagem('Erro de conexão com o servidor', 'erro');
    } finally {
        enviarBtn.disabled = false;
    }
}

function mostrarMensagem(texto, tipo) {
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.textContent = texto;
    mensagensDiv.appendChild(mensagemDiv);

    // Remover mensagem após 3 segundos
    setTimeout(() => {
        if (mensagemDiv.parentNode) {
            mensagemDiv.remove();
        }
    }, 3000);
}
