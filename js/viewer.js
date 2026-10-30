(() => {
  'use strict';
  const TOTAL = 36, INTERVAL_MS = 100, PIXELS_PER_FRAME = 9;
  const file = i => `images/img${String(i + 1).padStart(2, '0')}.jpg`;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), img = $('productImage'), angle = $('angle'), frame = $('frame');
  const play = $('play'), hint = $('dragHint'), status = $('stateText'), rotationProgress = $('progressFill');
  const tabs = [...document.querySelectorAll('[data-view]')];
  let current = 0, view = 'spin', timer = null;
  let dragging = false, startX = 0, startFrame = 0;
  let loaded = 0, errors = 0;
  const images = Array.from({length: TOTAL}, () => new Image());

  function setFrame(n) {
    current = (n % TOTAL + TOTAL) % TOTAL;
    img.src = file(current);
    img.alt = `产品360度展示，第${current + 1}帧，${current * 10}度`;
    angle.textContent = `${current * 10}°`;
    frame.textContent = `${String(current + 1).padStart(2,'0')} / ${TOTAL}`;
    rotationProgress.style.width = `${current / (TOTAL - 1) * 100}%`;
  }
  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
    play.innerHTML = '▶ <span>自动旋转</span>';
    play.setAttribute('aria-label', '自动旋转');
  }
  function chooseView(next) {
    stop(); view = next;
    tabs.forEach(btn => {
      const active = btn.dataset.view === next;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (next === 'front') setFrame(0);
    if (next === 'back') setFrame(18);
    hint.style.opacity = next === 'spin' ? '1' : '0';
    stage.style.cursor = next === 'spin' ? 'grab' : 'default';
  }
  function changeFrame(delta) {
    chooseView('spin'); setFrame(current + delta);
  }
  function togglePlay() {
    if (timer !== null) {stop();return;}
    if (view !== 'spin') chooseView('spin');
    hint.style.opacity = '0';
    timer = setInterval(() => setFrame(current + 1), INTERVAL_MS);
    play.innerHTML = 'Ⅱ <span>暂停旋转</span>';
    play.setAttribute('aria-label', '暂停旋转');
  }
  tabs.forEach(btn => btn.addEventListener('click', () => chooseView(btn.dataset.view)));
  $('previous').addEventListener('click', () => changeFrame(-1));
  $('next').addEventListener('click', () => changeFrame(1));
  play.addEventListener('click', togglePlay);
  stage.addEventListener('pointerdown', e => {
    if (view !== 'spin' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    stop(); dragging = true; startX = e.clientX; startFrame = current;
    stage.setPointerCapture(e.pointerId); hint.style.opacity = '0';
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    setFrame(startFrame + Math.trunc((startX - e.clientX) / PIXELS_PER_FRAME));
  });
  const release = () => { dragging = false; };
  ['pointerup','pointercancel','lostpointercapture'].forEach(name => stage.addEventListener(name, release));
  stage.addEventListener('keydown', e => {
    if (view !== 'spin' || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault(); stop(); setFrame(current + (e.key === 'ArrowRight' ? 1 : -1));
  });
  images.forEach((asset, i) => {
    asset.onload = () => {
      loaded++;
      if (loaded + errors === TOTAL) status.textContent = errors ? `${errors} 张图片加载失败` : '36 帧已加载';
    };
    asset.onerror = () => {
      errors++;
      if (loaded + errors === TOTAL) status.textContent = `${errors} 张图片加载失败`;
    };
    asset.src = file(i);
  });
  setFrame(0);
})();
