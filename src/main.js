import './styles.css';
import { UIManager } from './modules/ui.js';
import { AudioManager } from './modules/audio.js';
import { DiscordPresence } from './modules/discord.js';
import { enableSecurity } from './modules/security.js';

// Initialize the Application
document.addEventListener('DOMContentLoaded', () => {
    // 1. UI Elements (Tilt, Typing, Notifications)
    const ui = new UIManager();
    ui.init();

    // 2. Audio/Video Sync
    const audio = new AudioManager();
    audio.init();

    // 3. Discord Lanyard API
    const discord = new DiscordPresence();
    discord.init();

    // 4. Security (Anti-Debug)
    enableSecurity();
});
