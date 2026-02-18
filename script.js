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

// 3D Tilt & Drag Logic
let isDragging = false;
let startX, startY;
let currentX = 0;
let currentY = 0;
let rotationX = 0;
let rotationY = 0;
let baseRotationY = 0; // Tracks the "home" position (0, 180, -180)
let currentProfile = 'orbital'; // orbital, A, hm

// Mouse Events for Dragging
document.addEventListener('mousedown', (e) => {
    // Only drag if not clicking interactive elements
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.tag-item') || e.target.closest('.back-btn')) return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // Disable transition for instant drag response
    cardInner.style.transition = 'none';
    cardTarget.style.transition = 'none';
    root.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Update rotation based on drag distance
        // X axis rotation (tilt up/down) - limited
        // Y axis rotation (spin left/right) - unlimited
        rotationY += deltaX * 0.5; // Sensitivity
        rotationX -= deltaY * 0.5; 
        
        // Clamp X rotation to avoid flipping upside down too much
        rotationX = Math.max(-60, Math.min(60, rotationX));

        // Determine content based on rotationY
        // Normalized angle to -180...180 range roughly
        let angle = rotationY % 360;
        
        // Logic:
        // 0 -> Front (Orbital)
        // > 90 (Right Flip) -> HM
        // < -90 (Left Flip) -> A
        
        if (angle > 90 && angle < 270) {
            if (currentProfile !== 'hm') {
                setBackProfile('hm');
                currentProfile = 'hm';
            }
        } else if (angle < -90 && angle > -270) {
            if (currentProfile !== 'A') {
                setBackProfile('A');
                currentProfile = 'A';
            }
        } else {
            currentProfile = 'orbital';
        }

        // Apply transform
        cardInner.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
        
        // Update start position for next frame
        startX = e.clientX;
        startY = e.clientY;
    } else {
        // Optional: Keep subtle tilt effect when not dragging
        const box = root.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const tiltX = (centerY - e.clientY) / 50;
        const tiltY = (e.clientX - centerX) / 50;
        
        // Apply tilt to outer card wrapper, while inner handles rotation
        cardTarget.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        root.style.cursor = 'default';
        
        // Smart Snap Logic
        // Find closest snap point: 0, 180 (HM), -180 (A)
        let snapY = 0;
        let angle = rotationY % 360;

        if (angle > 90 && angle < 270) {
            snapY = 180; // Snap to HM
            baseRotationY = 180;
            if (currentProfile !== 'hm') setBackProfile('hm');
        } else if (angle < -90 && angle > -270) {
            snapY = -180; // Snap to A
            baseRotationY = -180;
            if (currentProfile !== 'A') setBackProfile('A');
        } else {
            snapY = 0; // Snap to Front
            baseRotationY = 0;
        }

        // Adjust rotationY to be continuous but snap to the visual target
        // We want the closest multiple of 360 + snap offset
        const cycle = Math.round(rotationY / 360);
        rotationY = (cycle * 360) + snapY;

        // Reset X tilt
        rotationX = 0;

        // Re-enable smooth transition for snaps/buttons
        cardInner.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cardTarget.style.transition = 'transform 0.1s';
        
        // Apply snap
        cardInner.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    }
});

document.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        root.style.cursor = 'default';
        
        // Snap back to baseRotationY
        rotationY = baseRotationY;
        rotationX = 0;

        cardInner.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cardInner.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    }
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
    orbital: {
        name: "Orbital",
        role: "Profile View",
        bio: "Select a profile to view details.",
        color: "rgba(255, 255, 255, 0.1)",
        avatar: "https://i.imgur.com/6Xy1F5a.png" // Fallback or transparent
    },
    body: {
        name: "Body",
        role: "The Heart",
        bio: "Passionate and full of life. Always there to support and love.",
        color: "rgba(255, 50, 50, 0.2)",
        avatar: "https://i.pinimg.com/736x/c0/27/7f/c0277f9d0c26804820d91a1346387877.jpg" // Romantic/Red aesthetic
    },
    hm: {
        name: "HM",
        role: "The Crown",
        bio: "Loyal friend and a true king. Standing strong together.",
        color: "rgba(255, 215, 0, 0.2)",
        avatar: "https://i.pinimg.com/736x/89/90/48/899048ab0cc455154006fdb9623dcb63.jpg" // Gold/Crown aesthetic
    }
};

// Generic placeholder if image fails
const GENERIC_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

function setBackProfile(key) {
    const data = PROFILES[key];
    if (!data) return;

    // Update Content with animation
    // We can add a fade effect here if needed, but simple replacement is fine for now
    backName.textContent = data.name;
    backRole.textContent = data.role;
    backBio.textContent = data.bio;
    
    // Update Avatar
    // Use a solid color or gradient if no image, or generic
    backAvatar.style.backgroundImage = `url('${data.avatar}')`;
    // Add error handling for image
    const img = new Image();
    img.src = data.avatar;
    img.onerror = () => {
        backAvatar.style.backgroundImage = `linear-gradient(135deg, ${data.color}, #000)`;
    };
    
    // Update Theme Colors (optional)
    const cardBack = document.querySelector('.card-face.back');
    if (key === 'body') {
        cardBack.style.background = 'rgba(20, 0, 0, 0.85)';
        cardBack.style.borderColor = 'rgba(255, 50, 50, 0.3)';
        backAvatar.style.boxShadow = '0 0 20px rgba(255, 50, 50, 0.4)';
    } else if (key === 'hm') {
        cardBack.style.background = 'rgba(20, 15, 0, 0.85)';
        cardBack.style.borderColor = 'rgba(255, 215, 0, 0.3)';
        backAvatar.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
    } else {
        cardBack.style.background = 'rgba(10, 10, 10, 0.85)';
        cardBack.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        backAvatar.style.boxShadow = 'none';
    }
}
 
 function flipToBack() {
    // This is called by buttons only
    // If we click HM, go to 180
    // If we click body, go to -180? Or just 180 with content change?
    
    // To be consistent with drag logic:
    // HM -> Positive Rotation (180)
    // body -> Negative Rotation (-180)
    
    // Logic is handled in button listeners below now
 }

 function flipToFront() {
    baseRotationY = 0;
    rotationY = 0;
    rotationX = 0;
    cardInner.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
 }

 btnBody.addEventListener('click', (e) => {
     e.stopPropagation(); 
     setBackProfile('body');
     // Animate to -180 (Left Spin)
     baseRotationY = -180;
     rotationY = -180;
     rotationX = 0;
     cardInner.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
 });
 
 btnHm.addEventListener('click', (e) => {
     e.stopPropagation();
     setBackProfile('hm');
     // Animate to 180 (Right Spin)
     baseRotationY = 180;
     rotationY = 180;
     rotationX = 0;
     cardInner.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
 });
 
 btnBack.addEventListener('click', (e) => {
     e.stopPropagation();
     flipToFront();
 });

