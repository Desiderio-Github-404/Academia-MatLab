// Script para a página de pagamento
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentForm = document.getElementById('payment-form');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');

    // Selecionar método de pagamento
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');

            const selectedMethod = method.dataset.method;
            // Aqui você pode ajustar os campos do formulário baseado no método
            if (selectedMethod === 'multicaixa') {
                cardNumberInput.placeholder = 'Número de referência';
                expiryInput.style.display = 'none';
                cvvInput.style.display = 'none';
            } else {
                cardNumberInput.placeholder = '1234 5678 9012 3456';
                expiryInput.style.display = 'block';
                cvvInput.style.display = 'block';
            }
        });
    });

    // Formatação automática do número do cartão
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Formatação da data de expiração
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Limitação do CVV
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });

    // Submissão do formulário
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Simulação de processamento de pagamento
        const payBtn = document.querySelector('.pay-btn');
        payBtn.textContent = 'Processando...';
        payBtn.disabled = true;

        // Simular delay de processamento
        setTimeout(() => {
            // Redirecionar para a página do curso após "pagamento"
            window.location.href = 'mentorxacademycurso.html';
        }, 2000);
    });
});