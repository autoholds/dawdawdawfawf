export function enableSecurity() {
    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Block keyboard shortcuts
    document.onkeydown = (e) => {
        // F12
        if (e.keyCode === 123) return false;

        // Ctrl+Shift+I, J, C (Inspect, Console)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) return false;

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) return false;
    };
}
