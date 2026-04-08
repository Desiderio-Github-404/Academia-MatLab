// Script para a página MentorX Reels
document.addEventListener('DOMContentLoaded', function() {
    const videoFeed = document.getElementById('video-feed');
    const createReelBtn = document.getElementById('create-reel-btn');
    const createReelModal = document.getElementById('create-reel-modal');
    const closeCreateReel = document.querySelector('.close-create-reel');
    const reelForm = document.getElementById('reel-form');
    const uploadVideo = document.getElementById('upload-video');
    const videoPreview = document.getElementById('video-preview');
    const reelsFilter = document.getElementById('reels-filter');

    let currentVideo = null;
    let isPlaying = false;

    // Vídeos de exemplo
    const sampleReels = [
        {
            id: 1,
            title: 'Introdução à Física Quântica',
            author: 'Prof. Maria Silva',
            likes: 1247,
            comments: 89,
            shares: 34,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            subject: 'Física'
        },
        {
            id: 2,
            title: 'Equações Diferenciais em 60s',
            author: 'Dr. João Santos',
            likes: 892,
            comments: 45,
            shares: 12,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            subject: 'Matemática'
        },
        {
            id: 3,
            title: 'Experiência de Eletrólise',
            author: 'Lab Químico',
            likes: 2156,
            comments: 156,
            shares: 78,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            subject: 'Química'
        }
    ];

    // Renderizar reels
    function renderReels(reels = sampleReels) {
        videoFeed.innerHTML = '';

        reels.forEach(reel => {
            const reelElement = document.createElement('div');
            reelElement.className = 'reel-item';
            reelElement.innerHTML = `
                <div class="reel-video-container">
                    <iframe class="reel-video" src="${reel.videoUrl}" frameborder="0" allowfullscreen></iframe>
                    <div class="reel-overlay">
                        <div class="reel-info">
                            <h4>${reel.title}</h4>
                            <p>${reel.author}</p>
                        </div>
                        <div class="reel-actions">
                            <button class="reel-action-btn" onclick="likeReel(${reel.id})">
                                <i class="fas fa-heart"></i>
                                <span>${reel.likes}</span>
                            </button>
                            <button class="reel-action-btn" onclick="commentReel(${reel.id})">
                                <i class="fas fa-comment"></i>
                                <span>${reel.comments}</span>
                            </button>
                            <button class="reel-action-btn" onclick="shareReel(${reel.id})">
                                <i class="fas fa-share"></i>
                                <span>${reel.shares}</span>
                            </button>
                            <button class="reel-action-btn" onclick="saveReel(${reel.id})">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            videoFeed.appendChild(reelElement);
        });
    }

    // Interações dos reels
    window.likeReel = function(id) {
        const btn = event.target.closest('.reel-action-btn');
        const icon = btn.querySelector('i');
        const count = btn.querySelector('span');

        if (icon.classList.contains('fas')) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            count.textContent = parseInt(count.textContent) - 1;
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            count.textContent = parseInt(count.textContent) + 1;
        }

        showNotification('Reel curtido!', 'success');
    };

    window.commentReel = function(id) {
        showNotification('Comentários em breve!', 'info');
    };

    window.shareReel = function(id) {
        showNotification('Link copiado para compartilhar!', 'info');
    };

    window.saveReel = function(id) {
        const btn = event.target.closest('.reel-action-btn');
        const icon = btn.querySelector('i');

        if (icon.classList.contains('fas')) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            showNotification('Removido dos salvos', 'info');
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            showNotification('Salvo nos favoritos!', 'success');
        }
    };

    // Filtro de reels
    reelsFilter.addEventListener('change', () => {
        const filter = reelsFilter.value;
        let filteredReels = sampleReels;

        if (filter !== 'all') {
            filteredReels = sampleReels.filter(reel => reel.subject.toLowerCase() === filter);
        }

        renderReels(filteredReels);
    });

    // Criar reel
    createReelBtn.addEventListener('click', () => {
        createReelModal.style.display = 'block';
    });

    closeCreateReel.addEventListener('click', () => {
        createReelModal.style.display = 'none';
        resetCreateForm();
    });

    window.addEventListener('click', (e) => {
        if (e.target === createReelModal) {
            createReelModal.style.display = 'none';
            resetCreateForm();
        }
    });

    // Upload de vídeo
    uploadVideo.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            videoPreview.src = url;
            videoPreview.style.display = 'block';
        }
    });

    // Formulário de criação
    reelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(reelForm);
        const title = formData.get('reel-title');
        const subject = formData.get('reel-subject');
        const description = formData.get('reel-description');

        // Simulação de upload
        showNotification('Reel criado com sucesso!', 'success');
        createReelModal.style.display = 'none';
        resetCreateForm();

        // Adicionar à lista (simulação)
        const newReel = {
            id: Date.now(),
            title: title,
            author: 'Você',
            likes: 0,
            comments: 0,
            shares: 0,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            subject: subject
        };

        sampleReels.unshift(newReel);
        renderReels();
    });

    function resetCreateForm() {
        reelForm.reset();
        videoPreview.style.display = 'none';
        videoPreview.src = '';
    }

    // Inicializar
    renderReels();
});