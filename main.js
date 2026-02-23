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
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.2;
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
      
      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
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
    const gridSize = 80;
    const cols = Math.ceil(canvas.width / gridSize);
    const rows = Math.ceil(canvas.height / gridSize);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * gridSize + Math.random() * 20 - 10;
        const y = j * gridSize + Math.random() * 20 - 10;
        particles.push(new Particle(x, y));
      }
    }
  }
  
  const mouse = {
    x: null,
    y: null
  };
  
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const opacity = (120 - distance) / 120 * 0.15;
          ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
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
  
  window.addEventListener('resize', resize);
  
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
  }
  
  window.addEventListener('scroll', highlightNav);
  highlightNav();
}

// Parallax effect for hero section
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const parallaxSpeed = 0.5;
    
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
    }
  });
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
  });
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
  
  if (canAnimate) {
    initCursorGlow();
    initParticleCanvas();
    initScrollAnimations();
    initCodeTypewriter();
    initHeroParallax();
    initStatsCounter();
  }
  
  // Log for debugging
  console.log('%c Portfolio loaded successfully! ', 'background: #14b8a6; color: #0a0e14; padding: 4px 8px; border-radius: 4px;');
  console.log('%c Built by Sebastian Solares ', 'color: #14b8a6;');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause expensive animations when tab is hidden
    console.log('Tab hidden - pausing animations');
  } else {
    console.log('Tab visible - resuming animations');
  }
});
