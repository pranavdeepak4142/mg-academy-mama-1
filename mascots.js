/**
 * MG ACADEMY - Official 3D Animated Mascots: SURYA & JO
 * 
 * Character 1: SURYA – Smart 3D Pixar-style boy (Brown hair, blue glasses, blue shirt, striped tie,
 *                     suspenders, blue jeans, yellow sneakers, giant pencil, thumbs-up).
 * Character 2: JO    – Creative 3D Pixar-style girl (Brown hair, yellow paper boat crown, flower earrings,
 *                     teal top, yellow skirt, paint-splattered apron, yellow sneakers, paint palette & brush).
 * 
 * Features:
 * - Ultra-high-resolution 3D Pixar character assets with transparent backgrounds.
 * - Dynamic 3D perspective rigging: cursor tracking, body tilt, dynamic ground contact shadows.
 * - Natural skeletal locomotion: walk cycle, body bobbing, heel-toe tilt, jumping, dancing, sitting, waving.
 * - Autonomous Free-Roaming AI across lower screen, non-intrusive and responsive.
 * - Intelligent Virtual Guide: notices clicks on any section/course, navigates over, points, and explains.
 * - Interactive Conversation System: alternating dialog turns, speech synthesis audio, replay button, dock bar.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Audio & Voice Synthesizer
  // =========================================================================
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 520, duration = 0.14, type = 'sine', slideTo = null) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playPopSound() { playTone(560, 0.12, 'sine', 920); }
  function playSplashSound() { playTone(340, 0.22, 'triangle', 780); }
  function playStepSound(isSurya) { playTone(isSurya ? 280 : 360, 0.05, 'sine'); }
  function playCheerSound() {
    playTone(523, 0.09, 'sine');
    setTimeout(() => playTone(659, 0.09, 'sine'), 80);
    setTimeout(() => playTone(784, 0.16, 'sine', 1046), 160);
  }

  let voiceEnabled = true;
  function speakVoice(text, isSurya = true) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
      const u = new SpeechSynthesisUtterance(clean);
      u.pitch = isSurya ? 1.3 : 1.55;
      u.rate = 1.05;
      u.volume = 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // =========================================================================
  // 2. Magic Particles Canvas (Golden Stars, Paint Splatters, Confetti)
  // =========================================================================
  let fxCanvas, fxCtx;
  const particles = [];

  function initFXCanvas() {
    fxCanvas = document.createElement('canvas');
    fxCanvas.id = 'mg-mascots-fx-canvas';
    fxCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
    document.body.appendChild(fxCanvas);
    fxCtx = fxCanvas.getContext('2d');

    const resize = () => {
      fxCanvas.width = window.innerWidth;
      fxCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    function renderFX() {
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.12;
        p.rotation += p.vRot || 0.05;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        fxCtx.save();
        fxCtx.globalAlpha = Math.max(0, p.life);
        fxCtx.translate(p.x, p.y);
        fxCtx.rotate(p.rotation);
        fxCtx.fillStyle = p.color;

        if (p.type === 'star') {
          drawStar(fxCtx, 0, 0, 5, p.size, p.size * 0.45);
        } else if (p.type === 'splatter') {
          fxCtx.beginPath();
          fxCtx.arc(0, 0, p.size * (1 + (1 - p.life) * 0.35), 0, Math.PI * 2);
          fxCtx.fill();
        } else {
          fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        fxCtx.restore();
      }
      requestAnimationFrame(renderFX);
    }
    requestAnimationFrame(renderFX);
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  function emitStars(x, y, count = 18) {
    playPopSound();
    const colors = ['#ffd147', '#ffb703', '#f59e0b', '#38bdf8', '#ff5b79', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      particles.push({
        type: 'star',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        gravity: 0.12,
        size: 6 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        life: 1.0,
        decay: 0.022
      });
    }
  }

  function emitPaintSplatter(x, y, count = 18) {
    playSplashSound();
    const colors = ['#ff4767', '#0ea5e9', '#eab308', '#a855f7', '#22c55e', '#ec4899'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * 38;
      particles.push({
        type: 'splatter',
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        gravity: 0,
        size: 7 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.016
      });
    }
  }

  // =========================================================================
  // 3. Section Guide Database & Dialogues
  // =========================================================================
  const SECTION_GUIDES = {
    home: {
      title: "Welcome to MG ACADEMY!",
      mascot: "surya",
      text: "Hey there! Welcome to MG ACADEMY! I'm SURYA, and this is where your creative journey begins! 🌟",
      actionText: "Explore Courses 🎨"
    },
    courses: {
      title: "Art Courses by Age Group",
      mascot: "jo",
      text: "Come on! Let's explore our exciting courses! We have Beginner, Intermediate, and Advanced Art designed for every age group! 🎨",
      actionText: "Choose a Level ✦"
    },
    "beginner-art": {
      title: "Beginner Art Course (Age 4–8)",
      mascot: "surya",
      text: "Our Beginner Course is perfect for ages 4 to 8! Learn basic shapes, pencil control, neat colouring, and fun doodles with me! ✏️",
      actionText: "Enroll in Beginner"
    },
    "intermediate-art": {
      title: "Intermediate Art Course (Age 8–12)",
      mascot: "jo",
      text: "For ages 8 to 12! Master pencil shading, nature scenery, watercolours, and creative art! I'll teach you all my favorite color secrets! 🖌️",
      actionText: "Enroll in Intermediate"
    },
    "advanced-art": {
      title: "Advanced Art Course (Age 10+)",
      mascot: "jo",
      text: "For age 10 and above! Dive into stretched canvas acrylic painting, realistic portraits, and creative portfolio mastery! 🖼️",
      actionText: "Enroll in Advanced"
    },
    programs: {
      title: "Our Creative Programs",
      mascot: "surya",
      text: "Look at all our programs! Drawing, Painting, Dance, Abacus, Performing Arts & Creative Activities! So much to learn and enjoy! 💃🔢",
      actionText: "See Programs"
    },
    about: {
      title: "About MG ACADEMY",
      mascot: "surya",
      text: "At MG ACADEMY, we believe 'Every child is an artist!' Our supportive trainers create a happy space where children build real confidence! 💛",
      actionText: "Read Story"
    },
    gallery: {
      title: "Creative Gallery",
      mascot: "jo",
      text: "Look at these amazing masterpieces and memorable moments from our talented students! Every artwork tells a story! 📸✨",
      actionText: "Admire Art ✦"
    },
    testimonials: {
      title: "What Parents Say",
      mascot: "surya",
      text: "Hear what proud parents have to say about their children's artistic growth, happiness, and confidence at MG ACADEMY! ⭐⭐⭐⭐⭐",
      actionText: "Read Reviews"
    },
    enroll: {
      title: "Admission & Enrollment",
      mascot: "jo",
      text: "Ready to join our creative family? Fill in the simple form right here to start your admission journey! We can't wait to meet you! 📝🎉",
      actionText: "Enroll Now"
    },
    contact: {
      title: "Get in Touch",
      mascot: "surya",
      text: "Have any questions? Reach out to our friendly team anytime via call, email, or a quick message! We're here to help you! 📞💌",
      actionText: "Send Message"
    }
  };

  const CONVERSATION_TURNS = [
    {
      speaker: "surya",
      title: "SURYA • Smart Artist Boy",
      text: "Hi friend! I'm SURYA! Did you know learning basic shapes like circles and cubes is the secret to sketching anything in 3D? ✏️",
      soundType: "boy"
    },
    {
      speaker: "jo",
      title: "JO • Creative Artist Girl",
      text: "Hello! I'm JO! My favorite thing is painting colorful nature sceneries and sunsets! In our Intermediate course, we blend beautiful watercolours! 🖌️",
      soundType: "girl"
    },
    {
      speaker: "surya",
      title: "SURYA • Smart Artist Boy",
      text: "Besides art, MG ACADEMY offers energetic Dance classes, mental Abacus to sharpen math confidence, and Performing Arts! 💃🔢",
      soundType: "boy"
    },
    {
      speaker: "jo",
      title: "JO • Creative Artist Girl",
      text: "Enrolling is super easy! Just scroll to the admission form or click 'Enroll Now'. We'd love to have you in our creative family! 💛",
      soundType: "girl"
    }
  ];

  // =========================================================================
  // 4. 3D Animated Pixar Character Controller (SURYA & JO)
  // =========================================================================
  class Pixar3DMascot {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.role = config.role;
      this.isSurya = config.isSurya;
      this.primarySrc = config.primarySrc;
      this.waveSrc = config.waveSrc || config.primarySrc;
      this.thinkSrc = config.thinkSrc || config.primarySrc;
      this.explainSrc = config.explainSrc || config.primarySrc;
      this.excitedSrc = config.excitedSrc || config.primarySrc;
      this.danceSrc = config.danceSrc || config.primarySrc;
      this.paintSrc = config.paintSrc || config.primarySrc;
      this.themeColor = config.themeColor;

      this.x = config.startX || 60;
      this.y = config.startY || (window.innerHeight - 260);
      this.targetX = this.x;
      this.targetY = this.y;
      this.facingRight = config.facingRight !== false;

      this.animState = 'IDLE'; // IDLE, WALK, WAVE, JUMP, DANCE, SIT, POINT, THINK
      this.stateTimer = 0;
      this.walkPhase = 0;
      this.roamEnabled = true;
      this.nextRoamTime = Date.now() + 2500 + Math.random() * 4500;

      this.createDOM();
    }

    createDOM() {
      this.container = document.createElement('div');
      this.container.className = 'mg-mascot-unit';
      this.container.id = this.id;

      // 3D Perspective Stage
      this.stage3D = document.createElement('div');
      this.stage3D.className = 'mg-mascot-3d-stage';

      // Full-body 3D Pixar character image
      this.img = document.createElement('img');
      this.img.src = this.primarySrc;
      this.img.alt = `${this.name} - MG ACADEMY 3D Mascot`;
      this.img.className = 'mg-mascot-3d-img';
      this.img.draggable = false;

      // Soft 3D dynamic ground shadow
      this.shadow = document.createElement('div');
      this.shadow.className = 'mg-mascot-3d-shadow';

      // Name Pill Badge
      this.namePill = document.createElement('div');
      this.namePill.className = 'mg-mascot-namepill';
      this.namePill.style.background = this.themeColor;
      this.namePill.innerHTML = `<strong>${this.name}</strong> <small>${this.role}</small>`;

      // Interactive Speech Bubble
      this.bubble = document.createElement('div');
      this.bubble.className = 'mg-mascot-speech-bubble hidden';
      this.bubble.innerHTML = `
        <button class="mg-speech-close" title="Dismiss">✕</button>
        <div class="mg-speech-speaker" style="color:${this.themeColor}"></div>
        <p class="mg-speech-text"></p>
        <div class="mg-speech-actions">
          <button class="mg-speech-replay" title="Replay voice">🔁 Read Again</button>
          <button class="mg-speech-mainbtn">Explore ✦</button>
        </div>
      `;

      this.bubbleSpeaker = this.bubble.querySelector('.mg-speech-speaker');
      this.bubbleText = this.bubble.querySelector('.mg-speech-text');
      this.bubbleReplay = this.bubble.querySelector('.mg-speech-replay');
      this.bubbleMainBtn = this.bubble.querySelector('.mg-speech-mainbtn');
      this.bubbleClose = this.bubble.querySelector('.mg-speech-close');

      this.bubbleClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideBubble();
      });

      this.bubbleReplay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentDialogueText) {
          speakVoice(this.currentDialogueText, this.isSurya);
          this.triggerWave();
        }
      });

      // Assemble elements
      this.stage3D.appendChild(this.shadow);
      this.stage3D.appendChild(this.img);
      this.stage3D.appendChild(this.namePill);

      this.container.appendChild(this.stage3D);
      this.container.appendChild(this.bubble);
      document.body.appendChild(this.container);

      this.bindDragAndTap();
      this.updatePosition();
    }

    bindDragAndTap() {
      let isDragging = false;
      let startX = 0, startY = 0;
      let dragStartX = 0, dragStartY = 0;

      const onStart = (cx, cy) => {
        isDragging = true;
        startX = cx - this.x;
        startY = cy - this.y;
        dragStartX = cx;
        dragStartY = cy;
        this.container.classList.add('dragging');
        playPopSound();
      };

      const onMove = (cx, cy) => {
        if (!isDragging) return;
        this.x = cx - startX;
        this.y = cy - startY;
        this.targetX = this.x;
        this.targetY = this.y;
        this.clampBounds();
        this.updatePosition();
      };

      const onEnd = (cx, cy) => {
        if (!isDragging) return;
        isDragging = false;
        this.container.classList.remove('dragging');
        const dist = Math.hypot(cx - dragStartX, cy - dragStartY);
        if (dist < 10) {
          this.onTap();
        }
      };

      this.img.addEventListener('mousedown', (e) => {
        onStart(e.clientX, e.clientY);
        const mm = (ev) => onMove(ev.clientX, ev.clientY);
        const mu = (ev) => {
          onEnd(ev.clientX, ev.clientY);
          window.removeEventListener('mousemove', mm);
          window.removeEventListener('mouseup', mu);
        };
        window.addEventListener('mousemove', mm);
        window.addEventListener('mouseup', mu);
      });

      this.img.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        onStart(t.clientX, t.clientY);
        const tm = (ev) => onMove(ev.touches[0].clientX, ev.touches[0].clientY);
        const te = (ev) => {
          onEnd(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
          window.removeEventListener('touchmove', tm);
          window.removeEventListener('touchend', te);
        };
        window.addEventListener('touchmove', tm, { passive: true });
        window.addEventListener('touchend', te);
      }, { passive: true });
    }

    clampBounds() {
      const minX = 20;
      const maxX = window.innerWidth - (this.container.offsetWidth || 150) - 20;
      const minY = 40;
      const maxY = window.innerHeight - (this.container.offsetHeight || 240) - 20;
      this.x = Math.max(minX, Math.min(maxX, this.x));
      this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    updatePosition() {
      this.container.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }

    onTap() {
      if (this.isSurya) {
        emitStars(this.x + 80, this.y + 60, 22);
      } else {
        emitPaintSplatter(this.x + 80, this.y + 60, 22);
      }
      advanceConversation(this);
    }

    triggerWave() {
      this.animState = 'WAVE';
      this.stateTimer = 90;
      this.img.src = this.waveSrc;
      playPopSound();
    }

    triggerJump() {
      this.animState = 'JUMP';
      this.stateTimer = 55;
      this.img.src = this.isSurya ? this.excitedSrc : this.danceSrc;
      playCheerSound();
      if (this.isSurya) emitStars(this.x + 80, this.y + 40, 24);
      else emitPaintSplatter(this.x + 80, this.y + 40, 24);
    }

    triggerDance() {
      this.animState = 'DANCE';
      this.stateTimer = 130;
      this.img.src = this.danceSrc;
      playCheerSound();
    }

    triggerThink() {
      this.animState = 'THINK';
      this.stateTimer = 110;
      this.img.src = this.thinkSrc;
    }

    triggerSit() {
      this.animState = 'SIT';
      this.stateTimer = 180;
    }

    pointTo(screenX, screenY) {
      this.animState = 'POINT';
      this.stateTimer = 110;
      this.facingRight = screenX > (this.x + 80);
      this.img.src = this.facingRight ? this.explainSrc : this.waveSrc;
    }

    speakGuide(guideData, onAction) {
      this.currentDialogueText = guideData.text;
      this.bubbleSpeaker.textContent = `${this.name} • Official Mascot`;
      this.bubbleText.textContent = guideData.text;
      this.bubbleMainBtn.textContent = guideData.actionText || 'Explore ✦';

      this.bubbleMainBtn.onclick = (e) => {
        e.stopPropagation();
        this.hideBubble();
        if (onAction) onAction();
      };

      this.bubble.classList.remove('hidden');
      this.triggerWave();
      speakVoice(guideData.text, this.isSurya);

      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = setTimeout(() => this.hideBubble(), 9500);
    }

    hideBubble() {
      this.bubble.classList.add('hidden');
      clearTimeout(this.bubbleTimer);
    }

    update(now, mouseX, mouseY) {
      // 3D Perspective Tilt tracking mouse
      const cx = this.x + 80;
      const cy = this.y + 120;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.hypot(dx, dy);

      let rotY = 0;
      let rotX = 0;
      if (dist < 900) {
        rotY = Math.max(-16, Math.min(16, (dx / 400) * 16));
        rotX = Math.max(-12, Math.min(12, (-dy / 400) * 12));
      }

      // Autonomous Roaming AI
      if (this.roamEnabled && now > this.nextRoamTime && this.animState === 'IDLE') {
        this.nextRoamTime = now + 4200 + Math.random() * 5000;
        const roll = Math.random();

        if (roll < 0.55) {
          // Walk across screen
          const minX = 40;
          const maxX = window.innerWidth - (this.container.offsetWidth || 160) - 40;
          const minY = window.innerHeight - 300;
          const maxY = window.innerHeight - 200;

          if (this.isSurya) {
            this.targetX = minX + Math.random() * (maxX * 0.48);
          } else {
            this.targetX = minX + (maxX * 0.46) + Math.random() * (maxX * 0.5);
          }
          this.targetY = minY + Math.random() * (maxY - minY);
          this.animState = 'WALK';
          this.img.src = this.primarySrc;
        } else if (roll < 0.72) {
          this.triggerJump();
        } else if (roll < 0.85) {
          this.triggerDance();
        } else {
          this.triggerSit();
        }
      }

      // State timer countdown
      if (this.stateTimer > 0) {
        this.stateTimer--;
        if (this.stateTimer === 0) {
          this.animState = 'IDLE';
          this.img.src = this.primarySrc;
        }
      }

      // Kinetics per state
      let bounceY = 0;
      let legRotationZ = 0;
      let scaleY = 1;
      let scaleX = this.facingRight ? 1 : -1;

      if (this.animState === 'WALK') {
        const dX = this.targetX - this.x;
        const dY = this.targetY - this.y;
        const distToTarget = Math.hypot(dX, dY);

        if (distToTarget > 6) {
          this.facingRight = dX > 0;
          scaleX = this.facingRight ? 1 : -1;

          this.x += (dX / distToTarget) * 2.3;
          this.y += (dY / distToTarget) * 2.3;
          this.clampBounds();
          this.updatePosition();

          this.walkPhase += 0.22;
          bounceY = -Math.abs(Math.sin(this.walkPhase * 2)) * 6.5;
          legRotationZ = Math.sin(this.walkPhase) * 3.5;

          if (Math.abs(Math.sin(this.walkPhase)) > 0.95 && Math.random() < 0.16) {
            playStepSound(this.isSurya);
          }
        } else {
          this.animState = 'IDLE';
        }
      } else if (this.animState === 'WAVE') {
        bounceY = Math.sin(now * 0.008) * 4;
        legRotationZ = Math.sin(now * 0.015) * 4;
      } else if (this.animState === 'JUMP') {
        const p = 1 - (this.stateTimer / 55);
        bounceY = -Math.sin(p * Math.PI) * 55;
        scaleY = p < 0.2 || p > 0.8 ? 0.9 : 1.1;
        rotY += Math.sin(p * Math.PI * 2) * 25;
      } else if (this.animState === 'DANCE') {
        const t = now * 0.012;
        bounceY = Math.abs(Math.sin(t * 2)) * 8;
        legRotationZ = Math.sin(t) * 7;
        rotY = Math.sin(t * 0.8) * 14;
      } else if (this.animState === 'THINK') {
        bounceY = Math.sin(now * 0.003) * 2;
        legRotationZ = -2;
      } else if (this.animState === 'SIT') {
        bounceY = 18;
        scaleY = 0.88;
      } else {
        // IDLE gentle breathing
        bounceY = Math.sin(now * 0.003) * 2.5;
        scaleY = 1 + Math.sin(now * 0.003) * 0.015;
      }

      // Apply 3D Transforms
      const flipScale = scaleX < 0 ? 'scaleX(-1)' : '';
      this.img.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${legRotationZ}deg) translateY(${bounceY}px) scaleY(${scaleY}) ${flipScale}`;

      // Ground shadow tracks jump height & scale
      const shadowScale = Math.max(0.35, 1 - Math.abs(bounceY) * 0.018);
      const shadowOpacity = Math.max(0.15, 0.42 - Math.abs(bounceY) * 0.006);
      this.shadow.style.transform = `scale(${shadowScale}) translateY(0)`;
      this.shadow.style.opacity = shadowOpacity;
    }
  }

  // =========================================================================
  // 5. Website Section Guide & Navigation Listener
  // =========================================================================
  let suryaMascot, joMascot;
  let activeSpeakerIndex = 0;

  function advanceConversation(targetMascot) {
    const turn = CONVERSATION_TURNS[activeSpeakerIndex];
    activeSpeakerIndex = (activeSpeakerIndex + 1) % CONVERSATION_TURNS.length;

    const speaker = turn.speaker === 'surya' ? suryaMascot : joMascot;
    const listener = turn.speaker === 'surya' ? joMascot : suryaMascot;

    speaker.bubbleSpeaker.textContent = turn.title;
    speaker.bubbleText.textContent = turn.text;
    speaker.bubbleMainBtn.textContent = 'Next ✦';
    speaker.currentDialogueText = turn.text;

    speaker.bubbleMainBtn.onclick = (e) => {
      e.stopPropagation();
      advanceConversation(listener);
    };

    speaker.bubble.classList.remove('hidden');
    listener.hideBubble();

    speaker.pointTo(listener.x + 80, listener.y + 80);
    speaker.triggerWave();
    speakVoice(turn.text, turn.soundType === 'boy');

    clearTimeout(speaker.bubbleTimer);
    speaker.bubbleTimer = setTimeout(() => speaker.hideBubble(), 9500);
  }

  function handleSectionNavigation(sectionKey) {
    const guide = SECTION_GUIDES[sectionKey];
    if (!guide) return;

    const activeMascot = guide.mascot === 'surya' ? suryaMascot : joMascot;
    const otherMascot = guide.mascot === 'surya' ? joMascot : suryaMascot;

    otherMascot.hideBubble();

    const elem = document.getElementById(sectionKey === 'beginner-art' || sectionKey === 'intermediate-art' || sectionKey === 'advanced-art' ? 'courses' : sectionKey);
    if (elem) {
      const rect = elem.getBoundingClientRect();
      const targetScreenY = Math.max(100, Math.min(window.innerHeight - 200, rect.top + 100));
      activeMascot.pointTo(window.innerWidth / 2, targetScreenY);
    }

    activeMascot.speakGuide(guide, () => {
      if (sectionKey.includes('art')) {
        const select = document.getElementById('program');
        if (select) {
          if (sectionKey === 'beginner-art') select.value = 'Beginner Art Course (Age 4-8)';
          if (sectionKey === 'intermediate-art') select.value = 'Intermediate Art Course (Age 8-12)';
          if (sectionKey === 'advanced-art') select.value = 'Advanced Art Course (Age 10+)';
        }
        const enrollSec = document.getElementById('enroll');
        if (enrollSec) enrollSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function wireWebsiteEvents() {
    // Top Nav Links
    document.querySelectorAll('.site-nav a, .site-footer a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        link.addEventListener('click', () => {
          const key = href.replace('#', '');
          setTimeout(() => handleSectionNavigation(key), 300);
        });
      }
    });

    // Course Cards selection buttons
    document.querySelectorAll('.select-course-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const course = btn.getAttribute('data-course') || '';
        if (course.includes('Beginner')) handleSectionNavigation('beginner-art');
        else if (course.includes('Intermediate')) handleSectionNavigation('intermediate-art');
        else if (course.includes('Advanced')) handleSectionNavigation('advanced-art');
      });
    });

    // Program cards click
    document.querySelectorAll('.program-card').forEach((card) => {
      card.addEventListener('click', () => {
        const title = card.querySelector('h4')?.textContent || 'Program';
        const mascot = Math.random() > 0.5 ? suryaMascot : joMascot;
        mascot.speakGuide({
          title,
          text: `You clicked ${title}! In our academy, every class brings joyful creative development! 🌟`,
          actionText: 'Enroll in ' + title
        }, () => {
          const enrollSec = document.getElementById('enroll');
          if (enrollSec) enrollSec.scrollIntoView({ behavior: 'smooth' });
        });
      });
    });

    // Enrollment form focus
    const enrollForm = document.getElementById('enrollmentForm');
    if (enrollForm) {
      enrollForm.addEventListener('focusin', () => {
        if (!joMascot.bubble.classList.contains('hidden')) return;
        joMascot.speakGuide(SECTION_GUIDES.enroll);
      }, { once: true });
    }
  }

  // =========================================================================
  // 6. Floating Mascots Control Bar & Chat Button
  // =========================================================================
  function createMascotUI() {
    const dock = document.createElement('div');
    dock.className = 'mg-mascot-dock';
    dock.innerHTML = `
      <button class="mg-dock-chat-btn" title="Chat with SURYA & JO">
        <span class="mg-chat-icon">💬</span>
        <span>Chat with SURYA & JO</span>
      </button>
      <div class="mg-dock-bar">
        <button id="dockBtnRoam" class="mg-dock-btn active" title="Toggle Roaming">🚶 Roam</button>
        <button id="dockBtnSound" class="mg-dock-btn active" title="Toggle Sound">🔊 Voice</button>
        <button id="dockBtnDance" class="mg-dock-btn" title="Dance & Celebrate!">🎉 Dance</button>
        <button id="dockBtnHide" class="mg-dock-btn" title="Hide/Show Mascots">👀 Hide</button>
      </div>
    `;

    document.body.appendChild(dock);

    const chatBtn = dock.querySelector('.mg-dock-chat-btn');
    const btnRoam = dock.querySelector('#dockBtnRoam');
    const btnSound = dock.querySelector('#dockBtnSound');
    const btnDance = dock.querySelector('#dockBtnDance');
    const btnHide = dock.querySelector('#dockBtnHide');

    chatBtn.addEventListener('click', () => {
      advanceConversation(suryaMascot);
    });

    btnRoam.addEventListener('click', () => {
      const isRoam = !suryaMascot.roamEnabled;
      suryaMascot.roamEnabled = isRoam;
      joMascot.roamEnabled = isRoam;
      btnRoam.classList.toggle('active', isRoam);
      btnRoam.textContent = isRoam ? '🚶 Roam' : '⏸️ Stay';
      playPopSound();
    });

    btnSound.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      voiceEnabled = !voiceEnabled;
      btnSound.classList.toggle('active', soundEnabled);
      btnSound.textContent = soundEnabled ? '🔊 Voice' : '🔇 Muted';
      if (soundEnabled) playPopSound();
    });

    btnDance.addEventListener('click', () => {
      suryaMascot.triggerDance();
      joMascot.triggerDance();
      emitStars(window.innerWidth * 0.35, window.innerHeight - 200, 22);
      emitPaintSplatter(window.innerWidth * 0.65, window.innerHeight - 200, 22);
    });

    let isHidden = false;
    btnHide.addEventListener('click', () => {
      isHidden = !isHidden;
      suryaMascot.container.style.display = isHidden ? 'none' : 'block';
      joMascot.container.style.display = isHidden ? 'none' : 'block';
      btnHide.textContent = isHidden ? '👋 Show' : '👀 Hide';
      playPopSound();
    });
  }

  // =========================================================================
  // 7. Initialization & 60FPS Game Loop
  // =========================================================================
  function init() {
    initFXCanvas();

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Character 1: SURYA
    suryaMascot = new Pixar3DMascot({
      id: 'mascot-surya',
      name: 'SURYA',
      role: 'Smart Artist Boy ✏️',
      isSurya: true,
      primarySrc: 'surya.png',
      waveSrc: 'surya-wave.png',
      thinkSrc: 'surya-think.png',
      explainSrc: 'surya-explain.png',
      excitedSrc: 'surya-excited.png',
      danceSrc: 'surya-excited.png',
      themeColor: '#2563eb',
      startX: Math.max(30, w * 0.08),
      startY: h - 270,
      facingRight: true
    });

    // Character 2: JO
    joMascot = new Pixar3DMascot({
      id: 'mascot-jo',
      name: 'JO',
      role: 'Creative Artist Girl 🎨',
      isSurya: false,
      primarySrc: 'jo.png',
      waveSrc: 'jo-wave.png',
      thinkSrc: 'jo-paint.png',
      explainSrc: 'jo-explain.png',
      excitedSrc: 'jo-dance.png',
      danceSrc: 'jo-dance.png',
      paintSrc: 'jo-paint.png',
      themeColor: '#e11d48',
      startX: Math.max(180, w - 230),
      startY: h - 270,
      facingRight: false
    });

    window.MascotSurya = suryaMascot;
    window.MascotJo = joMascot;

    createMascotUI();
    wireWebsiteEvents();

    let mouseX = w / 2;
    let mouseY = h / 2;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Friendly greeting on entrance
    setTimeout(() => {
      suryaMascot.speakGuide({
        title: "Welcome to MG ACADEMY!",
        text: "Hey there! I'm SURYA and this is JO! Welcome to MG ACADEMY! We're your official creative guides — click us anytime!",
        actionText: "Let's Explore ✦"
      });
      suryaMascot.triggerWave();
    }, 2000);

    // 60FPS Render & Physics Loop
    function loop() {
      const now = Date.now();
      suryaMascot.update(now, mouseX, mouseY);
      joMascot.update(now, mouseX, mouseY);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
