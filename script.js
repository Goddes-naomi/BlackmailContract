document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('application-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const responseMsg = document.getElementById('response-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous messages
        responseMsg.className = 'hidden';
        responseMsg.textContent = '';

        // Show loading state
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');

        // Collect data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert checkbox string 'on' to boolean true
        data.consent = data.consent === 'on';

        try {
            // Send data to backend
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle UI based on response
            responseMsg.classList.remove('hidden');
            if (response.ok && result.success) {
                responseMsg.textContent = result.message || 'Contract officially signed and securely submitted.';
                responseMsg.classList.add('success-msg');
                form.reset(); // Clear form
                
                // Hide form to show only success message
                form.style.display = 'none';
            } else {
                responseMsg.textContent = result.message || 'Error processing contract. Please try again.';
                responseMsg.classList.add('error-msg');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            responseMsg.classList.remove('hidden');
            responseMsg.classList.add('error-msg');
            responseMsg.textContent = 'Server connection error. Ensure your connection is secure and try again.';
        } finally {
            // Restore button state (unless form is hidden)
            if (form.style.display !== 'none') {
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                loader.classList.add('hidden');
            }
        }
    });
});
