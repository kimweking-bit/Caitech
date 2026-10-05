document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-disable-on-submit]').forEach((form) => {
        form.addEventListener('submit', () => {
            const button = form.querySelector('button[type="submit"]');
            if (!button || button.disabled) return;
            button.disabled = true;
            button.dataset.originalText = button.textContent.trim();
            button.textContent = 'Please wait…';
        });
    });

    const statusPanel = document.querySelector('[data-payment-status]');
    if (!statusPanel) return;

    const heading = document.querySelector('#payment-heading');
    const message = document.querySelector('#payment-message');
    const statusLabel = document.querySelector('#payment-status-label');
    const successLink = document.querySelector('#go-to-courses');
    const pollingNote = document.querySelector('#polling-note');
    const statusUrl = statusPanel.dataset.pollUrl;
    const states = {
        paid: ['Payment successful.', 'Your payment is confirmed and your course access is ready.'],
        failed: ['Payment failed.', 'The payment could not be confirmed. Your courses remain locked. Start a new checkout from your cart.'],
        cancelled: ['Payment cancelled.', 'The payment was cancelled. You have not been enrolled.'],
        expired: ['Order expired.', 'This order expired before payment confirmation. Please create a new order.'],
    };

    const poll = async () => {
        try {
            const response = await fetch(statusUrl, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error('Could not read payment status.');
            const order = await response.json();
            statusLabel.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            if (states[order.status]) {
                [heading.textContent, message.textContent] = states[order.status];
                successLink.hidden = order.status !== 'paid';
                pollingNote.hidden = true;
                statusPanel.dataset.paymentState = order.status;
                return;
            }
        } catch (error) {
            pollingNote.textContent = 'We are still checking with the payment provider. This page will keep your order status current.';
        }
        window.setTimeout(poll, 3000);
    };

    if (statusLabel && ['Pending', 'Draft'].includes(statusLabel.textContent.trim())) {
        window.setTimeout(poll, 1500);
    }
});