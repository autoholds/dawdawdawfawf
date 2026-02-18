/* 
   =========================================
            GENERAL CONFIGURATION
   =========================================
*/
const BACKGROUND_MUSIC = "Future, Metro Boomin, The Weeknd - We Still Don't Trust You (Official Music Video).mp3";

const CONFIG = {
    discord_id: "141622395273216000",
    typing: ["./Stratup", "Orbital Project.", "Join Our Server", "Discord.gg/ICMP", "Closed Session"]
};

// DOM Elements
const gate = document.getElementById('entry');
const root = document.getElementById('root-container');
const bg = document.getElementById('bg-video');
const song = document.getElementById('audio');
const typeDest = document.getElementById('typing-host');
const cardTarget = document.getElementById('tilt-card');

const dsTag = document.getElementById('ds-tag');
const dsStatus = document.getElementById('ds-status');
const dsPfp = document.getElementById('ds-pfp');
const dsDot = document.getElementById('ds-dot');
const dsDeco = document.getElementById('ds-deco');

// Initialize Music
song.src = BACKGROUND_MUSIC;

// Entry Interaction
gate.addEventListener('click', () => {
    gate.classList.add('hide');
    root.classList.add('anim');

    // Reset and Sync Media
    bg.currentTime = 0;
    song.currentTime = 0;
    song.volume = 0;

    const startMedia = () => {
        bg.play().catch(() => { });
        song.play().catch(() => { });

        // Smooth Volume Fade-in
        let vol = 0;
        const fadeIn = setInterval(() => {
            if (vol < 0.6) {
                vol += 0.05;
                song.volume = vol;
            } else {
                clearInterval(fadeIn);
            }
        }, 100);
    };

    startMedia();
    runTyping();
});

// Sync Logic: Keeps audio and video locked
const syncMedia = () => {
    if (Math.abs(song.currentTime - bg.currentTime) > 0.1) {
        song.currentTime = bg.currentTime;
    }
};

bg.addEventListener('timeupdate', syncMedia);
bg.addEventListener('play', () => song.play().catch(() => { }));
bg.addEventListener('pause', () => song.pause());
bg.addEventListener('seeking', () => { song.currentTime = bg.currentTime; });

// Loop Fix
bg.addEventListener('play', () => {
    if (bg.currentTime < 0.3) song.currentTime = 0;
});

// Typing Effect
let textPtr = 0, charPtr = 0, rev = false;
function runTyping() {
    const word = CONFIG.typing[textPtr];
    typeDest.textContent = rev ? word.substring(0, charPtr - 1) : word.substring(0, charPtr + 1);
    charPtr = rev ? charPtr - 1 : charPtr + 1;
    
    let tick = rev ? 40 : 100;
    if (!rev && charPtr === word.length) { 
        tick = 2000; 
        rev = true; 
    } else if (rev && charPtr === 0) { 
        rev = false; 
        textPtr = (textPtr + 1) % CONFIG.typing.length; 
        tick = 800; 
    }
    setTimeout(runTyping, tick);
}

// 3D Tilt Effect
document.addEventListener('mousemove', (e) => {
    const box = root.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const angleX = (centerY - e.clientY) / 35;
    const angleY = (e.clientX - centerX) / 35;
    cardTarget.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
});

// Notifications
function triggerNotif(msg) {
    const toast = document.getElementById('notif');
    toast.textContent = msg;
    toast.classList.add('pop');
    setTimeout(() => toast.classList.remove('pop'), 2500);
}

document.getElementById('btc-copy').onclick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('bc1qzhvna9khkmtac8nn82lh2xkjnqj3npqhdc873h');
    triggerNotif('BTC Copied!');
};

document.getElementById('ltc-copy').onclick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('LWa2SekbuQbgVX5vv45nX9NrAkMGc9bPzP');
    triggerNotif('LTC Copied!');
};

