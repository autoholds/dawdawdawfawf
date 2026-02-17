import { APP_CONFIG } from './config.js';

export class UIManager {
    constructor() {
        this.typingElement = document.getElementById('typing-host');
        this.tiltCard = document.getElementById('tilt-card');
        this.notifElement = document.getElementById('notif');
    }

    init() {
        this.setupTyping();
        this.setupTilt();
        this.setupNotifications();
        this.setupMarquee();
        this.setupViews();
    }

    setupTyping() {
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const texts = APP_CONFIG.typingText;
        const element = this.typingElement;

        const typeLoop = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 40 : 100;

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500; // Pause before next word
            }

            setTimeout(typeLoop, typeSpeed);
        };

        typeLoop();
    }

    setupTilt() {
        const root = document.getElementById('root-container');
        document.addEventListener('mousemove', (e) => {
            const rect = root.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const rotateX = (centerY - e.clientY) / 35;
            const rotateY = (e.clientX - centerX) / 35;
            
            this.tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    }

    setupNotifications() {
        // Copy functionality
        const copyToClipboard = (text, message) => {
            navigator.clipboard.writeText(text);
            this.showNotification(message);
        };

        const btcBtn = document.getElementById('btc-copy');
        const ltcBtn = document.getElementById('ltc-copy');

        if (btcBtn) {
            btcBtn.onclick = (e) => {
                e.preventDefault();
                copyToClipboard(APP_CONFIG.socials.btc, 'BTC Copied!');
            };
        }

        if (ltcBtn) {
            ltcBtn.onclick = (e) => {
                e.preventDefault();
                copyToClipboard(APP_CONFIG.socials.ltc, 'LTC Copied!');
            };
        }
    }

    showNotification(msg) {
        this.notifElement.textContent = msg;
        this.notifElement.classList.add('pop');
        setTimeout(() => {
            this.notifElement.classList.remove('pop');
        }, 2500);
    }

    setupMarquee() {
        let titleText = "Discord.gg/ICMP - Orbital - ";
        setInterval(() => {
            titleText = titleText.substring(1) + titleText.substring(0, 1);
            document.title = titleText;
        }, 300);
    }

    setupViews() {
        // Simple view counter simulation using localStorage
        const viewsElement = document.getElementById('views-val');
        if (viewsElement) {
            let count = parseInt(localStorage.getItem('page_views') || '1434');
            count++;
            localStorage.setItem('page_views', count.toString());
            viewsElement.textContent = count.toLocaleString();
        }
    }
}
