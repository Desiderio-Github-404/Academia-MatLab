// Script para a página MentorX Admin
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    initVideoUpload();
    initVideoManagement();
    initCategoriesManagement();
    initAnalytics();
    loadVideos();
    loadCategories();
});

// Navegação do painel admin
function initAdminPanel() {
    const navBtns = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and sections
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked button and corresponding section
            btn.classList.add('active');
            const sectionId = btn.dataset.section + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Sistema de upload de vídeos
function initVideoUpload() {
    const uploadArea = document.getElementById('upload-area');
    const videoFile = document.getElementById('video-file');
    const uploadForm = document.getElementById('upload-form');
    const videoPreview = document.getElementById('video-preview');
    const metadataForm = document.getElementById('video-metadata-form');
    const cancelBtn = document.getElementById('cancel-upload');

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    uploadArea.addEventListener('click', () => {
        videoFile.click();
    });

    videoFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('video/')) {
            showNotification('Por favor, selecione um arquivo de vídeo válido.', 'error');
            return;
        }

        if (file.size > 500 * 1024 * 1024) { // 500MB
            showNotification('O arquivo é muito grande. Máximo: 500MB.', 'error');
            return;
        }

        // Preview do vídeo
        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        uploadArea.style.display = 'none';
        uploadForm.style.display = 'block';

        // Preencher metadados automaticamente se possível
        document.getElementById('video-title').value = file.name.replace(/\.[^/.]+$/, '');
        document.getElementById('video-duration').value = Math.round(file.size / (1024 * 1024)); // Aproximação
    }

    cancelBtn.addEventListener('click', () => {
        resetUpload();
    });

    metadataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveVideo();
    });
}

function resetUpload() {
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('upload-form').style.display = 'none';
    document.getElementById('video-file').value = '';
    document.getElementById('video-preview').src = '';
    document.getElementById('video-metadata-form').reset();
}

// Salvar vídeo
function saveVideo() {
    const title = document.getElementById('video-title').value;
    const category = document.getElementById('video-category').value;
    const description = document.getElementById('video-description').value;
    const duration = document.getElementById('video-duration').value;
    const level = document.getElementById('video-level').value;
    const tags = document.getElementById('video-tags').value;

    if (!title || !category) {
        showNotification('Título e categoria são obrigatórios.', 'error');
        return;
    }

    const videoData = {
        id: Date.now(),
        title,
        category,
        description,
        duration: parseInt(duration) || 0,
        level,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        uploadDate: new Date().toISOString(),
        views: 0,
        likes: 0,
        fileName: document.getElementById('video-file').files[0]?.name || 'video.mp4'
    };

    // Salvar no localStorage (em produção, seria uma API)
    const videos = getStoredVideos();
    videos.push(videoData);
    localStorage.setItem('mentorx_videos', JSON.stringify(videos));

    showNotification('Vídeo salvo com sucesso!', 'success');
    resetUpload();
    loadVideos();
}

// Gerenciamento de vídeos
function initVideoManagement() {
    const searchInput = document.getElementById('video-search');
    const searchBtn = document.getElementById('video-search-btn');
    const categoryFilter = document.getElementById('video-category-filter');
    const addVideoBtn = document.getElementById('add-video-btn');

    searchBtn.addEventListener('click', filterVideos);
    searchInput.addEventListener('input', filterVideos);
    categoryFilter.addEventListener('change', filterVideos);

    addVideoBtn.addEventListener('click', () => {
        document.querySelector('[data-section="upload"]').click();
    });
}

function loadVideos() {
    const videos = getStoredVideos();
    const videosGrid = document.getElementById('videos-grid');

    videosGrid.innerHTML = '';

    if (videos.length === 0) {
        videosGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video"></i>
                <h3>Nenhum vídeo encontrado</h3>
                <p>Comece fazendo upload do seu primeiro vídeo!</p>
            </div>
        `;
        return;
    }

    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });

    updateAnalytics(videos);
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
        <div class="video-thumbnail">
            <i class="fas fa-play-circle"></i>
            <span class="video-duration">${video.duration}min</span>
        </div>
        <div class="video-info">
            <h4>${video.title}</h4>
            <p class="video-category">${getCategoryName(video.category)}</p>
            <div class="video-stats">
                <span><i class="fas fa-eye"></i> ${video.views}</span>
                <span><i class="fas fa-heart"></i> ${video.likes}</span>
            </div>
        </div>
        <div class="video-actions">
            <button class="btn-icon" onclick="editVideo(${video.id})" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="deleteVideo(${video.id})" title="Excluir">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn-icon" onclick="previewVideo(${video.id})" title="Visualizar">
                <i class="fas fa-eye"></i>
            </button>
        </div>
    `;

    return card;
}

function filterVideos() {
    const searchTerm = document.getElementById('video-search').value.toLowerCase();
    const categoryFilter = document.getElementById('video-category-filter').value;
    const videos = getStoredVideos();
    const videoCards = document.querySelectorAll('.video-card');

    videos.forEach((video, index) => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm) ||
                            video.description.toLowerCase().includes(searchTerm) ||
                            video.tags.some(tag => tag.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;

        const card = videoCards[index];
        if (card) {
            card.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
        }
    });
}

