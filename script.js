(function() {
  window.addEventListener('load', function() {
    const welcomeScreen = document.getElementById('welcomeOverlay');
    const nameElement = document.getElementById('overlayName');
    const mainWebsite = document.getElementById('portfolioWebsite');

    const introTl = gsap.timeline();
    introTl
      .set(nameElement, { opacity: 0, scale: 0.85, y: 30 })
      .to(nameElement, {
        duration: 1.2,
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "back.out(1.2)",
        delay: 0.2
      })
      .to(nameElement, {
        duration: 0.8,
        scale: 1.02,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut"
      })
      .to(welcomeScreen, {
        duration: 1.2,
        opacity: 0,
        scale: 1.05,
        ease: "power3.inOut",
        onComplete: () => {
          welcomeScreen.style.display = 'none';
          mainWebsite.style.opacity = '1';
          mainWebsite.style.visibility = 'visible';
          initWebsite();
        }
      });

    function initWebsite() {
      gsap.registerPlugin(ScrollTrigger, TextPlugin);

      const typingEl = document.getElementById('typingText');
      const roles = ["Full Stack Developer", "GSAP Animator", "UI/UX Enthusiast", "AI Practitioner"];
      let roleIndex = 0;
      function typeNext() {
        if (!typingEl) return;
        gsap.to(typingEl, {
          duration: 1.2,
          text: roles[roleIndex % roles.length],
          ease: "none",
          onComplete: () => {
            gsap.delayedCall(2.2, () => {
              roleIndex++;
              typeNext();
            });
          }
        });
      }
      typeNext();

      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => {
        gsap.fromTo(".hero-text", 
          { y: 60, opacity: 0 },
          { scrollTrigger: { trigger: "#home", start: "top 80%" }, y: 0, opacity: 1, duration: 1, immediateRender: false }
        );
        gsap.fromTo(".hero-image", 
          { x: 50, opacity: 0 },
          { scrollTrigger: { trigger: "#home", start: "top 80%" }, x: 0, opacity: 1, duration: 0.9, immediateRender: false }
        );
        gsap.fromTo(".about-image", 
          { x: -50, opacity: 0 },
          { scrollTrigger: { trigger: "#about", start: "top 75%" }, x: 0, opacity: 1, duration: 0.9, immediateRender: false }
        );
        gsap.fromTo(".about-content", 
          { x: 50, opacity: 0 },
          { scrollTrigger: { trigger: "#about", start: "top 75%" }, x: 0, opacity: 1, duration: 0.9, immediateRender: false }
        );
      });
      mm.add("(max-width: 768px)", () => {
        gsap.fromTo(".hero-text", 
          { y: 60, opacity: 0 },
          { scrollTrigger: { trigger: "#home", start: "top 80%" }, y: 0, opacity: 1, duration: 1, immediateRender: false }
        );
        gsap.fromTo(".hero-image", 
          { y: 40, opacity: 0 },
          { scrollTrigger: { trigger: "#home", start: "top 80%" }, y: 0, opacity: 1, duration: 0.9, immediateRender: false }
        );
        gsap.fromTo(".about-image", 
          { y: 40, opacity: 0 },
          { scrollTrigger: { trigger: "#about", start: "top 75%" }, y: 0, opacity: 1, duration: 0.9, immediateRender: false }
        );
        gsap.fromTo(".about-content", 
          { y: 40, opacity: 0 },
          { scrollTrigger: { trigger: "#about", start: "top 75%" }, y: 0, opacity: 1, duration: 0.9, immediateRender: false }
        );
      });

      const commonFromTo = [
        { target: "#projects .section-title", y: 40 },
        { target: ".project-showcase", y: 50 },
        { target: "#skills .section-title", y: 40 },
        { target: ".contact-layout", y: 40 }
      ];
      commonFromTo.forEach(item => {
        gsap.fromTo(item.target, 
          { y: item.y, opacity: 0 },
          { scrollTrigger: { trigger: item.target, start: "top 80%" }, y: 0, opacity: 1, duration: 0.8, immediateRender: false }
        );
      });
      gsap.fromTo(".skill-card", 
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: "#skills", start: "top 80%" }, y: 0, opacity: 1, stagger: 0.1, duration: 0.8, immediateRender: false }
      );

      const skillCards = document.querySelectorAll('.skill-card');
      skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => gsap.to(card, { duration: 0.3, y: -8, scale: 1.02 }));
        card.addEventListener('mouseleave', () => gsap.to(card, { duration: 0.3, y: 0, scale: 1 }));
      });

      gsap.to('.shape-1', { y: 30, x: 20, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to('.shape-2', { y: -40, x: -30, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });

      document.body.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        gsap.to('.shape-1', { duration: 1.5, x: (mouseX - 0.5) * 30, y: (mouseY - 0.5) * 20 });
        gsap.to('.shape-2', { duration: 1.5, x: (mouseX - 0.5) * -25, y: (mouseY - 0.5) * 15 });
      });

      const toggleBtn = document.getElementById('darkModeBtn');
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
      }
      toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        document.body.classList.toggle('theme-dark');
        document.body.classList.toggle('theme-light');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        toggleBtn.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        toggleBtn.style.transform = 'scale(0.9)';
        setTimeout(() => { toggleBtn.style.transform = ''; }, 150);
      });

      function scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToSection(link.getAttribute('href').substring(1));
        });
      });
      document.getElementById('viewProjectsBtn')?.addEventListener('click', () => scrollToSection('projects'));
      document.getElementById('contactBtnHero')?.addEventListener('click', () => scrollToSection('contact'));

      const contactForm = document.getElementById('contactForm');
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = document.getElementById('userName');
          const emailInput = document.getElementById('userEmail');
          const msg = contactForm.querySelector('textarea');
          if (!nameInput.value.trim() || !emailInput.value.trim()) {
            alert('Please fill in your name and email');
            gsap.to(contactForm.querySelector('button'), { x: 5, duration: 0.1, yoyo: true, repeat: 3 });
          } else {
            alert(`Thanks ${nameInput.value}! Your message has been sent. Wait for the reply :)`);
            nameInput.value = '';
            emailInput.value = '';
            msg.value = '';
          }
        });
      }

      const imageElement = document.getElementById('projectImage');
      if (imageElement) {
        const imageList = [
          "https://cdn.dribbble.com/userupload/40648175/file/original-fd16a47b3f2fde295ecefb93fe2d450d.jpg?resize=1024x768&vertical=center",   
          "https://cdn.dribbble.com/userupload/46082757/file/ef4057e32be1a2da06854ada6d19bf10.png?resize=1024x768&vertical=center", 
          "https://cdn.dribbble.com/userupload/3401680/file/original-bad49c4647cfb5fc1a78c33abb30722e.png?resize=1024x768&vertical=center",  
          "https://cdn.dribbble.com/userupload/3567140/file/original-04c3a4bc82997c2f22517917865db3b7.png?resize=1024x768&vertical=center",  
          "https://cdn.dribbble.com/userupload/3510796/file/original-5a637ba8e19029ee34c69eff0e3f707e.png?resize=1024x768&vertical=center",
          "https://cdn.dribbble.com/userupload/23089487/file/original-d207a34e6496d793f80d1064fb90d17f.png?resize=752x564&vertical=center", 
          "https://cdn.dribbble.com/userupload/16078593/file/original-d2feef9666643b782d4f3fd11241961f.png?resize=1024x768&vertical=center",  
          "https://cdn.dribbble.com/userupload/3401635/file/original-1e7c1b7590642927df9bbbb0de8e871c.png?resize=1024x768&vertical=center", 
          "https://cdn.dribbble.com/userupload/45704907/file/5941b498961658e219412e8d25f6c1e7.png?resize=1024x778&vertical=center",
          "https://cdn.dribbble.com/userupload/36637545/file/original-f7558b5de6d27547fd14c6f25e977081.jpg?resize=752x564&vertical=center"
        ];
        let currentIndex = 0;
        let isAnimating = false;
        function changeImage() {
          if (isAnimating) return;
          isAnimating = true;
          currentIndex = (currentIndex + 1) % imageList.length;
          const newSrc = imageList[currentIndex];
          gsap.to(imageElement, {
            duration: 0.3,
            opacity: 0,
            scale: 0.98,
            onComplete: () => {
              imageElement.src = newSrc;
              gsap.to(imageElement, {
                duration: 0.4,
                opacity: 1,
                scale: 1,
                ease: "back.out(0.6)",
                onComplete: () => { isAnimating = false; }
              });
            }
          });
        }
        imageElement.addEventListener('click', changeImage);
        gsap.fromTo(imageElement, 
          { scale: 0.95, opacity: 0.8 },
          { duration: 0.8, scale: 1, opacity: 1, ease: "elastic.out(1, 0.5)" }
        );
      }
      ScrollTrigger.refresh();
    }
  });
})();
