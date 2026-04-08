// Script para a página do curso
document.addEventListener('DOMContentLoaded', function() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    const videoIframe = document.getElementById('video-iframe');
    const videoTitle = document.getElementById('video-title');
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const likeCount = document.getElementById('like-count');
    const dislikeCount = document.getElementById('dislike-count');
    const commentForm = document.querySelector('.comment-form');
    const commentTextarea = commentForm.querySelector('textarea');
    const commentBtn = commentForm.querySelector('.comment-btn');
    const commentsList = document.querySelector('.comments-list');

    let likes = parseInt(likeCount.textContent);
    let dislikes = parseInt(dislikeCount.textContent);
    let userLiked = false;
    let userDisliked = false;

    // Trocar vídeo na playlist
    playlistItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover classe active de todos
            playlistItems.forEach(i => i.classList.remove('active'));
            // Adicionar classe active ao clicado
            item.classList.add('active');

            const videoId = item.dataset.video;
            const title = item.dataset.title;

            // Atualizar vídeo
            videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
            videoTitle.textContent = title;
        });
    });

    // Sistema de likes/dislikes
    likeBtn.addEventListener('click', () => {
        if (userLiked) {
            // Remover like
            likes--;
            userLiked = false;
            likeBtn.classList.remove('liked');
        } else {
            // Adicionar like
            likes++;
            userLiked = true;
            likeBtn.classList.add('liked');

            // Remover dislike se existir
            if (userDisliked) {
                dislikes--;
                userDisliked = false;
                dislikeBtn.classList.remove('disliked');
            }
        }
        likeCount.textContent = likes;
        dislikeCount.textContent = dislikes;
    });

    dislikeBtn.addEventListener('click', () => {
        if (userDisliked) {
            // Remover dislike
            dislikes--;
            userDisliked = false;
            dislikeBtn.classList.remove('disliked');
        } else {
            // Adicionar dislike
            dislikes++;
            userDisliked = true;
            dislikeBtn.classList.add('disliked');

            // Remover like se existir
            if (userLiked) {
                likes--;
                userLiked = false;
                likeBtn.classList.remove('liked');
            }
        }
        likeCount.textContent = likes;
        dislikeCount.textContent = dislikes;
    });

    // Sistema de comentários
    commentBtn.addEventListener('click', () => {
        const commentText = commentTextarea.value.trim();
        if (commentText) {
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
                <img src="img/logo.png" alt="User" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">Você</span>
                        <span class="comment-date">Agora</span>
                    </div>
                    <p class="comment-text">${commentText}</p>
                    <div class="comment-actions">
                        <button class="comment-action"><i class="fas fa-thumbs-up"></i> 0</button>
                        <button class="comment-action"><i class="fas fa-thumbs-down"></i> 0</button>
                        <button class="comment-action">Responder</button>
                    </div>
                </div>
            `;

            commentsList.insertBefore(newComment, commentsList.firstChild);
            commentTextarea.value = '';

            // Adicionar funcionalidade aos novos botões de comentário
            const newCommentActions = newComment.querySelectorAll('.comment-action');
            newCommentActions.forEach(action => {
                action.addEventListener('click', () => {
                    // Aqui você pode implementar respostas, likes em comentários, etc.
                    console.log('Comentário interagido');
                });
            });
        }
    });

    // Compartilhar
    document.getElementById('share-btn').addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copiado para a área de transferência!', 'success');
        });
    });

    // Salvar
    document.getElementById('save-btn').addEventListener('click', () => {
        showNotification('Vídeo salvo na sua lista!', 'success');
    });
});