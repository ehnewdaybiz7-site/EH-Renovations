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
    // 2. Portfolio Filtering
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    let activeItems = [...portfolioItems]; // Currently visible items in the gallery
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Reset animation classes
                item.classList.remove('fade');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hidden');
                    // Force reflow to trigger animation
                    void item.offsetWidth;
                    item.classList.add('fade');
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Update the active items list for lightbox navigation
            activeItems = portfolioItems.filter(item => !item.classList.contains('hidden'));
        });
    });

    // ==========================================
    // 3. Portfolio Lightbox Modal
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxText = document.getElementById('lightbox-text');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let currentImageIndex = 0;
    
    // Open lightbox
    const openLightbox = (item) => {
        // Find index of the clicked item in the currently active/filtered list
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
        currentImageIndex = (currentImageIndex - 1 + activeItems.length) % activeItems.length;
        updateLightboxContent();
    };
    
    const showNextImage = (e) => {
        if (e) e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % activeItems.length;
        updateLightboxContent();
    };
    
    // Bind click handlers to portfolio item overlays
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
    });
    
    // Close & Arrow Handlers
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);
    
    // Clicking outside the image wrapper closes the lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard Controls
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
