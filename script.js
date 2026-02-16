const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
const SIMILAR = /[ilLI|1oO0]/g;
const AMBIGUOUS = /[{}[\]()/\\'"~,;.<>]/g;

let options = {
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    quantity: 3
};

let passwords = [];
let copiedIndex = null;
let copyHistory = [];
let showHistory = false;
let visiblePasswords = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
let copyTimeout = null;
let toastTimeout = null;

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function colorizePassword(password) {
    return [...password].map(ch => {
        if (/[a-z]/.test(ch)) return `<span class="pw-char-lower">${escapeHtml(ch)}</span>`;
        if (/[A-Z]/.test(ch)) return `<span class="pw-char-upper">${escapeHtml(ch)}</span>`;
        if (/[0-9]/.test(ch)) return `<span class="pw-char-number">${escapeHtml(ch)}</span>`;
        return `<span class="pw-char-symbol">${escapeHtml(ch)}</span>`;
    }).join("");
}

function showToast(message) {
    const toast = document.getElementById("copy-toast");
    toast.querySelector("span").textContent = message || "Copied to clipboard!";
    toast.classList.add("visible");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2000);
}

function generatePassword(opts) {
    let chars = "";
    const required = [];

    if (opts.lowercase) {
        let set = LOWERCASE;
        if (opts.excludeSimilar) set = set.replace(SIMILAR, "");
        chars += set;
        required.push(set.charAt(Math.floor(Math.random() * set.length)));
    }
    if (opts.uppercase) {
        let set = UPPERCASE;
        if (opts.excludeSimilar) set = set.replace(SIMILAR, "");
        chars += set;
        required.push(set.charAt(Math.floor(Math.random() * set.length)));
    }
    if (opts.numbers) {
        let set = NUMBERS;
        if (opts.excludeSimilar) set = set.replace(SIMILAR, "");
        chars += set;
        required.push(set.charAt(Math.floor(Math.random() * set.length)));
    }
    if (opts.symbols) {
        let set = SYMBOLS;
        if (opts.excludeAmbiguous) set = set.replace(AMBIGUOUS, "");
        chars += set;
        required.push(set.charAt(Math.floor(Math.random() * set.length)));
    }

    if (chars.length === 0) return "";

    const arr = [...required];
    for (let i = required.length; i < opts.length; i++) {
        arr.push(chars.charAt(Math.floor(Math.random() * chars.length)));
    }

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join("");
}

function calculateStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (password.length >= 24) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (new Set(password).size >= password.length * 0.7) score++;
    return Math.min(score, 9);
}

function getStrengthInfo(score) {
    if (score <= 2) return { label: "Very Weak", color: "text-red-400", bg: "bg-red-500", icon: "shield-x" };
    if (score <= 4) return { label: "Weak", color: "text-orange-400", bg: "bg-orange-500", icon: "shield-alert" };
    if (score <= 6) return { label: "Fair", color: "text-yellow-400", bg: "bg-yellow-500", icon: "shield" };
    if (score <= 8) return { label: "Strong", color: "text-emerald-400", bg: "bg-emerald-500", icon: "shield-check" };
    return { label: "Very Strong", color: "text-cyan-400", bg: "bg-cyan-400", icon: "shield-check" };
}

function getEntropy(password, opts) {
    let poolSize = 0;
    if (opts.lowercase) poolSize += 26;
    if (opts.uppercase) poolSize += 26;
    if (opts.numbers) poolSize += 10;
    if (opts.symbols) poolSize += SYMBOLS.length;
    if (poolSize === 0) return 0;
    return Math.round(password.length * Math.log2(poolSize));
}

function getCrackTime(entropy) {
    if (entropy < 30) return "Instantly";
    if (entropy < 40) return "Seconds";
    if (entropy < 50) return "Minutes";
    if (entropy < 60) return "Hours";
    if (entropy < 70) return "Days";
    if (entropy < 80) return "Years";
    if (entropy < 100) return "Millennia";
    if (entropy < 128) return "Millions of years";
    return "Eternity ♾️";
}

function generate() {
    passwords = [];
    for (let i = 0; i < options.quantity; i++) {
        passwords.push(generatePassword(options));
    }
    copiedIndex = null;
    renderPasswords();
    renderStats();
}

