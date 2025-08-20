// Global variables
let currentTime = new Date();
let loadingComplete = false;
let activeWindow = null;
let windowPositions = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    showLoadingScreen();
    
    // Initialize taskbar time
    updateTaskbarTime();
    setInterval(updateTaskbarTime, 1000);
    
    // Add event listeners
    addEventListeners();
    
    // Initialize skill bars
    initializeSkillBars();
    
    // Initialize windows
    initializeWindows();
    
    // Hide loading screen after 3 seconds
    setTimeout(() => {
        hideLoadingScreen();
        // Show about window by default
        showWindow('about-window');
    }, 3000);
});

// Loading screen functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    
    // Add some random loading messages
    const messages = [
        'Initializing retro interface...',
        'Loading pixel art assets...',
        'Preparing desktop environment...',
        'Booting portfolio system...',
        'Almost ready...'
    ];
    
    const loadingText = document.querySelector('.loading-text');
    let messageIndex = 0;
    
    const messageInterval = setInterval(() => {
        if (messageIndex < messages.length) {
            loadingText.textContent = messages[messageIndex];
            messageIndex++;
        } else {
            clearInterval(messageInterval);
        }
    }, 600);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        loadingComplete = true;
    }, 500);
}

// Taskbar time update
function updateTaskbarTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('taskbar-time').textContent = timeString;
}

// Event listeners
function addEventListeners() {
    // Desktop icon clicks
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetWindow = this.getAttribute('data-target');
            showWindow(targetWindow);
        });
        
        // Add hover sound effect simulation
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Window controls
    const windowControls = document.querySelectorAll('.window-btn');
    windowControls.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const window = this.closest('.window');
            const action = this.classList.contains('close') ? 'close' : 
                          this.classList.contains('minimize') ? 'minimize' : 'maximize';
            
            handleWindowAction(window, action);
        });
    });
    
    // Window dragging
    const windowHeaders = document.querySelectorAll('.window-header');
    windowHeaders.forEach(header => {
        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('window-btn') || e.target.closest('.window-btn')) {
                return;
            }
            startDragging(e, this.closest('.window'));
        });
    });
    
    // Contact form submission
    const contactForm = document.querySelector('#contact-window form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
    
    // Project card clicks
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            showProjectModal(this);
        });
    });
    
    // Start button click
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', function() {
            showStartMenu();
        });
    }
}

// Window management functions
function showWindow(windowId) {
    // Hide all windows
    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach(window => {
        window.classList.remove('active');
    });
    
    // Show target window
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        targetWindow.classList.add('active');
        activeWindow = targetWindow;
        
        // Set random position if not set
        if (!windowPositions[windowId]) {
            const randomX = Math.random() * (window.innerWidth - 800);
            const randomY = Math.random() * (window.innerHeight - 600);
            windowPositions[windowId] = { x: randomX, y: randomY };
        }
        
        // Apply position
        const position = windowPositions[windowId];
        targetWindow.style.left = position.x + 'px';
        targetWindow.style.top = position.y + 'px';
        targetWindow.style.position = 'absolute';
        
        // Trigger skill bar animations if it's the skills window
        if (windowId === 'skills-window') {
            setTimeout(() => {
                animateSkillBars();
            }, 500);
        }
    }
}

function handleWindowAction(window, action) {
    switch (action) {
        case 'close':
            window.classList.remove('active');
            activeWindow = null;
            break;
        case 'minimize':
            window.style.transform = 'scale(0.1)';
            window.style.opacity = '0';
            setTimeout(() => {
                window.classList.remove('active');
                window.style.transform = 'scale(1)';
                window.style.opacity = '1';
            }, 300);
            break;
        case 'maximize':
            if (window.classList.contains('maximized')) {
                window.classList.remove('maximized');
                window.style.width = 'auto';
                window.style.height = 'auto';
                window.style.left = windowPositions[window.id].x + 'px';
                window.style.top = windowPositions[window.id].y + 'px';
            } else {
                window.classList.add('maximized');
                window.style.width = '95%';
                window.style.height = '90%';
                window.style.left = '2.5%';
                window.style.top = '5%';
            }
            break;
    }
}

// Window dragging functionality
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

function startDragging(e, window) {
    isDragging = true;
    const rect = window.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    
    // Bring window to front
    window.style.zIndex = '1000';
}

function drag(e) {
    if (!isDragging || !activeWindow) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    activeWindow.style.left = x + 'px';
    activeWindow.style.top = y + 'px';
    
    // Update position in storage
    windowPositions[activeWindow.id] = { x, y };
}

function stopDragging() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
    
    if (activeWindow) {
        activeWindow.style.zIndex = '20';
    }
}

// Skill bars initialization and animation
function initializeSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        bar.style.width = '0%';
    });
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth + '%';
            
            // Add completion sound effect simulation
            setTimeout(() => {
                bar.classList.add('completed');
            }, 2000);
        }, index * 200);
    });
}

// Initialize windows
function initializeWindows() {
    const windows = document.querySelectorAll('.window');
    windows.forEach((window, index) => {
        // Set initial random positions
        const randomX = 100 + (index * 50);
        const randomY = 100 + (index * 50);
        windowPositions[window.id] = { x: randomX, y: randomY };
        
        // Set window properties
        window.style.position = 'absolute';
        window.style.left = randomX + 'px';
        window.style.top = randomY + 'px';
    });
}

