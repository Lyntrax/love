(function() {

    window.addEventListener('load', function() {

        const welcomeScreen = document.getElementById('welcomeOverlay');
        const nameElement = document.getElementById('nameLarge');
        const mainWebsite = document.getElementById('website');

        const introTl = gsap.timeline();

        introTl
            .set(nameElement, { opacity: 0, scale: 0.85, y: 30 })
            .to(nameElement, { duration: 1.2, opacity: 1, scale: 1, y: 0, ease: "back.out(1.2)", delay: 0.2 })
            .to(nameElement, { duration: 0.8, scale: 1.02, repeat: 1, yoyo: true, ease: "power1.inOut" })
            .to(welcomeScreen, { duration: 1.2, opacity: 0, scale: 1.05, ease: "power3.inOut", onComplete: function() {
                welcomeScreen.style.display = 'none';
                mainWebsite.style.opacity = '1';
                mainWebsite.style.visibility = 'visible';
                initWebsite();
            }});

        function initWebsite() {

            gsap.registerPlugin(ScrollTrigger, TextPlugin);

            const typingEl = document.getElementById('typingText');
            const roles = ["Frontend Developer", "GSAP Animator", "UI/UX Enthusiast", "AI Explorer"];
            let roleIndex = 0;

            function typeNext() {
                if (!typingEl) return;
                gsap.to(typingEl, {
                    duration: 1.2,
                    text: roles[roleIndex % roles.length],
                    ease: "none",
                    onComplete: function() {
                        gsap.delayedCall(2.2, function() {
                            roleIndex++;
                            typeNext();
                        });
                    }
                });
            }

            typeNext();

            gsap.fromTo(".hero-text", { y: 60, opacity: 0 }, { scrollTrigger: { trigger: "#home", start: "top 80%" }, y: 0, opacity: 1, duration: 1, immediateRender: false });
            gsap.fromTo(".hero-image", { x: 50, opacity: 0 }, { scrollTrigger: { trigger: "#home", start: "top 80%" }, x: 0, opacity: 1, duration: 0.9, immediateRender: false });
            gsap.fromTo(".about-image", { x: -50, opacity: 0 }, { scrollTrigger: { trigger: "#about", start: "top 75%" }, x: 0, opacity: 1, duration: 0.9, immediateRender: false });
            gsap.fromTo(".about-content", { x: 50, opacity: 0 }, { scrollTrigger: { trigger: "#about", start: "top 75%" }, x: 0, opacity: 1, duration: 0.9, immediateRender: false });
            gsap.fromTo("#projects .section-title", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: "#projects", start: "top 80%" }, y: 0, opacity: 1, duration: 0.8, immediateRender: false });
            gsap.fromTo(".project-card", { y: 50, opacity: 0 }, { scrollTrigger: { trigger: "#projects", start: "top 80%" }, y: 0, opacity: 1, stagger: 0.12, duration: 0.8, immediateRender: false });
            gsap.fromTo("#skills .section-title", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: "#skills", start: "top 80%" }, y: 0, opacity: 1, duration: 0.8, immediateRender: false });
            gsap.fromTo(".skill-card", { y: 50, opacity: 0 }, { scrollTrigger: { trigger: "#skills", start: "top 80%" }, y: 0, opacity: 1, stagger: 0.1, duration: 0.8, immediateRender: false });
            gsap.fromTo(".contact-layout", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: "#contact", start: "top 80%" }, y: 0, opacity: 1, duration: 0.8, immediateRender: false });

            const allCards = document.querySelectorAll('.project-card, .skill-card');
            allCards.forEach(function(card) {
                card.addEventListener('mouseenter', function() { gsap.to(card, { duration: 0.3, y: -8, scale: 1.02 }); });
                card.addEventListener('mouseleave', function() { gsap.to(card, { duration: 0.3, y: 0, scale: 1 }); });
            });

            gsap.to('.shape-1', { y: 30, x: 20, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
            gsap.to('.shape-2', { y: -40, x: -30, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });

            document.body.addEventListener('mousemove', function(e) {
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;
                gsap.to('.shape-1', { duration: 1.5, x: (mouseX - 0.5) * 30, y: (mouseY - 0.5) * 20 });
                gsap.to('.shape-2', { duration: 1.5, x: (mouseX - 0.5) * -25, y: (mouseY - 0.5) * 15 });
            });

            const darkBtn = document.getElementById('darkModeBtn');
            const savedTheme = localStorage.getItem('theme');

            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                darkBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }

            darkBtn.addEventListener('click', function() {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                darkBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                gsap.to(darkBtn, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
            });

            const navLinks = document.querySelectorAll('.nav-link');
            const brandLogo = document.getElementById('brandLogo');

            function scrollToSection(sectionId) {
                const target = document.getElementById(sectionId);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }

            navLinks.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    scrollToSection(link.getAttribute('href').substring(1));
                });
            });

            if (brandLogo) {
                brandLogo.addEventListener('click', function() { scrollToSection('home'); });
            }

            const viewWork = document.getElementById('viewProjectsBtn');
            const contactHero = document.getElementById('contactBtnHero');

            if (viewWork) viewWork.addEventListener('click', function() { scrollToSection('projects'); });
            if (contactHero) contactHero.addEventListener('click', function() { scrollToSection('contact'); });

            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const nameInput = document.getElementById('userName');
                    const emailInput = document.getElementById('userEmail');
                    const msg = contactForm.querySelector('textarea');

                    if (!nameInput.value.trim() || !emailInput.value.trim()) {
                        alert('Please fill in your name and email 🙂');
                        gsap.to(contactForm.querySelector('button'), { x: 5, duration: 0.1, yoyo: true, repeat: 3 });
                    } else {
                        alert('Thanks ' + nameInput.value + '! Your message has been sent. I\'ll get back to you soon!');
                        nameInput.value = '';
                        emailInput.value = '';
                        msg.value = '';
                    }
                });
            }

            ScrollTrigger.refresh();
        }

    });

})();