function renderPasswords() {
    const container = document.getElementById("passwords-list");
    const hasAny = options.lowercase || options.uppercase || options.numbers || options.symbols;
    const warning = document.getElementById("no-charset-warning");

    warning.style.display = hasAny ? "none" : "flex";

    if (!hasAny) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = passwords.map((pw, i) => {
        const strength = calculateStrength(pw);
        const info = getStrengthInfo(strength);
        const isVisible = visiblePasswords.has(i);
        const isCopied = copiedIndex === i;

        const bars = Array.from({ length: 5 }).map((_, j) =>
            `<div class="h-1.5 w-6 rounded-full transition-all duration-500 ${j < Math.ceil(strength / 2) ? info.bg : 'bg-white/[0.06]'}" style="transition-delay:${j * 80}ms"></div>`
        ).join("");

        const displayPw = isVisible ? colorizePassword(pw) : escapeHtml(pw);

        return `
            <div class="group relative animate-fade-in" style="animation-delay:${i * 60}ms">
                <div class="relative flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 sm:p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]">
                    <div class="flex-1 min-w-0 overflow-hidden">
                        <p class="font-mono text-sm sm:text-base md:text-lg tracking-wider break-all transition-all duration-300 ${isVisible ? '' : 'text-white blur-sm select-none'}">${displayPw || '—'}</p>
                    </div>
                    <div class="flex items-center gap-0.5 sm:gap-1 shrink-0">
                        <button data-action="toggle-visibility" data-index="${i}" class="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-white/10 active:bg-white/15 hover:text-white cursor-pointer" title="${isVisible ? 'Hide password' : 'Show password'}">
                            <i data-lucide="${isVisible ? 'eye' : 'eye-off'}" class="w-4 h-4"></i>
                        </button>
                        <button data-action="copy" data-index="${i}" class="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition-all cursor-pointer ${isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:bg-white/10 active:bg-white/15 hover:text-white'}" title="Copy to clipboard">
                            <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                ${pw ? `
                    <div class="mt-1.5 sm:mt-2 flex items-center gap-2 px-1">
                        <i data-lucide="${info.icon}" class="w-3.5 h-3.5 ${info.color}"></i>
                        <span class="text-[11px] sm:text-xs font-medium ${info.color}">${info.label}</span>
                        <div class="ml-auto flex gap-0.5">${bars}</div>
                    </div>
                ` : ''}
            </div>`;
    }).join("");

    lucide.createIcons();
}

function renderStats() {
    const panel = document.getElementById("stats-panel");
    if (passwords.length > 0 && passwords[0]) {
        panel.style.display = "grid";
        const entropy = getEntropy(passwords[0], options);
        document.getElementById("stat-length").textContent = options.length;
        document.getElementById("stat-entropy").innerHTML = `${entropy}<span class="text-sm font-normal text-slate-500 ml-1">bits</span>`;
        document.getElementById("stat-crack").textContent = getCrackTime(entropy);
    } else {
        panel.style.display = "none";
    }
}

async function copyToClipboard(password, index) {
    try {
        await navigator.clipboard.writeText(password);
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = password;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    copiedIndex = index;
    copyHistory.unshift({
        password,
        timestamp: new Date(),
        strength: calculateStrength(password)
    });
    if (copyHistory.length > 50) copyHistory = copyHistory.slice(0, 50);

    showToast("Copied to clipboard!");
    renderPasswords();
    renderHistoryCount();
    if (showHistory) renderHistoryList();

    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
        copiedIndex = null;
        renderPasswords();
    }, 2000);
}

async function copyAllPasswords() {
    const allPw = passwords.join("\n");
    try {
        await navigator.clipboard.writeText(allPw);
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = allPw;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }
    showToast(`Copied ${passwords.length} passwords!`);
}

function togglePasswordVisibility(index) {
    if (visiblePasswords.has(index)) {
        visiblePasswords.delete(index);
    } else {
        visiblePasswords.add(index);
    }
    renderPasswords();
}

function renderHistoryCount() {
    const el = document.getElementById("history-count-text");
    if (copyHistory.length === 0) {
        el.textContent = "No passwords copied yet";
    } else {
        el.textContent = `${copyHistory.length} password${copyHistory.length !== 1 ? 's' : ''} saved`;
    }
}

function renderHistoryList() {
    const emptyEl = document.getElementById("history-empty");
    const entriesEl = document.getElementById("history-entries");
    const listEl = document.getElementById("history-list");

    if (copyHistory.length === 0) {
        emptyEl.style.display = "block";
        entriesEl.style.display = "none";
        return;
    }

    emptyEl.style.display = "none";
    entriesEl.style.display = "block";

    listEl.innerHTML = copyHistory.map((entry) => {
        const info = getStrengthInfo(entry.strength);
        const time = entry.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        return `
            <div class="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-3 hover:bg-white/[0.05] transition-all">
                <i data-lucide="${info.icon}" class="w-4 h-4 shrink-0 ${info.color}"></i>
                <code class="flex-1 truncate font-mono text-sm text-slate-300">${escapeHtml(entry.password)}</code>
                <span class="shrink-0 text-xs text-slate-600">${time}</span>
            </div>`;
    }).join("");

    lucide.createIcons();
}

function toggleHistory() {
    showHistory = !showHistory;
    const content = document.getElementById("history-content");
    const chevron = document.getElementById("history-chevron");

    if (showHistory) {
        content.style.maxHeight = "500px";
        content.style.opacity = "1";
        content.style.marginTop = "1.25rem";
        chevron.style.transform = "rotate(180deg)";
        renderHistoryList();
    } else {
        content.style.maxHeight = "0";
        content.style.opacity = "0";
        content.style.marginTop = "0";
        chevron.style.transform = "rotate(0deg)";
    }
}

