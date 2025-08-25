const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
const mensagem = require('./mensagem');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS)
app.use(express.static('public'));

// Rota principal - servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para enviar boas-vindas
app.post('/send-welcome', async (req, res) => {
    try {
        const { nome, email } = req.body;

        // Validações
        if (!nome || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome e email são obrigatórios'
            });
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Formato de email inválido'
            });
        }

        // Validar nome (mínimo 2 caracteres)
        if (nome.trim().length < 2) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome deve ter pelo menos 2 caracteres'
            });
        }

        console.log(`📧 Enviando boas-vindas para: ${nome} (${email})`);

        // Ler a mensagem do arquivo e substituir a variável {{nome}}
        const assunto = mensagem.assunto;
        const textoPersonalizado = mensagem.texto.replace(/{{nome}}/g, nome.trim());
        const htmlPersonalizado = mensagem.html.replace(/{{nome}}/g, nome.trim());

        // Enviar email via Resend
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: [email.trim()],
            subject: assunto,
            text: textoPersonalizado,
            html: htmlPersonalizado
        });

        if (error) {
            console.error('❌ Erro ao enviar email:', error);
            throw new Error(`Falha no envio: ${error.message}`);
        }

        console.log(`✅ Email enviado com sucesso! ID: ${data.id}`);

        // Resposta de sucesso
        res.json({
            sucesso: true,
            mensagem: `Boas-vindas enviadas para ${nome}! Verifique seu email.`,
            emailId: data.id
        });

    } catch (error) {
        console.error('❌ Erro no servidor:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor ao enviar email'
        });
    }
});

// Rota de status da API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        mensagem: 'Sistema de Boas-Vindas funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada'
    });
});

// Tratamento de erros globais
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
🚀 Servidor iniciado com sucesso!
📧 Sistema de Boas-Vindas
🌐 Acesse: http://localhost:${PORT}
📝 Status: http://localhost:${PORT}/api/status

💡 Pronto para enviar emails de boas-vindas!
    `);
});

module.exports = app;
