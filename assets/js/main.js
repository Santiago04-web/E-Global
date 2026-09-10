/**
 * E-GLOBAL S.A. - Main Interactive Script
 * B2B Enterprise Experience & Conversion Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. Header Sticky Effect on Scroll ---
  const header = document.getElementById('siteHeader');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- 2. Mobile Navigation Drawer ---
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const navOverlay = document.getElementById('navOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openMobileNav = () => {
    document.body.classList.add('mobile-nav-open');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    document.body.classList.remove('mobile-nav-open');
    document.body.style.overflow = '';
  };

  if (navToggle) navToggle.addEventListener('click', openMobileNav);
  if (navClose) navClose.addEventListener('click', closeMobileNav);
  if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));

  // --- 3. Interactive Needs Selector ("¿Qué necesita tu empresa?") ---
  const needCards = document.querySelectorAll('.need-card');
  needCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      const whatsappMsg = card.getAttribute('data-wa');
      
      needCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const headerHeight = header.offsetHeight || 70;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Highlight target card or section briefly
          targetElement.style.transition = 'box-shadow 0.5s ease';
          targetElement.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.4)';
          setTimeout(() => {
            targetElement.style.boxShadow = '';
          }, 1800);
        }
      } else if (whatsappMsg) {
        // Direct WhatsApp with context
        const encoded = encodeURIComponent(whatsappMsg);
        window.open(`https://wa.me/573042327505?text=${encoded}`, '_blank');
      }
    });
  });

  // --- 4. Active Navigation Spy on Scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => navObserver.observe(sec));

  // --- 5. B2B Enterprise Contact Form Validation & Handler ---
  const contactForm = document.getElementById('b2bContactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const company = document.getElementById('contactCompany').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const service = document.getElementById('contactService').value;
      const message = document.getElementById('contactMessage').value.trim();
      const policyAccepted = document.getElementById('privacyCheck').checked;

      if (!policyAccepted) {
        alert('Por favor, acepta la política de tratamiento de datos personales para continuar.');
        return;
      }

      if (!name || !email || !message) {
        alert('Por favor completa todos los campos obligatorios (*).');
        return;
      }

      // Show success feedback
      if (formFeedback) {
        formFeedback.innerHTML = `
          <strong>✓ Solicitud recibida con éxito.</strong><br>
          Estimado(a) <b>${name}</b>, el equipo corporativo de E-GLOBAL se comunicará contigo a <b>${email}</b> a la mayor brevedad.
        `;
        formFeedback.className = 'form-feedback success';
        formFeedback.style.display = 'block';
      }

      // Format clean message for WhatsApp option
      const waText = encodeURIComponent(
        `Hola E-GLOBAL, mi nombre es ${name} de la empresa ${company || 'Empresa'}. ` +
        `Estoy interesado en soluciones de ${service}. Tel: ${phone}. Mensaje: ${message}`
      );

      // Offer immediate WhatsApp dispatch
      const openWhatsAppPrompt = confirm(
        '¿Deseas también enviar tu solicitud directamente a un asesor de E-GLOBAL por WhatsApp para una atención prioritaria?'
      );

      if (openWhatsAppPrompt) {
        window.open(`https://wa.me/573042327505?text=${waText}`, '_blank');
      }

      contactForm.reset();
    });
  }

  // --- 6. Dynamic Current Year in Footer ---
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- 7. WhatsApp Floating Tooltip Auto-Hide & Interaction ---
  const waTooltip = document.querySelector('.whatsapp-tooltip');
  if (waTooltip) {
    setTimeout(() => {
      waTooltip.style.transition = 'opacity 0.6s ease';
      waTooltip.style.opacity = '0';
      setTimeout(() => {
        waTooltip.style.display = 'none';
      }, 600);
    }, 9000);
  }
});
