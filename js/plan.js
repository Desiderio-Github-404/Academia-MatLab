// Script para a página MentorX Plan
document.addEventListener('DOMContentLoaded', function() {
    const assessmentForm = document.getElementById('assessment-form');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    const steps = document.querySelectorAll('.assessment-step');
    const planResult = document.getElementById('plan-result');
    const planContent = document.getElementById('plan-content');
    const planActions = document.getElementById('plan-actions');
    const pricingCards = document.querySelectorAll('.pricing-card');

    let currentStep = 0;
    let assessmentData = {};

    // Navegação do assessment
    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle('active', index === step);
        });

        prevBtn.style.display = step === 0 ? 'none' : 'block';
        nextBtn.style.display = step === steps.length - 1 ? 'none' : 'block';
        submitBtn.style.display = step === steps.length - 1 ? 'block' : 'none';

        const progress = ((step + 1) / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        showStep(currentStep);
    });

    function validateStep(step) {
        const currentStepEl = steps[step];
        const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let valid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                valid = false;
            } else {
                input.classList.remove('error');
            }
        });

        return valid;
    }

    // Coletar dados do assessment
    assessmentForm.addEventListener('input', (e) => {
        const input = e.target;
        const name = input.name;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        if (name) {
            assessmentData[name] = value;
        }
    });

    // Submeter assessment
    submitBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            generatePlan();
        }
    });

    function generatePlan() {
        // Simulação de geração de plano baseado nas respostas
        const plan = {
            title: 'Plano de Estudos Personalizado',
            duration: '6 meses',
            focus: assessmentData.level || 'Intermédio',
            subjects: assessmentData.subjects ? assessmentData.subjects.split(',') : ['Matemática', 'Física'],
            goals: assessmentData.goals || 'Preparação para exames',
            schedule: '4 horas por dia, 5 dias por semana'
        };

        displayPlan(plan);
    }

    function displayPlan(plan) {
        assessmentForm.style.display = 'none';
        planResult.style.display = 'block';

        planContent.innerHTML = `
            <div class="plan-header">
                <h2>${plan.title}</h2>
                <div class="plan-meta">
                    <span><i class="fas fa-clock"></i> ${plan.duration}</span>
                    <span><i class="fas fa-target"></i> ${plan.focus}</span>
                </div>
            </div>

            <div class="plan-details">
                <div class="plan-section">
                    <h3><i class="fas fa-book"></i> Disciplinas Focadas</h3>
                    <ul>
                        ${plan.subjects.map(subject => `<li>${subject.trim()}</li>`).join('')}
                    </ul>
                </div>

                <div class="plan-section">
                    <h3><i class="fas fa-bullseye"></i> Objetivos</h3>
                    <p>${plan.goals}</p>
                </div>

                <div class="plan-section">
                    <h3><i class="fas fa-calendar-alt"></i> Cronograma Sugerido</h3>
                    <p>${plan.schedule}</p>
                </div>
            </div>
        `;

        planActions.innerHTML = `
            <button class="btn btn-primary" onclick="startPlan()">
                <i class="fas fa-play"></i> Começar Plano
            </button>
            <button class="btn btn-secondary" onclick="editPlan()">
                <i class="fas fa-edit"></i> Editar Plano
            </button>
            <button class="btn btn-outline" onclick="sharePlan()">
                <i class="fas fa-share"></i> Partilhar
            </button>
        `;
    }

    window.startPlan = function() {
        showNotification('Plano iniciado! Boa sorte nos estudos!', 'success');
        setTimeout(() => {
            window.location.href = 'mentorx_ai.html';
        }, 1500);
    };

    window.editPlan = function() {
        planResult.style.display = 'none';
        assessmentForm.style.display = 'block';
        currentStep = 0;
        showStep(currentStep);
    };

    window.sharePlan = function() {
        showNotification('Link do plano copiado para a área de transferência!', 'info');
    };

    // Pricing cards
    pricingCards.forEach(card => {
        card.addEventListener('click', () => {
            const plan = card.dataset.plan;
            showNotification(`Selecionado plano ${plan}!`, 'success');
            setTimeout(() => {
                window.location.href = 'pagamento.html';
            }, 1000);
        });
    });

    // Inicializar
    showStep(currentStep);
});