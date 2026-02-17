import { APP_CONFIG } from './config.js';

export class DiscordPresence {
    constructor() {
        this.elements = {
            tag: document.getElementById('ds-tag'),
            status: document.getElementById('ds-status'),
            pfp: document.getElementById('ds-pfp'),
            dot: document.getElementById('ds-dot'),
            deco: document.getElementById('ds-deco')
        };
        
        this.statusColors = {
            online: '#23a559',
            idle: '#f0b232',
            dnd: '#f23f43',
            offline: '#747f8d'
        };
    }

    async init() {
        if (!APP_CONFIG.discordId) return;
        await this.fetchData();
        setInterval(() => this.fetchData(), 15000);
    }

    async fetchData() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${APP_CONFIG.discordId}`);
            const { success, data } = await response.json();

            if (success) {
                this.updateUI(data);
            }
        } catch (error) {
            // Silently fail or log to a debug service (not console to avoid user visibility if possible)
        }
    }

    updateUI(presence) {
        const user = presence.discord_user;
        const { tag, pfp, deco, dot, status } = this.elements;

        // User Info
        tag.textContent = user.global_name || user.username;
        pfp.style.backgroundImage = `url('https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=160')`;

        // Decoration
        if (user.avatar_decoration_data?.asset) {
            deco.style.backgroundImage = `url('https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png')`;
            deco.style.display = 'block';
        } else {
            deco.style.display = 'none';
        }

        // Status Dot
        dot.style.background = this.statusColors[presence.discord_status] || this.statusColors.offline;

        // Activity Status
        if (presence.listening_to_spotify) {
            status.textContent = `Listening to Spotify: ${presence.spotify.song}`;
        } else if (presence.activities.length > 0) {
            const activity = presence.activities.find(x => x.type !== 4) || presence.activities[0];
            status.textContent = activity.state ? `${activity.name}: ${activity.state}` : `Playing ${activity.name}`;
        } else {
            status.textContent = presence.discord_status.toUpperCase();
        }
    }
}
