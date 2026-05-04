/**
 * MentorX - Script principal
 * Autor: MentorX
 * Versão: 1.0
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initFeaturedAutoScroll();
});

// Alternar Dark/Light Mode
const toggleBtn = document.getElementById('darkModeToggle');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleBtn.innerHTML = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
    // Atualiza cor das estrelas
    stars.forEach(s => s.color = document.body.classList.contains('dark-mode') ? '#fff' : '#000');
    // Atualiza logo
    const logoImg = document.querySelector('.logo img');
    logoImg.src = document.body.classList.contains('dark-mode') ? 'img/logo.png' : 'img/logowhite.png';
});

// Fundo animado com estrelas
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createStars(count = 200) {
    stars = [];
    for(let i=0;i<count;i++){
        stars.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            radius: Math.random()*1.5,
            speed: Math.random()*0.5+0.1,
            color: '#fff'
        });
    }
}

function animateStars(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(star => {
        star.y -= star.speed;
        if(star.y<0) star.y = canvas.height;
        ctx.beginPath();
        ctx.arc(star.x,star.y,star.radius,0,Math.PI*2);
        ctx.fillStyle = star.color;
        ctx.fill();
    });
    requestAnimationFrame(animateStars);
}

// Carousel for sections
const sections = document.querySelectorAll('.section');
sections.forEach(section => {
    const grid = section.querySelector('.content-grid');
    if (grid && grid.classList.contains('all-visible')) return; // Skip carousel for all-visible grids
    const cards = section.querySelectorAll('.content-card');
    if (cards.length > 1) {
        let current = 0;
        cards[current].classList.add('active');
        setInterval(() => {
            cards[current].classList.remove('active');
            current = (current + 1) % cards.length;
            cards[current].classList.add('active');
        }, 4000); // 4 seconds
    }
});

createStars();
animateStars();

/**
 * Menu mobile - Hamburguer
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animação do hamburger
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
    }

    // Fecha o menu ao clicar em um link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

/**
 * Scroll suave para âncoras
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Revelar elementos ao rolar a página
 */
function initScrollReveal() {
    const elements = document.querySelectorAll('.content-card, .section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(element => {
        observer.observe(element);
    });
}

function initFeaturedAutoScroll() {
    const featuredScroll = document.querySelector('.featured-scroll');
    if (!featuredScroll) return;

    let scrollAmount = 0;
    const step = featuredScroll.clientWidth;
    const maxScroll = featuredScroll.scrollWidth - featuredScroll.clientWidth;

    function scrollNext() {
        if (scrollAmount >= maxScroll) {
            featuredScroll.scrollTo({ left: 0, behavior: 'smooth' });
            scrollAmount = 0;
            return;
        }
        scrollAmount = Math.min(scrollAmount + step, maxScroll);
        featuredScroll.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }

    setInterval(scrollNext, 4500);
}

/**
 * Sistema de notificações toast
 */
function showNotification(message, type = 'info') {
    // Remove notificações existentes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Cria a notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getIconForType(type)}"></i>
        <span>${message}</span>
    `;

    // Adiciona estilos
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${getColorForType(type)};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    document.body.appendChild(notification);

    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function getIconForType(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function getColorForType(type) {
    switch(type) {
        case 'success': return '#27ae60';
        case 'error': return '#e74c3c';
        case 'info': return '#3498db';
        default: return '#34495e';
    }
}

/**
 * Sistema de filtragem de cursos (para MentorX_Academy.html)
 */
function initCourseFilters() {
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterDifficulty = document.getElementById('filter-difficulty');
    const filterDuration = document.getElementById('filter-duration');
    const filterDate = document.getElementById('filter-date');
    const coursesGrid = document.getElementById('courses-grid');
    const courseCards = coursesGrid.querySelectorAll('.course-card');

    function filterCourses() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = filterCategory.value;
        const difficulty = filterDifficulty.value;
        const duration = filterDuration.value;
        const dateSort = filterDate.value;

        let filteredCards = Array.from(courseCards);

        // Filtro de texto
        if (searchTerm) {
            filteredCards = filteredCards.filter(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                return title.includes(searchTerm) || desc.includes(searchTerm);
            });
        }

        // Filtros
        if (category) {
            filteredCards = filteredCards.filter(card => card.dataset.category === category);
        }
        if (difficulty) {
            filteredCards = filteredCards.filter(card => card.dataset.difficulty === difficulty);
        }
        if (duration) {
            filteredCards = filteredCards.filter(card => card.dataset.duration === duration);
        }

        // Ordenação por data
        if (dateSort === 'recent') {
            filteredCards.sort((a, b) => new Date(b.querySelector('.date').textContent) - new Date(a.querySelector('.date').textContent));
        } else if (dateSort === 'old') {
            filteredCards.sort((a, b) => new Date(a.querySelector('.date').textContent) - new Date(b.querySelector('.date').textContent));
        }

        // Ocultar todos
        courseCards.forEach(card => card.style.display = 'none');
        // Mostrar filtrados
        filteredCards.forEach(card => card.style.display = 'block');
    }

    // Eventos
    searchInput.addEventListener('input', filterCourses);
    filterCategory.addEventListener('change', filterCourses);
    filterDifficulty.addEventListener('change', filterCourses);
    filterDuration.addEventListener('change', filterCourses);
    filterDate.addEventListener('change', filterCourses);
}

// Inicializar filtros se estiver na página de cursos
if (document.getElementById('courses-grid')) {
    initCourseFilters();
}

/**
 * Adiciona estilos de animação para notificações
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .hamburger span.active:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger span.active:nth-child(2) {
        opacity: 0;
    }

    .hamburger span.active:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    .revealed {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

/**
 * Pré-carregamento de imagens (opcional)
 */
function preloadImages() {
    const images = [
        // Adicione URLs de imagens que serão usadas no futuro
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadImages();

/**
 * Modal de Detalhes do Curso
 */
function initCourseModal() {
    const modal = document.getElementById('course-modal');
    const closeBtn = document.querySelector('.close-modal');
    const buyBtn = document.getElementById('buy-button');
    const courseCards = document.querySelectorAll('.course-card');

    courseCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img').src;
            const title = card.querySelector('h3').textContent;
            const desc = card.querySelector('p').textContent;
            const difficulty = card.querySelector('.difficulty').textContent;
            const duration = card.querySelector('.duration').textContent;
            const date = card.querySelector('.date').textContent;

            document.getElementById('modal-image').src = img;
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-description').textContent = desc;
            document.getElementById('modal-difficulty').textContent = difficulty;
            document.getElementById('modal-duration').textContent = duration;
            document.getElementById('modal-date').textContent = date;

            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    buyBtn.addEventListener('click', () => {
        window.location.href = 'pagamento.html';
    });
}

// Inicializar modal se estiver na página de cursos
if (document.getElementById('course-modal')) {
    initCourseModal();
}