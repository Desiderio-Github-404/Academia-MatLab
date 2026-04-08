// Script para a página MentorX Community
document.addEventListener('DOMContentLoaded', function() {
    const forumBtns = document.querySelectorAll('.forum-btn');
    const groupBtns = document.querySelectorAll('.group-btn');
    const qaSearch = document.getElementById('qa-search');
    const searchBtn = document.querySelector('.qa-search button');
    const qaBtns = document.querySelectorAll('.qa-btn');

    // Fóruns
    forumBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('Entrando no fórum...', 'info');
        });
    });

    // Grupos de estudo
    groupBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('Solicitação enviada! Aguarde aprovação.', 'success');
        });
    });

    // Busca de perguntas
    searchBtn.addEventListener('click', () => {
        const query = qaSearch.value.trim();
        if (query) {
            showNotification(`Buscando por "${query}"...`, 'info');
        }
    });

    qaSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Ações de Q&A
    qaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.textContent.includes('Fazer')) {
                showNotification('Redirecionando para formulário de pergunta...', 'info');
            } else {
                showNotification('Ver todas as perguntas...', 'info');
            }
        });
    });

    // Interação com comentários (simulado)
    const commentActions = document.querySelectorAll('.comment-action');
    commentActions.forEach(action => {
        action.addEventListener('click', () => {
            const actionType = action.textContent.trim();
            if (actionType.includes('👍')) {
                const currentCount = parseInt(action.textContent.split(' ')[1]) || 0;
                action.innerHTML = `<i class="fas fa-thumbs-up"></i> ${currentCount + 1}`;
                showNotification('Like adicionado!', 'success');
            } else if (actionType.includes('👎')) {
                showNotification('Dislike registrado', 'info');
            } else {
                showNotification('Função em desenvolvimento', 'info');
            }
        });
    });
});