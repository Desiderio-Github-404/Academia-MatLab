// Script para a página de Login/Registro com Firebase
const ADMIN_EMAIL = 'adminmentorx2026@gmail.com';
const ADMIN_PASSWORD = 'mentorx365@2026';
const ADMIN_UID = 'adminmentorx';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se Firebase está carregado
    if (typeof window.firebaseAuth === 'undefined') {
        console.error('Firebase não foi carregado corretamente');
        showError('Erro de configuração. Tente novamente mais tarde.');
        return;
    }

    initAuthToggle();
    initFormValidation();
    initUserTypeSelection();
    initGoogleAuth();
    initAuthStateListener();
});

// Toggle entre Login e Registro
function initAuthToggle() {
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginToggle.addEventListener('click', () => {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    registerToggle.addEventListener('click', () => {
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
}

// Validação de formulários
function initFormValidation() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    // Register Form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', handleRegister);

    // Validação em tempo real para senha de confirmação
    const password = document.getElementById('register-password');
    const confirmPassword = document.getElementById('register-confirm-password');

    confirmPassword.addEventListener('input', () => {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('As senhas não coincidem');
        } else {
            confirmPassword.setCustomValidity('');
        }
    });
}

// Seleção de tipo de usuário
function initUserTypeSelection() {
    const userTypeSelect = document.getElementById('user-type');
    const subjectGroup = document.getElementById('subject-group');
    const gradeGroup = document.getElementById('grade-group');

    userTypeSelect.addEventListener('change', () => {
        if (userTypeSelect.value === 'professor') {
            subjectGroup.style.display = 'block';
            gradeGroup.style.display = 'none';
        } else if (userTypeSelect.value === 'aluno') {
            gradeGroup.style.display = 'block';
            subjectGroup.style.display = 'none';
        } else {
            subjectGroup.style.display = 'none';
            gradeGroup.style.display = 'none';
        }
    });
}

// Inicializar autenticação com Google
function initGoogleAuth() {
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleRegisterBtn = document.getElementById('google-register-btn');

    googleLoginBtn.addEventListener('click', () => handleGoogleAuth('login'));
    googleRegisterBtn.addEventListener('click', () => handleGoogleAuth('register'));
}

// Listener de estado de autenticação
function initAuthStateListener() {
    window.onAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            // Usuário logado
            console.log('Usuário logado:', user);
            redirectUser(user);
        } else {
            // Usuário não logado
            console.log('Usuário não logado');
        }
    });
}

// Manipular login com email/senha
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminData = {
            uid: ADMIN_UID,
            name: 'Admin MentorX',
            email: ADMIN_EMAIL,
            userType: 'admin',
            role: 'admin',
            createdAt: new Date().toISOString(),
            provider: 'local'
        };
        localStorage.setItem(`user_${ADMIN_UID}`, JSON.stringify(adminData));

        showSuccess('Login de admin bem-sucedido! Redirecionando...');
        setTimeout(() => {
            window.location.href = 'mentorx_admin.html';
        }, 1200);
        return;
    }

    try {
        showLoading('Fazendo login...');
        const userCredential = await window.signInWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
        );

        const user = userCredential.user;
        console.log('Login bem-sucedido:', user);

        showSuccess('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => redirectUser(user), 1500);

    } catch (error) {
        console.error('Erro no login:', error);
        handleAuthError(error);
    } finally {
        hideLoading();
    }
}

