// --- 1. การตั้งค่าเริ่มต้น และข้อมูล Bubble ---
const bubbleConfig = [
    { x: 65, y: 75, showAt: 5,   msg: "มันไม่ใช่งานอะไรหรอก อิอิ 😛" },
    { x: -10, y: 70, showAt: 25,  msg: "วันนี้มีของขวัญเล็กๆ มาให้ 🎁" },
    { x: 10, y: 50, showAt: 40,  msg: "ดูเอาเองนะจั๊ฟ " },
    { x: 60, y: 45, showAt: 60,  msg: "เนื่องในโอกาสวันวาเลนไทน์ 🌷" },
    { x: 0, y: 30, showAt: 75,   msg: "กับวันเกิดย้อนหลัง 5555 🌸" },
    { x: 50, y: 15, showAt: 99,  msg: "หวังว่าเธอจะชอบนะ ^ ^ 😛" }
];

const garden = document.getElementById('garden');
const percentEl = document.getElementById('percent');
const stage = document.getElementById('loaderStage');
const bubbleLayer = document.getElementById('bubbleLayer');
const contentGroup = document.getElementById('contentGroup');
const bouquetOverlay = document.getElementById('bouquet-overlay');
const letterContainer = document.getElementById('letter-container');

const bgMusic = document.getElementById('bgMusic');
const mainText = document.getElementById('mainText');
const fullMessage = document.getElementById('fullMessage');
const hintText = document.getElementById('hintText');
const draggableLetter = document.getElementById('draggableLetter');
const envelope = document.getElementById('envelope');
const bouquetImg = document.querySelector('.bouquet-img');

const FLOWER_COUNT = 14;
const plants = [];
const activeBubbles = new Set();
let progress = 0;
let isReady = false;
let letterState = 0; // 0: Loading, 1: Hiding, 2: Ready to Open, 3: Dragging/Final
let clickCount = 0;

// --- 2. ฟังก์ชันสร้างสวน (Initial Garden) ---
function initGarden() {
    for (let i = 0; i < FLOWER_COUNT; i++) {
        const stem = document.createElement('div');
        stem.className = 'stem sway';
        stem.style.left = `${2.5 + (Math.random() * 90)}%`;
        stem.style.animationDelay = `${Math.random() * 3}s`;
        
        for(let j=0; j<2; j++) {
            const leaf = document.createElement('div');
            leaf.className = `leaf ${j % 2 === 0 ? 'left' : 'right'}`;
            leaf.style.bottom = (20 + Math.random() * 30) + "%";
            stem.appendChild(leaf);
        }

        const isTulip = Math.random() > 0.5;
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.innerHTML = isTulip ? 
            `<div class="tulip-wrap"><div class="t-petal side-l"></div><div class="t-petal side-r"></div><div class="t-petal front"></div></div>` :
            `<div class="carnation-wrap"><div class="c-layer bottom"></div><div class="c-layer mid"></div><div class="c-layer top"></div></div>`;
        
        stem.appendChild(flower);
        garden.appendChild(stem);
        plants.push({ el: stem, maxH: 30 + (Math.random() * 30) });
    }
}

// --- 3. ฟังก์ชันระบบ Loading ---
function createBubble(data) {
    const b = document.createElement('div');
    b.className = 'bubble active';
    b.innerText = data.msg;
    b.style.left = data.x + "%"; b.style.top = data.y + "%";
    bubbleLayer.appendChild(b);
    if (data.showAt < 100) {
        setTimeout(() => { b.classList.remove('active'); setTimeout(() => b.remove(), 500); }, 4000);
    }
}

function updateUI(val) {
    plants.forEach(p => {
        p.el.style.height = `${(val/100) * p.maxH}%`;
        if(val > 25) p.el.classList.add('is-growing');
    });
    bubbleConfig.forEach((data, index) => {
        if (val >= data.showAt && !activeBubbles.has(index)) {
            createBubble(data); activeBubbles.add(index);
        }
    });
    percentEl.innerText = Math.floor(val) + "%";
}