// Lanyard Discord Presence
async function fetchDiscordPresence() {
    if (!CONFIG.discord_id) return;
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discord_id}`);
        const data = await response.json();
        if (data.success) {
            const presence = data.data;
            const user = presence.discord_user;

            // Update UI
            dsTag.textContent = user.global_name || user.username;
            dsPfp.style.backgroundImage = `url('https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=160')`;

            // Avatar Decoration
            const decoData = user.avatar_decoration_data;
            if (decoData && decoData.asset) {
                dsDeco.style.backgroundImage = `url('https://cdn.discordapp.com/avatar-decoration-presets/${decoData.asset}.png')`;
                dsDeco.style.display = 'block';
            } else {
                dsDeco.style.display = 'none';
            }

            // Status Dot
            const colors = { online: '#23a559', idle: '#f0b232', dnd: '#f23f43', offline: '#747f8d' };
            dsDot.style.background = colors[presence.discord_status] || colors.offline;

            // Activity
            if (presence.listening_to_spotify) {
                dsStatus.textContent = `Listening to Spotify: ${presence.spotify.song}`;
            } else if (presence.activities.length > 0) {
                const act = presence.activities.find(x => x.type !== 4) || presence.activities[0];
                dsStatus.textContent = act.state ? `${act.name}: ${act.state}` : `Playing ${act.name}`;
            } else {
                dsStatus.textContent = presence.discord_status.toUpperCase();
            }
        }
    } catch (err) { console.error("Lanyard Error:", err); }
}

fetchDiscordPresence();
setInterval(fetchDiscordPresence, 15000);

// Marquee Title
let marqueeText = "Discord.gg/ICMP - Orbital - ";
setInterval(() => {
    marqueeText = marqueeText.substring(1) + marqueeText.substring(0, 1);
    document.title = marqueeText;
}, 300);

// Security Features
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.onkeydown = (e) => {
    // Block F12
    if (e.keyCode === 123) return false;
    // Block DevTools Shortcuts
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) return false;
    // Block View Source
    if (e.ctrlKey && e.keyCode === 85) return false;
};

// View Counter
let counter = parseInt(localStorage.getItem('orb_views') || '1434') + 1;
localStorage.setItem('orb_views', counter);
document.getElementById('views-val').textContent = counter.toLocaleString();

/* 
   =========================================
            FLIP CARD LOGIC
   =========================================
*/
const cardInner = document.querySelector('.card-inner');
const btnBody = document.getElementById('btn-body');
const btnHm = document.getElementById('btn-hm');
const btnBack = document.getElementById('btn-back');

// Elements to update on back face
const backAvatar = document.getElementById('back-avatar');
const backName = document.getElementById('back-name');
const backRole = document.getElementById('back-role');
const backBio = document.getElementById('back-bio');

// Profile Data
const PROFILES = {
    body: {
        name: "Body",
        role: "My Love",
        avatar: "https://i.pinimg.com/736x/8e/4a/1c/8e4a1c0d5d5d8e2d4d0d0d0d0d0d0d0d.jpg", // Placeholder
        bio: "The only one who owns my heart. Forever and always.",
        color: "#ff5e78" // Heart color
    },
    hm: {
        name: "HM",
        role: "Best Friend",
        avatar: "https://i.pinimg.com/736x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7.jpg", // Placeholder
        bio: "Real ones stay. Loyalty over everything.",
        color: "#ffd700" // Gold color
    }
};

// Generic placeholder if image fails
const GENERIC_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

function setBackProfile(key) {
    const data = PROFILES[key];
    if (!data) return;

    // Update Content
    backName.textContent = data.name;
    backRole.textContent = data.role;
    backBio.textContent = data.bio;
    
    // Style adjustments
    backRole.style.borderColor = data.color;
    backRole.style.color = data.color;
    backRole.style.boxShadow = `0 0 10px ${data.color}40`;

    // Avatar
    // Use a solid color or gradient if no image, or generic
    backAvatar.style.backgroundImage = `url('${GENERIC_AVATAR}')`; 
    // If you have real URLs, uncomment below:
    // backAvatar.style.backgroundImage = `url('${data.avatar}')`;
    
    // For now, let's use a colored placeholder based on role
    if(key === 'body') {
         backAvatar.style.backgroundImage = "url('https://i.pinimg.com/564x/f3/d3/f0/f3d3f0a0a0a0a0a0a0a0a0a0a0a0a0a0.jpg')"; // Romantic vibe
    } else {
         backAvatar.style.backgroundImage = "url('https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6.jpg')"; // Dark/Cool vibe
    }
    // Since I don't have real URLs, I'll keep the main avatar style or use the color
    backAvatar.style.border = `2px solid ${data.color}`;
}

btnBody.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent tilt reset if needed
    setBackProfile('body');
    cardInner.classList.add('is-flipped');
});

btnHm.addEventListener('click', (e) => {
    e.stopPropagation();
    setBackProfile('hm');
    cardInner.classList.add('is-flipped');
});

btnBack.addEventListener('click', (e) => {
    e.stopPropagation();
    cardInner.classList.remove('is-flipped');
});

