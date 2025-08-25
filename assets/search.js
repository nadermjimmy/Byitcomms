/**
 * Nawy Real Estate Theme - Search Functionality
 * Handles advanced search features and property filtering
 */

(function() {
  'use strict';

  const NawySearch = {
    init: function() {
      this.searchForm();
      this.instantSearch();
      this.propertyComparison();
      this.savedSearches();
      this.mapIntegration();
      this.filterHistory();
      this.searchSuggestions();
    },

    // Enhanced Search Form Functionality
    searchForm: function() {
      const searchForms = document.querySelectorAll('.search-form, .hero__search-form');
      
      searchForms.forEach(form => {
        const searchInput = form.querySelector('input[name="q"]');
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (!searchInput) return;

        // Auto-submit on filter changes
        const filterElements = form.querySelectorAll('select, input[type="checkbox"], input[type="radio"]');
        filterElements.forEach(element => {
          element.addEventListener('change', this.utils.debounce(() => {
            this.updateResults(form);
          }, 500));
        });

        // Search input enhancements
        searchInput.addEventListener('input', this.utils.debounce((e) => {
          const query = e.target.value.trim();
          if (query.length >= 2) {
            this.showSearchSuggestions(query, e.target);
          } else {
            this.hideSearchSuggestions();
          }
        }, 300));

        // Prevent double submission
        form.addEventListener('submit', function(e) {
          if (submitButton) {
            submitButton.disabled = true;
            setTimeout(() => {
              submitButton.disabled = false;
            }, 2000);
          }
        });
      });
    },

    // Instant Search Results
    instantSearch: function() {
      const instantSearchContainer = document.querySelector('[data-instant-search]');
      if (!instantSearchContainer) return;

      const searchInput = document.querySelector('#instant-search-input');
      if (!searchInput) return;

      searchInput.addEventListener('input', this.utils.debounce((e) => {
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
          this.performInstantSearch(query, instantSearchContainer);
        } else {
          instantSearchContainer.innerHTML = '';
          instantSearchContainer.style.display = 'none';
        }
      }, 300));

      // Hide results when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !instantSearchContainer.contains(e.target)) {
          instantSearchContainer.style.display = 'none';
        }
      });
    },

    // Perform instant search
    performInstantSearch: function(query, container) {
      const searchUrl = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`;
      
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          this.displayInstantResults(data, container);
        })
        .catch(error => {
          console.error('Instant search error:', error);
        });
    },

    // Display instant search results
    displayInstantResults: function(data, container) {
      const products = data.resources?.results?.products || [];
      
      if (products.length === 0) {
        container.innerHTML = '<div class="instant-search__no-results">No properties found</div>';
        container.style.display = 'block';
        return;
      }

      const resultsHTML = products.map(product => `
        <div class="instant-search__item">
          <a href="${product.url}" class="instant-search__link">
            ${product.featured_image ? `
              <img src="${product.featured_image}" alt="${product.title}" class="instant-search__image">
            ` : ''}
            <div class="instant-search__content">
              <h4 class="instant-search__title">${product.title}</h4>
              <p class="instant-search__price">${this.formatPrice(product.price)}</p>
            </div>
          </a>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="instant-search__results">
          ${resultsHTML}
          <div class="instant-search__footer">
            <a href="/search?q=${encodeURIComponent(data.query)}" class="instant-search__view-all">
              View all results
            </a>
          </div>
        </div>
      `;
      container.style.display = 'block';
    },

    // Property Comparison Feature
    propertyComparison: function() {
      let comparisonItems = JSON.parse(localStorage.getItem('nawy_comparison') || '[]');
      const maxComparison = 3;

      // Update comparison UI
      this.updateComparisonUI();

      // Add to comparison buttons
      const compareButtons = document.querySelectorAll('[data-add-comparison]');
      compareButtons.forEach(button => {
        const productId = button.dataset.productId;
        
        // Set initial state
        if (comparisonItems.includes(productId)) {
          button.classList.add('active');
          button.textContent = 'Remove from comparison';
        }

        button.addEventListener('click', (e) => {
          e.preventDefault();
          
          const productId = button.dataset.productId;
          const isInComparison = comparisonItems.includes(productId);

          if (isInComparison) {
            // Remove from comparison
            comparisonItems = comparisonItems.filter(id => id !== productId);
            button.classList.remove('active');
            button.textContent = 'Add to comparison';
          } else if (comparisonItems.length < maxComparison) {
            // Add to comparison
            comparisonItems.push(productId);
            button.classList.add('active');
            button.textContent = 'Remove from comparison';
          } else {
            // Show max limit message
            this.showNotification('You can compare up to 3 properties at once', 'warning');
            return;
          }

          localStorage.setItem('nawy_comparison', JSON.stringify(comparisonItems));
          this.updateComparisonUI();
        });
      });

      // Comparison bar functionality
      const comparisonBar = document.querySelector('.comparison-bar');
      if (comparisonBar) {
        const clearButton = comparisonBar.querySelector('.comparison-bar__clear');
        const compareButton = comparisonBar.querySelector('.comparison-bar__compare');

        if (clearButton) {
          clearButton.addEventListener('click', () => {
            comparisonItems = [];
            localStorage.removeItem('nawy_comparison');
            this.updateComparisonUI();
            
            // Reset all comparison buttons
            compareButtons.forEach(btn => {
              btn.classList.remove('active');
              btn.textContent = 'Add to comparison';
            });
          });
        }

        if (compareButton) {
          compareButton.addEventListener('click', () => {
            if (comparisonItems.length >= 2) {
              window.location.href = `/pages/compare?products=${comparisonItems.join(',')}`;
            }
          });
        }
      }
    },

    // Update comparison UI
    updateComparisonUI: function() {
      const comparisonItems = JSON.parse(localStorage.getItem('nawy_comparison') || '[]');
      const comparisonBar = document.querySelector('.comparison-bar');
      
      if (!comparisonBar) return;

      const count = comparisonItems.length;
      const countElement = comparisonBar.querySelector('.comparison-bar__count');
      const compareButton = comparisonBar.querySelector('.comparison-bar__compare');

      if (countElement) {
        countElement.textContent = count;
      }

      if (compareButton) {
        compareButton.disabled = count < 2;
      }

      // Show/hide comparison bar
      if (count > 0) {
        comparisonBar.classList.add('comparison-bar--visible');
      } else {
        comparisonBar.classList.remove('comparison-bar--visible');
      }
    },

    // Saved Searches
    savedSearches: function() {
      const saveSearchButton = document.querySelector('[data-save-search]');
      if (!saveSearchButton) return;

      saveSearchButton.addEventListener('click', () => {
        const searchParams = new URLSearchParams(window.location.search);
        const searchData = {
          query: searchParams.get('q') || '',
          filters: {},
          timestamp: Date.now(),
          url: window.location.href
        };

        // Collect filter data
        searchParams.forEach((value, key) => {
          if (key !== 'q' && value) {
            searchData.filters[key] = value;
          }
        });

        this.showSaveSearchModal(searchData);
      });
    },

    // Show save search modal
    showSaveSearchModal: function(searchData) {
      const modal = document.createElement('div');
      modal.className = 'modal save-search-modal';
      modal.style.display = 'flex';
      
      modal.innerHTML = `
        <div class="modal__overlay"></div>
        <div class="modal__content">
          <div class="modal__header">
            <h3>Save Search</h3>
            <button type="button" class="modal__close">&times;</button>
          </div>
          <div class="modal__body">
            <form class="save-search-form">
              <div class="form-field">
                <label for="search-name">Search Name</label>
                <input type="text" id="search-name" name="name" required 
                       placeholder="e.g., 3BR Apartments in New Cairo" 
                       value="${this.generateSearchName(searchData)}">
              </div>
              <div class="form-field">
                <label>
                  <input type="checkbox" name="email_alerts" checked>
                  Email me when new properties match this search
                </label>
              </div>
              <button type="submit" class="btn btn--primary">Save Search</button>
            </form>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';

      // Handle form submission
      const form = modal.querySelector('.save-search-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const savedSearch = {
          ...searchData,
          name: formData.get('name'),
          emailAlerts: formData.get('email_alerts') === 'on',
          id: Date.now().toString()
        };

        this.saveSearch(savedSearch);
        document.body.removeChild(modal);
        document.body.style.overflow = '';
      });

      // Handle modal close
      const closeButton = modal.querySelector('.modal__close');
      const overlay = modal.querySelector('.modal__overlay');
      
      [closeButton, overlay].forEach(element => {
        element.addEventListener('click', () => {
          document.body.removeChild(modal);
          document.body.style.overflow = '';
        });
      });
    },

    // Save search to localStorage
    saveSearch: function(searchData) {
      const savedSearches = JSON.parse(localStorage.getItem('nawy_saved_searches') || '[]');
      savedSearches.push(searchData);
      localStorage.setItem('nawy_saved_searches', JSON.stringify(savedSearches));
      
      this.showNotification('Search saved successfully!', 'success');
    },

    // Generate search name
    generateSearchName: function(searchData) {
      let name = '';
      
      if (searchData.query) {
        name = searchData.query;
      } else {
        // Generate from filters
        const filters = searchData.filters;
        const parts = [];
        
        if (filters.bedrooms) parts.push(`${filters.bedrooms}BR`);
        if (filters.property_type) parts.push(filters.property_type);
        if (filters.location) parts.push(`in ${filters.location}`);
        
        name = parts.join(' ') || 'Property Search';
      }
      
      return name;
    },

    // Map Integration (placeholder)
    mapIntegration: function() {
      const mapContainer = document.querySelector('[data-property-map]');
      if (!mapContainer) return;

      // This would integrate with Google Maps, Mapbox, or similar
      // For now, we'll create a placeholder
      mapContainer.innerHTML = `
        <div class="map-placeholder">
          <p>Interactive map would be displayed here</p>
          <p>Showing properties in the search area</p>
        </div>
      `;
    },

    // Filter History
    filterHistory: function() {
      const filterSelects = document.querySelectorAll('.search-filter__select');
      const filterInputs = document.querySelectorAll('.search-filter__input');
      
      // Save filter state when changed
      [...filterSelects, ...filterInputs].forEach(element => {
        element.addEventListener('change', () => {
          this.saveFilterState();
        });
      });

      // Restore filter state on page load
      this.restoreFilterState();
    },

    // Save current filter state
    saveFilterState: function() {
      const filterState = {};
      const allFilters = document.querySelectorAll('.search-filter select, .search-filter input');
      
      allFilters.forEach(filter => {
        if (filter.value && filter.name) {
          filterState[filter.name] = filter.value;
        }
      });

      sessionStorage.setItem('nawy_filter_state', JSON.stringify(filterState));
    },

    // Restore filter state
    restoreFilterState: function() {
      const filterState = JSON.parse(sessionStorage.getItem('nawy_filter_state') || '{}');
      
      Object.keys(filterState).forEach(name => {
        const filter = document.querySelector(`[name="${name}"]`);
        if (filter) {
          filter.value = filterState[name];
        }
      });
    },

    // Search Suggestions
    searchSuggestions: function() {
      const searchInputs = document.querySelectorAll('input[name="q"]');
      
      searchInputs.forEach(input => {
        input.addEventListener('focus', () => {
          this.showRecentSearches(input);
        });
      });
    },

    // Show recent searches
    showRecentSearches: function(input) {
      const recentSearches = JSON.parse(localStorage.getItem('nawy_recent_searches') || '[]');
      if (recentSearches.length === 0) return;

      const suggestions = document.createElement('div');
      suggestions.className = 'search-suggestions';
      suggestions.innerHTML = `
        <div class="search-suggestions__header">Recent Searches</div>
        ${recentSearches.slice(0, 5).map(search => `
          <div class="search-suggestions__item" data-search="${search}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            ${search}
          </div>
        `).join('')}
        <div class="search-suggestions__footer">
          <button type="button" class="search-suggestions__clear">Clear recent searches</button>
        </div>
      `;

      // Position suggestions
      const rect = input.getBoundingClientRect();
      suggestions.style.cssText = `
        position: absolute;
        top: ${rect.bottom + window.scrollY}px;
        left: ${rect.left + window.scrollX}px;
        width: ${rect.width}px;
        background: white;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
      `;

      document.body.appendChild(suggestions);

      // Handle suggestion clicks
      suggestions.addEventListener('click', (e) => {
        const item = e.target.closest('[data-search]');
        if (item) {
          input.value = item.dataset.search;
          document.body.removeChild(suggestions);
          input.form.submit();
        }

        if (e.target.classList.contains('search-suggestions__clear')) {
          localStorage.removeItem('nawy_recent_searches');
          document.body.removeChild(suggestions);
        }
      });

      // Remove suggestions when clicking outside
      setTimeout(() => {
        document.addEventListener('click', function removeSuggestions(e) {
          if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            if (document.body.contains(suggestions)) {
              document.body.removeChild(suggestions);
            }
            document.removeEventListener('click', removeSuggestions);
          }
        });
      }, 100);
    },

    // Update search results via AJAX
    updateResults: function(form) {
      const formData = new FormData(form);
      const searchParams = new URLSearchParams(formData);
      const url = `${form.action}?${searchParams.toString()}`;

      // Show loading state
      const resultsContainer = document.querySelector('[data-search-results]');
      if (resultsContainer) {
        resultsContainer.classList.add('loading');
      }

      fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.text())
      .then(html => {
        // Parse the response and update results
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newResults = doc.querySelector('[data-search-results]');
        
        if (resultsContainer && newResults) {
          resultsContainer.innerHTML = newResults.innerHTML;
          resultsContainer.classList.remove('loading');
        }

        // Update URL without page reload
        window.history.pushState({}, '', url);
      })
      .catch(error => {
        console.error('Search update error:', error);
        if (resultsContainer) {
          resultsContainer.classList.remove('loading');
        }
      });
    },

    // Utility functions
    utils: {
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
      }
    },

    // Show notification
    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification--${type}`;
      notification.textContent = message;
      
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
    },

    // Format price helper
    formatPrice: function(price) {
      if (!price) return '';
      
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      
      return formatter.format(price / 100); // Shopify prices are in cents
    }
  };

  // Initialize search functionality when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      NawySearch.init();
    });
  } else {
    NawySearch.init();
  }

  // Make NawySearch globally accessible
  window.NawySearch = NawySearch;

  // Save search queries to recent searches
  const searchForms = document.querySelectorAll('form[action*="search"]');
  searchForms.forEach(form => {
    form.addEventListener('submit', function() {
      const searchInput = this.querySelector('input[name="q"]');
      if (searchInput && searchInput.value.trim()) {
        const recentSearches = JSON.parse(localStorage.getItem('nawy_recent_searches') || '[]');
        const query = searchInput.value.trim();
        
        // Remove if already exists
        const index = recentSearches.indexOf(query);
        if (index > -1) {
          recentSearches.splice(index, 1);
        }
        
        // Add to beginning
        recentSearches.unshift(query);
        
        // Keep only last 10
        if (recentSearches.length > 10) {
          recentSearches.length = 10;
        }
        
        localStorage.setItem('nawy_recent_searches', JSON.stringify(recentSearches));
      }
    });
  });

})();