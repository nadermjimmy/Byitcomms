/**
 * Nawy Real Estate Theme - Main JavaScript
 * Handles theme functionality and interactions
 */

(function() {
  'use strict';

  // Theme object to store all functionality
  const NawyTheme = {
    init: function() {
      this.mobileNav();
      this.heroTabs();
      this.propertyFilters();
      this.wishlist();
      this.modals();
      this.languageToggle();
      this.smoothScroll();
      this.lazyLoading();
      this.animations();
      this.forms();
    },

    // Mobile Navigation
    mobileNav: function() {
      const mobileToggle = document.querySelector('[data-mobile-menu-toggle]');
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const body = document.body;

      if (!mobileToggle || !mobileMenu) return;

      mobileToggle.addEventListener('click', function() {
        const isOpen = mobileMenu.classList.contains('header__mobile-menu--active');
        
        if (isOpen) {
          mobileMenu.classList.remove('header__mobile-menu--active');
          body.style.overflow = '';
          this.setAttribute('aria-expanded', 'false');
        } else {
          mobileMenu.classList.add('header__mobile-menu--active');
          body.style.overflow = 'hidden';
          this.setAttribute('aria-expanded', 'true');
        }
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', function(e) {
        if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('header__mobile-menu--active');
          body.style.overflow = '';
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close mobile menu on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('header__mobile-menu--active')) {
          mobileMenu.classList.remove('header__mobile-menu--active');
          body.style.overflow = '';
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.focus();
        }
      });
    },

    // Hero Section Tabs
    heroTabs: function() {
      const tabs = document.querySelectorAll('[data-tab]');
      const contents = document.querySelectorAll('[data-search-content]');

      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          const targetTab = this.dataset.tab;

          // Update active tab
          tabs.forEach(t => t.classList.remove('hero__tab--active'));
          this.classList.add('hero__tab--active');

          // Update content visibility
          contents.forEach(content => {
            if (content.dataset.searchContent === targetTab) {
              content.style.display = 'block';
            } else {
              content.style.display = 'none';
            }
          });
        });
      });
    },

    // Property Filters
    propertyFilters: function() {
      const filterButtons = document.querySelectorAll('[data-filter]');
      const propertyItems = document.querySelectorAll('[data-property-type]');

      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          const filter = this.dataset.filter;

          // Update active filter button
          filterButtons.forEach(btn => btn.classList.remove('featured-properties__filter--active'));
          this.classList.add('featured-properties__filter--active');

          // Filter property items
          propertyItems.forEach(item => {
            const propertyType = item.dataset.propertyType;
            
            if (filter === 'all' || propertyType === filter) {
              item.style.display = 'block';
              item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });

      // Advanced filters toggle
      const advancedToggle = document.querySelector('[data-advanced-toggle]');
      const advancedContent = document.querySelector('[data-advanced-content]');

      if (advancedToggle && advancedContent) {
        advancedToggle.addEventListener('click', function() {
          const isOpen = advancedContent.style.display === 'block';
          const icon = this.querySelector('.search-filters__advanced-icon');
          
          if (isOpen) {
            advancedContent.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
            this.setAttribute('aria-expanded', 'false');
          } else {
            advancedContent.style.display = 'block';
            icon.style.transform = 'rotate(180deg)';
            this.setAttribute('aria-expanded', 'true');
          }
        });
      }
    },

    // Wishlist Functionality
    wishlist: function() {
      const wishlistButtons = document.querySelectorAll('[data-wishlist-toggle]');
      let wishlistItems = JSON.parse(localStorage.getItem('nawy_wishlist') || '[]');

      wishlistButtons.forEach(button => {
        const productId = button.dataset.productId;
        
        // Set initial state
        if (wishlistItems.includes(productId)) {
          button.classList.add('property-card__wishlist--active');
          button.style.color = '#ff6b35';
        }

        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          const productId = this.dataset.productId;
          const isInWishlist = wishlistItems.includes(productId);

          if (isInWishlist) {
            // Remove from wishlist
            wishlistItems = wishlistItems.filter(id => id !== productId);
            this.classList.remove('property-card__wishlist--active');
            this.style.color = '';
            this.setAttribute('aria-label', 'Add to wishlist');
          } else {
            // Add to wishlist
            wishlistItems.push(productId);
            this.classList.add('property-card__wishlist--active');
            this.style.color = '#ff6b35';
            this.setAttribute('aria-label', 'Remove from wishlist');
          }

          // Save to localStorage
          localStorage.setItem('nawy_wishlist', JSON.stringify(wishlistItems));

          // Show notification
          this.showWishlistNotification(isInWishlist ? 'removed' : 'added');
        });
      });
    },

    // Show wishlist notification
    showWishlistNotification: function(action) {
      const notification = document.createElement('div');
      notification.className = 'wishlist-notification';
      notification.textContent = action === 'added' ? 
        'Property added to wishlist' : 
        'Property removed from wishlist';
      
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    },

    // Modal Functionality
    modals: function() {
      const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
      const modals = document.querySelectorAll('[data-modal]');
      const modalCloses = document.querySelectorAll('[data-modal-close]');
      const modalOverlays = document.querySelectorAll('[data-modal-overlay]');

      // Open modal
      modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
          const targetModal = document.querySelector(`[data-modal="${this.dataset.modalTrigger}"]`);
          if (targetModal) {
            targetModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            targetModal.setAttribute('aria-hidden', 'false');
          }
        });
      });

      // Close modal functions
      function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
      }

      // Close on button click
      modalCloses.forEach(close => {
        close.addEventListener('click', function() {
          const modal = this.closest('[data-modal]');
          if (modal) closeModal(modal);
        });
      });

      // Close on overlay click
      modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
          const modal = this.closest('[data-modal]');
          if (modal) closeModal(modal);
        });
      });

      // Close on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const openModal = document.querySelector('[data-modal][style*="flex"]');
          if (openModal) closeModal(openModal);
        }
      });
    },

    // Language Toggle
    languageToggle: function() {
      const languageToggles = document.querySelectorAll('[data-language-toggle]');
      
      languageToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
          // This would typically make an AJAX call to change the language
          // For now, we'll just show a notification
          const notification = document.createElement('div');
          notification.textContent = 'Language switching functionality would be implemented here';
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #007bff;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
          `;
          
          document.body.appendChild(notification);
          
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 3000);
        });
      });
    },

    // Smooth Scrolling
    smoothScroll: function() {
      const scrollLinks = document.querySelectorAll('a[href^="#"]');
      
      scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href === '#') return;
          
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    },

    // Lazy Loading for Images
    lazyLoading: function() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
      }
    },

    // Scroll Animations
    animations: function() {
      if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });

        const animatedElements = document.querySelectorAll('[data-aos]');
        animatedElements.forEach(el => {
          el.classList.add('animate-ready');
          animationObserver.observe(el);
        });
      }
    },

    // Form Enhancements
    forms: function() {
      // Contact form enhancements
      const contactForms = document.querySelectorAll('.contact-form, .comment-form');
      
      contactForms.forEach(form => {
        const submitButton = form.querySelector('button[type="submit"]');
        
        form.addEventListener('submit', function() {
          if (submitButton) {
            submitButton.classList.add('btn--loading');
            submitButton.disabled = true;
          }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('blur', function() {
            this.validateField();
          });
        });
      });

      // Custom validation function
      HTMLInputElement.prototype.validateField = function() {
        const field = this;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
          existingError.remove();
        }
        field.classList.remove('form-input--error');

        // Validation rules
        if (field.hasAttribute('required') && !value) {
          isValid = false;
          errorMessage = 'This field is required';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number';
        }

        if (!isValid) {
          field.classList.add('form-input--error');
          const errorElement = document.createElement('div');
          errorElement.className = 'field-error';
          errorElement.textContent = errorMessage;
          errorElement.style.color = '#dc3545';
          errorElement.style.fontSize = '0.875rem';
          errorElement.style.marginTop = '0.25rem';
          field.parentNode.appendChild(errorElement);
        }

        return isValid;
      };

      // Validation helper functions
      HTMLInputElement.prototype.isValidEmail = function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      HTMLInputElement.prototype.isValidPhone = function(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
      };
    },

    // Utility Functions
    utils: {
      // Debounce function
      debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
          const context = this;
          const args = arguments;
          const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };
          const callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      // Throttle function
      throttle: function(func, limit) {
        let inThrottle;
        return function() {
          const args = arguments;
          const context = this;
          if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
      },

      // Get URL parameters
      getUrlParameter: function(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      }
    }
  };

  // Initialize theme when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      NawyTheme.init();
    });
  } else {
    NawyTheme.init();
  }

  // Make NawyTheme globally accessible
  window.NawyTheme = NawyTheme;

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-ready {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }

    .animate-ready.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .lazy {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .field-error {
      animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

})();