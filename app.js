/**
 * EH Renovations - Core Application Logic
 * Implements interactive navigation, portfolio filtering, lightbox, and forms.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Navigation & Scroll Effects
    // ==========================================
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-links');
    
    // Toggle header glassmorphism on scroll
    const handleScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link highlighting on scroll
        let currentSectionId = '';
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop - 120;
            const sectionHeight = sec.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });
        
        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run initially
    
    // Mobile navigation toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons(); // Refresh icons
        });
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // ==========================================
    // 2. Portfolio State
    // ==========================================
    let portfolioItems = [];
    let activeItems = [];
    let currentImageIndex = 0;

    // ==========================================
    // 3. Lightbox Functions
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxText = document.getElementById('lightbox-text');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    // Open lightbox
    const openLightbox = (item) => {
        currentImageIndex = activeItems.indexOf(item);
        if (currentImageIndex === -1) return;
        
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };
    
    // Close lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scroll
    };
    
    // Update lightbox elements
    const updateLightboxContent = () => {
        const activeItem = activeItems[currentImageIndex];
        if (!activeItem) return;
        
        const img = activeItem.querySelector('img');
        const category = activeItem.getAttribute('data-category');
        const title = activeItem.querySelector('.item-title').textContent;
        const desc = activeItem.getAttribute('data-desc');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        lightboxText.innerHTML = `<strong>${title}</strong> — ${desc}`;
    };
    
    // Navigate Lightbox
    const showPrevImage = (e) => {
        if (e) e.stopPropagation();
        if (activeItems.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + activeItems.length) % activeItems.length;
        updateLightboxContent();
    };
    
    const showNextImage = (e) => {
        if (e) e.stopPropagation();
        if (activeItems.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % activeItems.length;
        updateLightboxContent();
    };

    // Bind static lightbox controls once
    if (lightboxClose && lightboxPrev && lightboxNext) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', showPrevImage);
        lightboxNext.addEventListener('click', showNextImage);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        });
    }

    // Function to initialize logic on whichever portfolio items are present
    const initPortfolio = () => {
        portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
        activeItems = [...portfolioItems];

        // Bind click events for gallery item overlays
        portfolioItems.forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
        });
    };

    // Bind static filter buttons once
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                item.classList.remove('fade');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hidden');
                    void item.offsetWidth;
                    item.classList.add('fade');
                } else {
                    item.classList.add('hidden');
                }
            });
            
            activeItems = portfolioItems.filter(item => !item.classList.contains('hidden'));
        });
    });

    // Load dynamic items from portfolio-data.json
    fetch('portfolio-data.json?t=' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error("Portfolio data not found");
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                // Find and apply the Hero Photo background override if present and active
                const heroPhoto = data.find(item => item.isHero && item.active);
                if (heroPhoto) {
                    const heroSec = document.querySelector('.hero-section');
                    if (heroSec) {
                        heroSec.style.setProperty('--hero-bg-img', `url('${heroPhoto.path}')`);
                    }
                }

                const galleryGrid = document.getElementById('portfolio-gallery-grid');
                if (galleryGrid) {
                    galleryGrid.innerHTML = ''; // Clear fallback HTML
                    
                    const activeItemsData = data.filter(item => item.active);
                    activeItemsData.forEach(item => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'portfolio-item';
                        itemDiv.setAttribute('data-category', item.category);
                        itemDiv.setAttribute('data-desc', item.desc);
                        
                        const catLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);
                        
                        itemDiv.innerHTML = `
                            <img src="${item.path}" alt="${item.title}" loading="lazy">
                            <div class="portfolio-item-overlay">
                                <span class="item-category">${catLabel}</span>
                                <h4 class="item-title">${item.title}</h4>
                                <div class="item-icon"><i data-lucide="zoom-in"></i></div>
                            </div>
                        `;
                        galleryGrid.appendChild(itemDiv);
                    });
                    
                    // Re-render lucide icons
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }
            // Initialize portfolio functionality on the dynamically loaded items
            initPortfolio();
        })
        .catch(err => {
            console.log("Using index.html fallback for gallery:", err.message);
            // Initialize portfolio functionality on the fallback/hardcoded HTML elements
            initPortfolio();
        });

    // ==========================================
    // 4. Contact Form Interaction
    // ==========================================
    const contactForm = document.getElementById('renovation-contact-form');
    const formSuccessBox = document.getElementById('form-success-box');
    
    if (contactForm && formSuccessBox) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop standard redirect submission
            
            const submitBtn = document.getElementById('form-submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // Show loading animation in button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Simulate API round-trip delay
            setTimeout(() => {
                // Fade out the form and display success panel
                contactForm.style.display = 'none';
                formSuccessBox.style.display = 'block';
                
                // Scroll success box into view if needed
                formSuccessBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1200);
        });
    }
});
