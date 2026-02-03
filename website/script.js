// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
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

    // Form submission handler - connects to Mailchimp via backend
    const signupForms = document.querySelectorAll('.signup-form');

    signupForms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            const email = emailInput.value;

            if (email) {
                // Disable button and show loading state
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Joining...';

                try {
                    const response = await fetch('https://compass-api-ilpt.onrender.com/api/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: email })
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert(data.message || 'Thanks for joining the waitlist!');
                        emailInput.value = '';
                    } else {
                        alert(data.message || 'Something went wrong. Please try again.');
                    }
                } catch (error) {
                    console.error('Subscribe error:', error);
                    alert('Failed to connect. Please try again later.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});
