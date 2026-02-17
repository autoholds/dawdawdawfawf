import { APP_CONFIG } from './config.js';

export class AudioManager {
    constructor() {
        this.bgVideo = document.getElementById('bg-video');
        this.bgMusic = document.getElementById('audio');
        this.entryScreen = document.getElementById('entry');
        this.rootContainer = document.getElementById('root-container');
    }

    init() {
        this.bgMusic.src = APP_CONFIG.assets.bgMusic;
        this.setupListeners();
        this.setupSync();
    }

    setupListeners() {
        // Start on entry click
        this.entryScreen.addEventListener('click', () => {
            this.entryScreen.classList.add('hide');
            this.rootContainer.classList.add('anim');
            this.startPlayback();
        });
    }

    startPlayback() {
        // Reset
        this.bgVideo.currentTime = 0;
        this.bgMusic.currentTime = 0;
        this.bgMusic.volume = 0;

        // Play
        this.bgVideo.play().catch(e => console.log("Video Play Error:", e));
        this.bgMusic.play().catch(e => console.log("Audio Play Error:", e));

        // Fade In
        let volume = 0;
        const fadeInterval = setInterval(() => {
            if (volume < 0.6) {
                volume += 0.05;
                this.bgMusic.volume = volume;
            } else {
                clearInterval(fadeInterval);
            }
        }, 100);
    }

    setupSync() {
        const sync = () => {
            if (Math.abs(this.bgMusic.currentTime - this.bgVideo.currentTime) > 0.1) {
                this.bgMusic.currentTime = this.bgVideo.currentTime;
            }
        };

        this.bgVideo.addEventListener('timeupdate', sync);
        this.bgVideo.addEventListener('play', () => this.bgMusic.play().catch(() => {}));
        this.bgVideo.addEventListener('pause', () => this.bgMusic.pause());
        this.bgVideo.addEventListener('seeking', () => { this.bgMusic.currentTime = this.bgVideo.currentTime; });

        // Loop Sync Fix
        this.bgVideo.addEventListener('play', () => {
            if (this.bgVideo.currentTime < 0.3) this.bgMusic.currentTime = 0;
        });
    }
}
