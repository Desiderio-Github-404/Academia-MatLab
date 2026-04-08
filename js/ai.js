// Script para a página MentorX AI
document.addEventListener('DOMContentLoaded', function() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Simulação de funcionalidades das ferramentas
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('Funcionalidade em desenvolvimento!', 'info');
        });
    });

    // Chat interativo simulado
    const responses = [
        "Olá! Sou o MentorX AI. Como posso ajudar você hoje?",
        "Entendi sua dúvida. Deixe-me explicar de forma clara...",
        "Essa é uma excelente pergunta! Vamos analisar juntos...",
        "Baseado no que você disse, recomendo o seguinte...",
        "Que bom que você está estudando! Continue assim!",
        "Essa é uma questão comum. Muitos alunos têm essa dúvida..."
    ];

    sendBtn.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            // Adicionar mensagem do usuário
            addMessage(message, 'user');
            chatInput.value = '';

            // Simular resposta da IA
            setTimeout(() => {
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'ai');
            }, 1000 + Math.random() * 2000);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? '' : ''}`;

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Planos de preços
    const pricingBtns = document.querySelectorAll('.pricing-btn');
    pricingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('Redirecionando para checkout...', 'info');
            setTimeout(() => {
                window.location.href = 'pagamento.html';
            }, 1000);
        });
    });
});