// Manipular registro com email/senha
async function handleRegister(e) {
    e.preventDefault();

    const formData = {
        firstname: document.getElementById('register-firstname').value,
        lastname: document.getElementById('register-lastname').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        userType: document.getElementById('user-type').value,
        subject: document.getElementById('subject').value,
        grade: document.getElementById('grade').value
    };

    // Validações
    if (formData.password !== document.getElementById('register-confirm-password').value) {
        showError('As senhas não coincidem');
        return;
    }

    if (formData.password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    if (!formData.userType) {
        showError('Selecione o tipo de conta');
        return;
    }

    try {
        showLoading('Criando conta...');

        // Criar usuário no Firebase Auth
        const userCredential = await window.createUserWithEmailAndPassword(
            window.firebaseAuth,
            formData.email,
            formData.password
        );

        const user = userCredential.user;

        // Atualizar perfil do usuário
        const displayName = `${formData.firstname} ${formData.lastname}`;
        await window.updateProfile(user, {
            displayName: displayName
        });

        // Salvar dados adicionais no localStorage (ou Firestore se preferir)
        const userData = {
            uid: user.uid,
            name: displayName,
            email: formData.email,
            userType: formData.userType,
            subject: formData.subject || null,
            grade: formData.grade || null,
            createdAt: new Date().toISOString(),
            provider: 'email'
        };

        localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

        console.log('Registro bem-sucedido:', user);
        showSuccess('Conta criada com sucesso! Redirecionando...');

        setTimeout(() => redirectUser(user), 1500);

    } catch (error) {
        console.error('Erro no registro:', error);
        handleAuthError(error);
    } finally {
        hideLoading();
    }
}

// Manipular autenticação com Google
async function handleGoogleAuth(mode) {
    try {
        showLoading('Conectando com Google...');

        const result = await window.signInWithPopup(window.firebaseAuth, window.googleProvider);
        const user = result.user;
        const credential = window.GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        console.log('Google auth bem-sucedido:', user);

        // Verificar se é um usuário novo ou existente
        const isNewUser = result._tokenResponse.isNewUser;

        if (isNewUser) {
            // Novo usuário - coletar informações adicionais
            const userData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                userType: null, // Será definido depois
                subject: null,
                grade: null,
                createdAt: new Date().toISOString(),
                provider: 'google',
                photoURL: user.photoURL
            };

            localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

            if (mode === 'register') {
                // Se veio do registro, pedir para completar perfil
                showInfo('Complete seu perfil para continuar');
                setTimeout(() => {
                    window.location.href = 'profile-setup.html'; // Página para completar perfil
                }, 1500);
            } else {
                // Login - redirecionar para dashboard
                showSuccess('Login com Google realizado! Redirecionando...');
                setTimeout(() => redirectUser(user), 1500);
            }
        } else {
            // Usuário existente
            showSuccess('Login com Google realizado! Redirecionando...');
            setTimeout(() => redirectUser(user), 1500);
        }

    } catch (error) {
        console.error('Erro no Google auth:', error);
        handleAuthError(error);
    } finally {
        hideLoading();
    }
}

// Redirecionar usuário baseado no tipo
function redirectUser(user) {
    // Buscar dados do usuário
    const userData = JSON.parse(localStorage.getItem(`user_${user.uid}`) || '{}');

    if (userData.userType === 'admin') {
        window.location.href = 'mentorx_admin.html';
    } else if (userData.userType === 'professor') {
        window.location.href = 'mentorx_admin.html';
    } else if (userData.userType === 'aluno') {
        window.location.href = 'dashboard.html'; // Página do aluno (a ser criada)
    } else {
        // Tipo não definido - redirecionar para completar perfil
        window.location.href = 'profile-setup.html';
    }
}

// Manipular erros de autenticação
function handleAuthError(error) {
    hideLoading();

    switch (error.code) {
        case 'auth/user-not-found':
            showError('Usuário não encontrado. Verifique o email digitado.');
            break;
        case 'auth/wrong-password':
            showError('Senha incorreta. Tente novamente.');
            break;
        case 'auth/email-already-in-use':
            showError('Este email já está cadastrado.');
            break;
        case 'auth/weak-password':
            showError('A senha deve ter pelo menos 6 caracteres.');
            break;
        case 'auth/invalid-email':
            showError('Email inválido.');
            break;
        case 'auth/too-many-requests':
            showError('Muitas tentativas. Tente novamente mais tarde.');
            break;
        case 'auth/popup-closed-by-user':
            showInfo('Login com Google cancelado.');
            break;
        default:
            showError('Erro na autenticação. Tente novamente.');
            console.error('Erro não tratado:', error);
    }
}

// Funções utilitárias
function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showInfo(message) {
    showMessage(message, 'info');
}

function showLoading(message) {
    showMessage(message, 'loading');
}

function hideLoading() {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

function showMessage(message, type) {
    // Remover mensagens anteriores
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.innerHTML = type === 'loading' ?
        `<i class="fas fa-spinner fa-spin"></i> ${message}` :
        message;

    // Adicionar ao container
    const container = document.querySelector('.auth-container');
    container.insertBefore(messageDiv, container.firstChild);

    // Auto-remover para mensagens que não são loading
    if (type !== 'loading') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Logout function (pode ser chamada de outras páginas)
async function logout() {
    try {
        await window.signOut(window.firebaseAuth);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro no logout:', error);
        // Forçar logout mesmo com erro
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Tornar logout global
window.logout = logout;