// Editar vídeo
function editVideo(videoId) {
    const videos = getStoredVideos();
    const video = videos.find(v => v.id === videoId);

    if (!video) return;

    document.getElementById('edit-title').value = video.title;
    document.getElementById('edit-category').value = video.category;
    document.getElementById('edit-description').value = video.description;

    document.getElementById('edit-modal').style.display = 'block';

    const editForm = document.getElementById('edit-video-form');
    editForm.onsubmit = (e) => {
        e.preventDefault();
        saveVideoEdit(videoId);
    };
}

function saveVideoEdit(videoId) {
    const videos = getStoredVideos();
    const videoIndex = videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) return;

    videos[videoIndex].title = document.getElementById('edit-title').value;
    videos[videoIndex].category = document.getElementById('edit-category').value;
    videos[videoIndex].description = document.getElementById('edit-description').value;

    localStorage.setItem('mentorx_videos', JSON.stringify(videos));
    showNotification('Vídeo atualizado com sucesso!', 'success');
    closeEditModal();
    loadVideos();
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Excluir vídeo
function deleteVideo(videoId) {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    const videos = getStoredVideos();
    const filteredVideos = videos.filter(v => v.id !== videoId);

    localStorage.setItem('mentorx_videos', JSON.stringify(filteredVideos));
    showNotification('Vídeo excluído com sucesso!', 'success');
    loadVideos();
}

// Preview vídeo
function previewVideo(videoId) {
    const videos = getStoredVideos();
    const video = videos.find(v => v.id === videoId);

    if (!video) return;

    // Simulação de preview - em produção, seria o vídeo real
    showNotification(`Preview: ${video.title}`, 'info');
}

// Gerenciamento de categorias
function initCategoriesManagement() {
    const addCategoryBtn = document.getElementById('add-category-btn');

    addCategoryBtn.addEventListener('click', () => {
        const categoryName = prompt('Nome da nova categoria:');
        if (categoryName && categoryName.trim()) {
            addCategory(categoryName.trim());
        }
    });
}

function loadCategories() {
    const categories = getStoredCategories();
    const categoriesGrid = document.getElementById('categories-grid');

    categoriesGrid.innerHTML = '';

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <h4>${category.name}</h4>
            <p>${category.videoCount || 0} vídeos</p>
            <div class="category-actions">
                <button class="btn-icon" onclick="editCategory('${category.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteCategory('${category.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });
}

function addCategory(name) {
    const categories = getStoredCategories();
    const newCategory = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        videoCount: 0
    };

    categories.push(newCategory);
    localStorage.setItem('mentorx_categories', JSON.stringify(categories));
    loadCategories();
    showNotification('Categoria adicionada!', 'success');
}

// Analytics
function initAnalytics() {
    // Inicializar gráficos se necessário
}

function updateAnalytics(videos) {
    document.getElementById('total-videos').textContent = videos.length;
    document.getElementById('total-views').textContent = videos.reduce((sum, v) => sum + v.views, 0);
    document.getElementById('engagement-rate').textContent = '85%'; // Simulado
}

// Utilitários
function getStoredVideos() {
    return JSON.parse(localStorage.getItem('mentorx_videos') || '[]');
}

function getStoredCategories() {
    const defaultCategories = [
        { id: 'matematica', name: 'Matemática', videoCount: 0 },
        { id: 'fisica', name: 'Física', videoCount: 0 },
        { id: 'quimica', name: 'Química', videoCount: 0 },
        { id: 'programacao', name: 'Programação', videoCount: 0 }
    ];

    return JSON.parse(localStorage.getItem('mentorx_categories') || JSON.stringify(defaultCategories));
}

function getCategoryName(categoryId) {
    const categories = getStoredCategories();
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('edit-modal');
    if (e.target === modal) {
        closeEditModal();
    }
});