function startLoading() {
    const interval = setInterval(() => {
        progress += 0.3 + (Math.random() * 0.3);
        if (progress <= 100) { updateUI(progress); } 
        else { clearInterval(interval); completeLoading(); }
    }, 30);
}

function completeLoading() {
    isReady = true;
    percentEl.innerText = "TOUCH THE SCREEN";
    percentEl.style.color = "#fde047";
    percentEl.classList.add('pulse-hint');
    for(let i=0; i<40; i++) createSparkle();
}

function createSparkle() {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = Math.random() * 5 + 3;
    s.style.width = size + "px"; s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
    stage.appendChild(s);
    s.animate([
        { transform: 'translateY(0) scale(0)', opacity: 0 },
        { transform: `translateY(-${150 + Math.random()*200}px) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: 'translateY(-400px) scale(0)', opacity: 0 }
    ], { duration: 2000 + Math.random()*2000, iterations: Infinity });
}

// --- 4. Logic การปฏิสัมพันธ์ (Interaction Logic) ---

function playMusic() {
    if (bgMusic && bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Music waiting for interaction..."));
    }
}

// คลิกที่พื้นหลังหน้าจอ
// --- 4. Logic การคลิก 3 ครั้ง และการเปิดซอง ---

// คลิกที่พื้นหลังหน้าจอ (เหลือไว้แค่ตอน Loading เสร็จ)
document.body.addEventListener('click', (e) => {
    if (isReady) {
        isReady = false; 
        contentGroup.classList.add('zoom-out-final');
        setTimeout(() => {
            bouquetOverlay.classList.add('show');
            
            // เริ่มต้นการแอบ
            letterContainer.style.display = "block"; 
            letterContainer.classList.add('active', 'hidden-envelope'); 
            letterContainer.style.pointerEvents = "auto"; // ให้จิ้มได้
            letterState = 1; 
        }, 600);
    }
});

// คลิกที่ "ตัวจดหมาย" โดยตรง
letterContainer.addEventListener('click', (e) => {
    e.stopPropagation(); // กันไม่ให้ไปโดน body

    // ขั้นตอน B: จิ้มที่ซองตอนแอบๆ เพื่อให้มันเด้งออกมา (State 1)
    if (letterState === 1) {
        clickCount++;
        
        if (clickCount === 1) {
            letterContainer.style.left = "55%"; // ขยับหนีไปขวา
        } else if (clickCount === 2) {
            letterContainer.style.left = "60%"; // ขยับหนีไปซ้าย
        } else if (clickCount >= 3) {
            // ครั้งที่ 3 เด้งออกมากลางจอ
            letterContainer.classList.remove('hidden-envelope');
            letterContainer.classList.add('pop-out');
            
            letterContainer.style.left = "50%";
            letterContainer.style.top = "50%";
            letterContainer.style.zIndex = "9999"; 
            
            letterState = 2; // เปลี่ยนเป็นสถานะ "รอเปิด"
            clickCount = 0;
        }
        return; // จบการทำงานของคลิกนี้
    }

// ขั้นตอน C: จิ้มที่ซองเพื่อ "เปิด" (State 2)
// ขั้นตอน C: จิ้มที่ซองเพื่อ "เปิด"
// ขั้นตอน C: จิ้มที่ซองเพื่อ "เปิด" (State 2)
if (letterState === 2) {
    letterContainer.classList.add('opened');
    
    setTimeout(() => {
        if(mainText) mainText.innerText = "อ่านทำไม";

        // ปรับให้เลื่อนขึ้นมาที่ -40px (ตำแหน่งมาตรฐานที่เราจะใช้ลากต่อ)
        draggableLetter.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        draggableLetter.style.transform = 'translateX(-50%) translateY(-40px)';
        
        setTimeout(() => {
            letterState = 3; 
            initDrag(); 
            
            // --- โชว์ลูกศรขึ้นมาหลังจากหัวกระดาษนิ่งแล้ว ---
            const arrow = document.getElementById('dragHintArrow');
            if(arrow) arrow.style.opacity = "1";

        }, 400); // รอให้กระดาษเลื่อนขึ้นจนเกือบสุดค่อยโชว์ลูกศร
    }, 0); // รอให้ฝาซองเริ่มอ้าออกนิดหน่อยค่อยเลื่อนกระดาษ
}
});

// --- 5. ระบบลากจดหมาย (Drag & Drop Logic) ---

const contentLines = [
    "ถึง เฟิร์ส โศภิษฐา",  
    "Happy Valentine's Day!",
    "และสุขสันต์วันเกิดย้อนหลังนะ",
    "ก่อนอื่นเลย ขอบคุณนะที่เข้ามาในชีวิตเค้า มันทำให้เค้าดูสดใสขึ้นจริงๆนะ",
    "และก็ขอโทษเรื่องที่ทำให้เธอรู้สึกแย่ในบางครั้งด้วย เค้าไม่อยากให้เธอรู้สึกแบบนั้นเลย",
    "เค้าไม่รู้ว่าเราจะไปกันต่อได้ขนาดไหน แต่เค้าเต็มที่กับเธอเสมอนะ",
    "เรื่องสุขภาพก็เป็นห่วงตัวเองบ้างนะ เพราะเค้าเป็นห่วงเยอะแล้ว 5555",
    "สุดท้ายนี้ก็ขอให้เธอมีความสุขมากๆนะ ไม่ว่าจะยังไงก็ตาม",
    " ",
    "เช็กกี้ ขยี้ใจ"
];


function initDrag() {
    let isDragging = false;
    let startY = 0;
    const draggableLetter = document.getElementById('draggableLetter');
    const envelope = document.querySelector('.envelope-wrapper');

    const start = (e) => {
        if (letterState !== 3) return;
        isDragging = true;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // จังหวะเริ่มลาก: ปิดการซ่อนขอบบนเพื่อให้จดหมายลอยพ้นซองได้
        envelope.style.overflow = "visible";
        draggableLetter.style.zIndex = "100"; // ดีดมาหน้าสุด
        draggableLetter.style.transition = 'none';
    };

    const move = (e) => {
    if (!isDragging || letterState !== 3) return;
    
    const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - startY;
    
    if (deltaY < 0) { // ลากขึ้น
        const pullDistance = Math.abs(deltaY);
        const progress = Math.min(pullDistance / 150, 1);

        // ยืดขนาดตามมือ
        const dynamicWidth = 220 + (100 * progress);
        const dynamicHeight = 100 + (320 * progress);
        
        draggableLetter.style.width = `${dynamicWidth}px`;
        draggableLetter.style.height = `${dynamicHeight}px`;
        
        // ลากขึ้นจากตำแหน่งที่โชว์หัวไว้ (-40px)
        draggableLetter.style.transform = `translateX(-50%) translateY(${deltaY - 40}px)`;
        draggableLetter.style.zIndex = "100"; // ให้ทับซองทันทีที่ลาก

        if (deltaY < -150) {
            isDragging = false;
            finalizeReveal();
        }
    }
};

        const end = () => {
        if (!isDragging) return;
        isDragging = false;
        
        // 1. ดึง Element ลูกศรมาเตรียมไว้
        const arrow = document.getElementById('dragHintArrow');
        
        // 2. เด้งกลับไปที่จุดเดิมหลังจากเปิดซอง คือ -40px (ไม่ใช่ 40px)
        draggableLetter.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        draggableLetter.style.width = '220px';
        draggableLetter.style.height = '100px';
        draggableLetter.style.transform = 'translateX(-50%) translateY(-40px)';
        
        setTimeout(() => {
            if (!isDragging && letterState !== 4) {
                // ซ่อนส่วนที่ล้น (ถ้าต้องการ) แต่ระวังถ้าซ่อนแล้วลูกศรที่ลอยสูงอาจจะหาย
                // envelope.style.overflow = "hidden"; 
                
                draggableLetter.style.zIndex = "100"; 

                // 3. แสดงลูกศรกลับมาอีกครั้งเมื่อกระดาษเด้งกลับที่เดิม
                if(arrow) {
                    arrow.style.opacity = "1";
                }
            }
        }, 600);
    };

    draggableLetter.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    draggableLetter.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
}

async function finalizeReveal() {
    if (typeof letterState !== 'undefined') letterState = 4;

    const envelope = document.querySelector('.envelope-wrapper');
    const bouquetImg = document.querySelector('.bouquet-img');
    const draggableLetter = document.getElementById('draggableLetter');

    // 1. เอฟเฟกต์ซองและดอกไม้
    if(envelope) envelope.classList.add('thrown');
    if(bouquetImg) bouquetImg.classList.add('move-left');

    // 2. ย้ายจดหมายไปที่ Body เพื่อลอยอิสระ
    document.body.appendChild(draggableLetter);
    
    requestAnimationFrame(() => {
        draggableLetter.style.transition = 'all 1.2s cubic-bezier(0.19, 1, 0.22, 1)';
        draggableLetter.style.width = '320px';
        draggableLetter.style.height = 'auto';
        draggableLetter.style.minHeight = '420px';
        
        draggableLetter.style.position = 'fixed';
        draggableLetter.style.top = '50%';
        draggableLetter.style.left = '50%';
        draggableLetter.style.transform = 'translate(-50%, -50%)';
        draggableLetter.style.boxShadow = '0 30px 80px rgba(0,0,0,0.6)';
        draggableLetter.classList.add('is-expanded');

        const mainText = draggableLetter.querySelector('#mainText');
        if(mainText) {
            mainText.style.transition = "opacity 0.6s";
            mainText.style.opacity = "0";
        }
    });

    // 3. เริ่มกระบวนการพิมพ์
    setTimeout(async () => {
        const music = document.getElementById('bgMusic');
        if (music) {
            music.play().then(() => {
                // ค่อยๆ เพิ่มความดัง (Fade-in)
                music.volume = 0;
                let fadeInInterval = setInterval(() => {
                    if (music.volume < 0.9) { // ตั้งค่าความดังสูงสุดที่ 60%
                        music.volume += 0.05;
                    } else {
                        clearInterval(fadeInInterval);
                    }
                }, 100); // ทุก 0.1 วินาที
            }).catch(error => {
                console.warn("Autoplay was prevented, but will play on next click:", error);
            });
        }
        const fullMessage = draggableLetter.querySelector('#fullMessage');
        if(fullMessage) {
            fullMessage.style.display = "block";
            fullMessage.style.opacity = "1";
        }
        
        const lines = [
            draggableLetter.querySelector('#line1'),
            draggableLetter.querySelector('#line2'),
            draggableLetter.querySelector('#line3'),
            draggableLetter.querySelector('#line4'),
            draggableLetter.querySelector('#line5'),
            draggableLetter.querySelector('#line6'),
            draggableLetter.querySelector('#line7'),
            draggableLetter.querySelector('#line8'),
            draggableLetter.querySelector('#line9'),
            draggableLetter.querySelector('#line10')
        ];

        lines.forEach(l => { if(l) l.innerHTML = "&nbsp;"; });

        for (let i = 0; i < lines.length; i++) {
            if (lines[i]) {
                await typeWriter(lines[i], contentLines[i], 70);
                await new Promise(r => setTimeout(r, 450));
            }
        }
        
        const hintText = draggableLetter.querySelector('#hintText');
        if(hintText) {
            hintText.style.transition = "opacity 1s";
            hintText.style.opacity = "1";
            hintText.innerText = "🌹 สุขสันต์วันวาเลนไทน์ครับ 🌹";
        }
    }, 1500);
}

// ฟังก์ชัน Typewriter (ใส่ไว้ในไฟล์เดียวกันได้เลย)
function typeWriter(element, text, speed) {
    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = "";
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed + (Math.random() * 30));
            } else {
                resolve();
            }
        }
        type();
    });
}
document.body.addEventListener('touchstart', function() {
    const music = document.getElementById('bgMusic');
    if (music && music.paused) {
        music.play();
        music.volume = 0.2; // เริ่มเบาๆ
    }
}, { once: true });

// --- 7. รันคำสั่งเริ่มต้น ---
initGarden();
startLoading();