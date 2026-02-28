/**
 * Easy ITEL - Script principal
 * Autor: Easy ITEL
 * Versão: 1.0
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initDownloadButtons();
    initWhatsAppButtons();
});

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
    const elements = document.querySelectorAll('.benefit-card, .product-card, .testimonial-card, .stat');
    
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

/**
 * Botões de download FREE
 * IMPORTANTE: Crie um arquivo PDF de exemplo e coloque na pasta assets/pdfs/
 */
function initDownloadButtons() {
    const downloadButtons = document.querySelectorAll('.btn-download-free');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const subject = this.getAttribute('data-subject');
            
            // Simula o download de um PDF
            // IMPORTANTE: Substitua pelo caminho real do seu PDF
            const pdfPath = `pdfs/${subject}/${subject}.pdf`;

            // Abre o livro em uma nova janela
            window.open(pdfPath , '_blank');

            // Cria um link temporário para download
            //const link = document.createElement('a');
            //link.href = pdfPath;

            link.download = `EasyITEL-${subject}-Sample.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Feedback visual
            showNotification(`Download do solucionário FREE de ${subject} iniciado!`, 'success');
        });
    });
}

/**
 * Botões WhatsApp PRO
 * IMPORTANTE: Substitua o número abaixo pelo seu número real
 */
function initWhatsAppButtons() {
    // Configuração do WhatsApp
    const WHATSAPP_NUMBER = '244958794357'; // Substitua pelo seu número com DDD (sem +)
    
    const proButtons = document.querySelectorAll('.btn-whatsapp-pro');
    
    proButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const subject = this.getAttribute('data-subject');
            
            // Mensagem pré-formatada
            const message = `Olá, quero adquirir a versão PRO do solucionário de ${subject}`;
            
            // Codifica a mensagem para URL
            const encodedMessage = encodeURIComponent(message);
            
            // Cria a URL do WhatsApp
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            
            // Abre o WhatsApp em uma nova janela
            window.open(whatsappUrl, '_blank');
            
            // Feedback visual
            showNotification(`Redirecionando para WhatsApp para compra do PRO de ${subject}...`, 'info');
        });
    });
    
    // Botões de contato no rodapé
    const contactButtons = document.querySelectorAll('.footer-section a[href*="wa.me"]');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            window.open(href, '_blank');
        });
    });
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
`;
document.head.appendChild(style);

/**
 * Função para futura integração com pagamento
 * Aqui você pode implementar a integração com Stripe, PayPal, etc.
 */
function futurePaymentIntegration(amount, product) {
    console.log(`Preparando pagamento de R$ ${amount} para o produto: ${product}`);
    showNotification(`Sistema de pagamento online em breve para ${product}!`, 'info');
    
    // Exemplo de integração futura:
    // return fetch('/api/create-payment', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ amount, product })
    // });
}

/**
 * Pré-carregamento de imagens (opcional)
 */
function preloadImages() {
    const images = [
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadImages();

/**
 * Sistema de login futuro (placeholder)
 */
class AuthSystem {
    constructor() {
        this.isLoggedIn = false;
        this.user = null;
    }
    
    login(email, password) {
        // Implementar futuramente
        console.log('Sistema de login será implementado em breve');
        showNotification('Sistema de login em desenvolvimento', 'info');
    }
    
    logout() {
        this.isLoggedIn = false;
        this.user = null;
    }
}

// Inicializa sistema de auth
const auth = new AuthSystem();