// ============================================
// PORTFOLIO INTERACTIONS
// Sebastian Solares - Full Stack Developer
// ============================================

// Cursor glow follower
function initCursorGlow() {
  const cursorGlow = document.querySelector('.cursor-glow');
  
  if (!cursorGlow) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animate() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    
    currentX += dx * 0.1;
    currentY += dy * 0.1;
    
    cursorGlow.style.left = currentX + 'px';
    cursorGlow.style.top = currentY + 'px';
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Particle grid system
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let isPaused = false;
  
  // Detect device type and capabilities
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  const isLowPerformance = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  // Adjust settings based on device
  const config = {
    gridSize: isMobile ? 120 : isTablet ? 100 : 80,
    connectionDistance: isMobile ? 100 : 120,
    maxConnections: isMobile ? 2 : isTablet ? 3 : 5,
    particleSize: isMobile ? 1.5 : 2,
    enableConnections: !isMobile, // Disable connections on mobile for better performance
    enableMouseInteraction: !isMobile,
    fps: isMobile || isLowPerformance ? 30 : 60
  };
  
  const fpsInterval = 1000 / config.fps;
  let lastFrameTime = Date.now();
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.size = Math.random() * config.particleSize + 0.5;
      this.speedX = (Math.random() * 0.5 - 0.25) * (isMobile ? 0.5 : 1);
      this.speedY = (Math.random() * 0.5 - 0.25) * (isMobile ? 0.5 : 1);
      this.opacity = Math.random() * 0.5 + 0.2;
      this.connections = 0;
    }
    
    update(mouse) {
      // Gentle drift
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Return to base position
      const dx = this.baseX - this.x;
      const dy = this.baseY - this.y;
      this.x += dx * 0.01;
      this.y += dy * 0.01;
      
      // Mouse interaction (only on desktop)
      if (config.enableMouseInteraction && mouse.x !== null && mouse.y !== null) {
        const distX = mouse.x - this.x;
        const distY = mouse.y - this.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          const angle = Math.atan2(distY, distX);
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
        }
      }
      
      this.connections = 0;
    }
    
    draw() {
      ctx.fillStyle = `rgba(20, 184, 166, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  function initParticles() {
    particles = [];
    const cols = Math.ceil(canvas.width / config.gridSize);
    const rows = Math.ceil(canvas.height / config.gridSize);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * config.gridSize + Math.random() * 20 - 10;
        const y = j * config.gridSize + Math.random() * 20 - 10;
        particles.push(new Particle(x, y));
      }
    }
  }
  
  const mouse = {
    x: null,
    y: null
  };
  
  if (config.enableMouseInteraction) {
    canvas.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });
    
    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }
  
  function animate() {
    // FPS throttling
    const now = Date.now();
    const elapsed = now - lastFrameTime;
    
    if (elapsed < fpsInterval) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    
    lastFrameTime = now - (elapsed % fpsInterval);
    
    // Skip animation if paused (page hidden)
    if (isPaused) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections (only on desktop)
    if (config.enableConnections) {
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].connections >= config.maxConnections) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[j].connections >= config.maxConnections) continue;
          
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.connectionDistance) {
            const opacity = (config.connectionDistance - distance) / config.connectionDistance * 0.15;
            ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            particles[i].connections++;
            particles[j].connections++;
          }
        }
      }
    }
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update(mouse);
      particle.draw();
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  resize();
  animate();
  
  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 250);
  });
  
  // Pause animations when tab is hidden (battery saving)
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
  });
}

// Smooth scroll with offset for sticky nav
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        const offset = 100;
        const targetPosition = target.offsetTop - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements
  document.querySelectorAll('.project-item, .certification-card, .skill-group').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Code preview typewriter effect
function initCodeTypewriter() {
  const codeElement = document.querySelector('.code-content code');
  if (!codeElement) return;
  
  const originalHTML = codeElement.innerHTML;
  codeElement.innerHTML = '';
  
  let index = 0;
  const typingSpeed = 20;
  
  function type() {
    if (index < originalHTML.length) {
      codeElement.innerHTML = originalHTML.slice(0, index);
      index++;
      
      // Scroll to bottom of code block as it types
      const codeContainer = codeElement.parentElement;
      codeContainer.scrollTop = codeContainer.scrollHeight;
      
      setTimeout(type, typingSpeed);
    }
  }
  
  // Start typing after a short delay
  setTimeout(type, 500);
}

// Tech badge hover effect
function initTechBadges() {
  document.querySelectorAll('.tech-badge').forEach(badge => {
    badge.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    badge.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
}

// Project card enhanced interactions
function initProjectCards() {
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Add subtle parallax effect to thumbnail
      const thumbnail = this.querySelector('.project-thumbnail');
      if (thumbnail) {
        thumbnail.style.transform = 'scale(1.02) translateY(-4px)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      const thumbnail = this.querySelector('.project-thumbnail');
      if (thumbnail) {
        thumbnail.style.transform = 'scale(1) translateY(0)';
      }
    });
  });
}

// Navigation active state on scroll
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  let ticking = false;
  
  function highlightNav() {
    let current = '';
    const scrollPosition = window.scrollY + 200;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(highlightNav);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  highlightNav();
}

// Parallax effect for hero section
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  let ticking = false;
  let scrolled = 0;
  
  function updateParallax() {
    if (scrolled < window.innerHeight) {
      const parallaxSpeed = 0.5;
      hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
    }
    ticking = false;
  }
  
  function onScroll() {
    scrolled = window.scrollY;
    
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Stats counter animation
function initStatsCounter() {
  const statValues = document.querySelectorAll('.stat-value');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateValue(entry.target);
      }
    });
  }, observerOptions);
  
  statValues.forEach(stat => observer.observe(stat));
  
  function animateValue(element) {
    const text = element.textContent;
    const hasPercent = text.includes('%');
    const number = parseInt(text.replace(/\D/g, ''));
    
    if (isNaN(number)) return;
    
    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        element.textContent = number + (hasPercent ? '%' : '');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + (hasPercent ? '%' : '');
      }
    }, 30);
  }
}

// Keyboard navigation
function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    // Press '/' to focus search or contact
    if (e.key === '/' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

// Mobile hamburger menu
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  
  if (!hamburger || !navLinks) return;
  
  // Toggle menu
  hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.contains('active');
    
    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
  
  // Close menu when clicking a link
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  function openMobileMenu() {
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
  }
  
  function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  // Make closeMobileMenu available globally for keyboard navigation
  window.closeMobileMenu = closeMobileMenu;
}

// Lazy loading for images
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const thumbnail = img.closest('.project-thumbnail');
          
          // Image load handler
          img.addEventListener('load', () => {
            img.classList.add('loaded');
            if (thumbnail) {
              thumbnail.classList.add('loaded');
            }
          });
          
          // If image already cached/loaded
          if (img.complete) {
            img.classList.add('loaded');
            if (thumbnail) {
              thumbnail.classList.add('loaded');
            }
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      img.classList.add('loaded');
      const thumbnail = img.closest('.project-thumbnail');
      if (thumbnail) {
        thumbnail.classList.add('loaded');
      }
    });
  }
}

// Scroll progress indicator
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;
  
  let ticking = false;
  
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    // Calculate scroll percentage
    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercentage = (scrollTop / scrollableHeight) * 100;
    
    // Update progress bar width
    progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  updateProgress(); // Initial call
}

// Contact form handling
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.querySelector('.submit-text').textContent = 'Sending...';
    
    // Clear previous status
    formStatus.className = 'form-status';
    formStatus.textContent = '';
    
    // Get form data
    const formData = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Success
        formStatus.className = 'form-status success';
        formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
        form.reset();
        
        // Re-enable button after delay
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.querySelector('.submit-text').textContent = 'Send Message';
        }, 2000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      // Error
      formStatus.className = 'form-status error';
      formStatus.textContent = '✗ Something went wrong. Please try again or email me directly.';
      
      submitBtn.disabled = false;
      submitBtn.querySelector('.submit-text').textContent = 'Send Message';
    }
  });
  
  // Form validation feedback
  const inputs = form.querySelectorAll('.form-input, .form-textarea');
  inputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
      e.preventDefault();
      input.style.borderColor = '#ef4444';
    });
    
    input.addEventListener('input', () => {
      if (input.validity.valid) {
        input.style.borderColor = '';
      }
    });
  });
}

// Skills progress bars animation
function initSkillBars() {
  const skillProgress = document.querySelectorAll('.skill-progress');
  
  if (skillProgress.length === 0) return;
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const progress = entry.target.getAttribute('data-progress');
        entry.target.style.setProperty('--progress-width', `${progress}%`);
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);
  
  skillProgress.forEach(bar => observer.observe(bar));
}

// Performance: Reduce animations on low-end devices
function checkPerformance() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
    return false;
  }
  return true;
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
  const canAnimate = checkPerformance();
  
  initSmoothScroll();
  initNavHighlight();
  initTechBadges();
  initProjectCards();
  initKeyboardNav();
  initMobileMenu();
  initLazyLoading();
  initContactForm();
  initScrollProgress();
  
  if (canAnimate) {
    initCursorGlow();
    initParticleCanvas();
    initScrollAnimations();
    initCodeTypewriter();
    initHeroParallax();
    initStatsCounter();
    initSkillBars();
  }
  
  // Log for debugging
  console.log('%c Portfolio loaded successfully! ', 'background: #14b8a6; color: #0a0e14; padding: 4px 8px; border-radius: 4px;');
  console.log('%c Built by Sebastian Solares ', 'color: #14b8a6;');
});