// Contact form handling
function handleContactSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || document.getElementById('name').value;
    const email = formData.get('email') || document.getElementById('email').value;
    const subject = formData.get('subject') || document.getElementById('subject').value;
    const message = formData.get('message') || document.getElementById('message').value;
    
    // Simulate sending message
    showRetroAlert('Message sent successfully!', 'success');
    
    // Reset form
    e.target.reset();
    
    // In a real application, you would send this data to a server
    console.log('Contact form submitted:', { name, email, subject, message });
}

// Project modal functionality
function showProjectModal(projectCard) {
    const title = projectCard.querySelector('h5').textContent;
    const description = projectCard.querySelector('p').textContent;
    const image = projectCard.querySelector('img').src;
    const sourceLink = projectCard.getAttribute('data-link'); // 👈 unique per project

    const modalContent = `
    <div class="project-modal">
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <img src="${image}" alt="${title}" class="modal-image pixelated">
            <p>${description}</p>
            <div class="modal-actions">
                <a href="${sourceLink}" target="_blank" rel="noopener noreferrer">
                    <button class="retro-btn">Source Code</button>
                </a>
            </div>
        </div>
    </div>
    `;

    
    // Show modal
    showRetroModal(modalContent);
}

// Start menu functionality
function showStartMenu() {
    const startMenuContent = `
        <div class="start-menu">
            <div class="start-menu-header">
                <h3>Portfolio OS</h3>
            </div>
            <div class="start-menu-items">
                <div class="start-menu-item" onclick="showWindow('about-window')">
                    <i class="fas fa-user"></i>
                    <span>About Me</span>
                </div>
                <div class="start-menu-item" onclick="showWindow('skills-window')">
                    <i class="fas fa-code"></i>
                    <span>Skills</span>
                </div>
                <div class="start-menu-item" onclick="showWindow('projects-window')">
                    <i class="fas fa-folder"></i>
                    <span>Projects</span>
                </div>
                <div class="start-menu-item" onclick="showWindow('contact-window')">
                    <i class="fas fa-envelope"></i>
                    <span>Contact</span>
                </div>
                <hr>
                <div class="start-menu-item" onclick="location.reload()">
                    <i class="fas fa-redo"></i>
                    <span>Restart</span>
                </div>
            </div>
        </div>
    `;
    
    showRetroModal(startMenuContent);
}

// Utility functions
function showRetroAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `retro-alert ${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
            <button class="alert-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.remove();
    }, 3000);
    
    // Manual close
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.remove();
    });
}

function showRetroModal(content) {
    const modal = document.createElement('div');
    modal.className = 'retro-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal on close button click
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + number keys to switch windows
    if (e.altKey) {
        switch(e.key) {
            case '1':
                showWindow('about-window');
                break;
            case '2':
                showWindow('skills-window');
                break;
            case '3':
                showWindow('projects-window');
                break;
            case '4':
                showWindow('contact-window');
                break;
        }
    }
    
    // ESC to close active window
    if (e.key === 'Escape' && activeWindow) {
        activeWindow.classList.remove('active');
        activeWindow = null;
    }
});

// Add CSS for additional modal styles
const additionalStyles = `
    .retro-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--window-bg);
        border: 2px outset #CCCCCC;
        border-radius: 4px;
        padding: 15px;
        z-index: 9999;
        box-shadow: 4px 4px 8px var(--shadow-color);
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .alert-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .alert-content i {
        color: var(--accent-color);
    }
    
    .alert-close {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #666;
    }
    
    .retro-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
        background: var(--window-bg);
        border: 2px outset #CCCCCC;
        border-radius: 8px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        z-index: 1;
    }
    
    .modal-header {
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        font-family: 'Press Start 2P', cursive;
        font-size: 12px;
        margin: 0;
    }
    
    .close-modal {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        margin-bottom: 15px;
        border: 2px solid var(--border-color);
    }
    
    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .start-menu {
        min-width: 200px;
    }
    
    .start-menu-header {
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 10px 15px;
        text-align: center;
    }
    
    .start-menu-header h3 {
        font-family: 'Press Start 2P', cursive;
        font-size: 12px;
        margin: 0;
    }
    
    .start-menu-items {
        padding: 10px 0;
    }
    
    .start-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    .start-menu-item:hover {
        background: rgba(255, 107, 157, 0.1);
    }
    
    .start-menu-item i {
        color: var(--accent-color);
        width: 16px;
    }
    
    .start-menu-item span {
        font-family: 'Press Start 2P', cursive;
        font-size: 10px;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Add some easter eggs
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        showRetroAlert('Konami Code activated! 🎮', 'success');
        // Add some special effects
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 2000);
        konamiCode = [];
    }
});

// Console welcome message
console.log(`
%c
██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 

Welcome to Chia Yong's Retro Portfolio!
Try using keyboard shortcuts:
- Alt+1: About Me
- Alt+2: Skills
- Alt+3: Projects  
- Alt+4: Contact
- ESC: Close active window

Want to see something cool? Try the Konami Code! ↑↑↓↓←→←→BA
`, 'color: #FF6B9D; font-family: monospace;');