function updateSlider() {
    const percent = ((options.length - 4) / (128 - 4)) * 100;
    document.getElementById("slider-fill").style.width = `${percent}%`;
    document.getElementById("length-slider").value = options.length;
    document.getElementById("length-input").value = options.length;
}

function updateToggles() {
    document.querySelectorAll(".toggle-option").forEach(btn => {
        const opt = btn.dataset.option;
        btn.classList.toggle("active", options[opt]);
    });

    document.querySelectorAll(".adv-toggle-switch").forEach(sw => {
        const opt = sw.dataset.option;
        sw.classList.toggle("active", options[opt]);
    });
}

function updateQuantityButtons() {
    document.querySelectorAll(".quantity-btn").forEach(btn => {
        btn.classList.toggle("active", parseInt(btn.dataset.value) === options.quantity);
    });
    document.getElementById("quantity-display").textContent = options.quantity;
}

function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    const ctx = canvas.getContext("2d");

    const COLORS = [
        "139, 92, 246",
        "99, 102, 241",
        "6, 182, 212",
        "192, 132, 252",
        "236, 72, 153",
        "34, 211, 238"
    ];

    let mouse = { x: -1000, y: -1000 };
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
        mouse = { x: e.clientX, y: e.clientY };
    });

    const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.005
        });
    }

    const CONNECTION_DIST = 150;
    const MOUSE_DIST = 200;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.pulse += p.pulseSpeed;

            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;

            const dxM = p.x - mouse.x;
            const dyM = p.y - mouse.y;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM);

            if (distM < MOUSE_DIST) {
                const force = (MOUSE_DIST - distM) / MOUSE_DIST * 0.01;
                p.vx += (dxM / distM) * force;
                p.vy += (dyM / distM) * force;
            }

            p.vx *= 0.999;
            p.vy *= 0.999;

            const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.15;

            const glowRadius = p.radius * 4;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
            gradient.addColorStop(0, `rgba(${p.color}, ${currentOpacity * 0.8})`);
            gradient.addColorStop(0.4, `rgba(${p.color}, ${currentOpacity * 0.3})`);
            gradient.addColorStop(1, `rgba(${p.color}, 0)`);

            ctx.beginPath();
            ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${currentOpacity})`;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const lineOpacity = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${p.color}, ${lineOpacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            if (distM < MOUSE_DIST * 1.5) {
                const lineOpacity = (1 - distM / (MOUSE_DIST * 1.5)) * 0.25;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${p.color}, ${lineOpacity})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

document.addEventListener("DOMContentLoaded", () => {
    initParticles();

    const regenBtn = document.getElementById("regenerate-btn");

    function regenerateWithAnimation() {
        regenBtn.classList.add("regen-spin");
        generate();
        setTimeout(() => regenBtn.classList.remove("regen-spin"), 500);
    }

    document.getElementById("length-slider").addEventListener("input", (e) => {
        options.length = parseInt(e.target.value);
        updateSlider();
        generate();
    });

    document.getElementById("length-input").addEventListener("change", (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v) && v >= 4 && v <= 128) {
            options.length = v;
            updateSlider();
            generate();
        }
    });

    document.getElementById("length-input").addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v) && v >= 4 && v <= 128) {
            options.length = v;
            updateSlider();
            generate();
        }
    });

    document.querySelectorAll(".toggle-option").forEach(btn => {
        btn.addEventListener("click", () => {
            const opt = btn.dataset.option;
            options[opt] = !options[opt];
            updateToggles();
            generate();
        });
    });

    document.querySelectorAll(".adv-toggle-switch").forEach(sw => {
        sw.addEventListener("click", (e) => {
            e.preventDefault();
            const opt = sw.dataset.option;
            options[opt] = !options[opt];
            updateToggles();
            generate();
        });
    });

    document.querySelectorAll(".quantity-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            options.quantity = parseInt(btn.dataset.value);
            updateQuantityButtons();
            generate();
        });
    });

    regenBtn.addEventListener("click", regenerateWithAnimation);
    document.getElementById("history-toggle").addEventListener("click", toggleHistory);
    document.getElementById("copy-all-btn").addEventListener("click", copyAllPasswords);

    document.getElementById("history-clear-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        copyHistory = [];
        renderHistoryCount();
        renderHistoryList();
    });

    document.getElementById("passwords-list").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);

        if (action === "toggle-visibility") {
            togglePasswordVisibility(index);
        } else if (action === "copy") {
            copyToClipboard(passwords[index], index);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.code === "Space") {
            e.preventDefault();
            regenerateWithAnimation();
        }
    });

    lucide.createIcons();
    generate();
});
