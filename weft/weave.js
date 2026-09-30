(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const SLOT = 15; // minutes per warp thread
  const TWILL = 4; // a tie every fourth warp, shifted one thread per row

  const KINDS = {
    p: { cls: 'priority', name: 'priority' },
    f: { cls: 'focus', name: 'focus' },
    m: { cls: 'meeting', name: 'meeting' },
    b: { cls: 'rest', name: 'break' },
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // [kind, start, end, label]
  const HERO_WEEK = [
    [
      ['p', '9:00', '10:00', 'Onboarding redesign'],
      ['m', '10:00', '10:30', 'Team standup'],
      ['f', '10:30', '11:30', 'Review research notes'],
      ['b', '12:00', '13:00', 'Lunch'],
      ['m', '13:00', '14:00', 'Design critique'],
      ['m', '14:00', '14:30', '1:1 with Priya'],
      ['p', '14:30', '15:30', 'Onboarding redesign'],
      ['f', '15:30', '15:55', 'Inbox'],
      ['m', '16:00', '16:30', 'Roadmap sync'],
    ],
    [
      ['p', '8:30', '11:30', 'Onboarding redesign'],
      ['b', '11:30', '11:55', 'Walk'],
      ['m', '12:00', '12:30', 'Team standup'],
      ['b', '12:30', '13:30', 'Lunch'],
      ['f', '13:30', '15:30', 'Prototype empty states'],
      ['p', '15:30', '16:30', 'Onboarding redesign'],
    ],
    [
      ['p', '8:30', '8:55', 'Onboarding redesign'],
      ['m', '9:00', '9:30', 'Hiring sync'],
      ['m', '9:30', '10:00', 'Team standup'],
      ['m', '10:00', '11:00', 'Quarterly planning'],
      ['m', '11:00', '12:00', 'Customer call'],
      ['b', '12:00', '12:30', 'Lunch'],
      ['m', '12:30', '13:30', 'Design review'],
      ['m', '13:30', '14:00', '1:1 with Sam'],
      ['m', '14:00', '15:00', 'Vendor demo'],
      ['f', '15:00', '16:00', 'Write up planning notes'],
      ['m', '16:00', '16:30', 'Roadmap sync'],
    ],
    [
      ['p', '9:00', '11:00', 'Onboarding redesign'],
      ['m', '11:00', '11:30', 'Team standup'],
      ['f', '11:30', '12:30', 'Prototype empty states'],
      ['b', '12:30', '13:30', 'Lunch'],
      ['m', '13:30', '14:30', 'Usability session'],
      ['p', '14:30', '16:30', 'Onboarding redesign'],
      ['f', '16:30', '16:55', 'Inbox'],
    ],
    [
      ['f', '9:00', '10:00', 'Update design system docs'],
      ['m', '10:00', '10:30', 'Team standup'],
      ['p', '10:30', '11:30', 'Onboarding redesign'],
      ['b', '12:00', '13:00', 'Lunch'],
      ['m', '13:00', '14:00', 'Team demo'],
      ['f', '14:00', '14:25', 'Friday review'],
      ['b', '15:00', '17:00', 'Left early'],
    ],
    [
      ['b', '10:00', '13:00', 'Hike'],
    ],
    [
      ['f', '19:00', '19:25', 'Plan next week'],
    ],
  ];

  // Seeded so the scattered swatch is the same on every load.
  function prng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function scatteredWeek() {
    const rand = prng(123);
    const pieces = [['f', 25], ['p', 25], ['m', 30], ['f', 25], ['b', 15], ['m', 30]];
    const week = [];
    for (let d = 0; d < 7; d++) {
      const blocks = [];
      if (d < 5) {
        let t = 9 * 60 + Math.floor(rand() * 3) * 5;
        while (t < 17 * 60) {
          const [kind, len] = pieces[Math.floor(rand() * pieces.length)];
          blocks.push([kind, t, t + len]);
          t += len + 5 + Math.floor(rand() * 3) * 5;
        }
      }
      week.push(blocks);
    }
    return week;
  }

  const SWATCHES = {
    long: [
      [['p', '8:30', '12:00'], ['b', '12:00', '13:00'], ['f', '13:00', '16:00'], ['m', '16:00', '16:30']],
      [['p', '8:30', '11:30'], ['m', '11:30', '12:00'], ['b', '12:00', '13:00'], ['p', '13:00', '16:00']],
      [['m', '9:00', '9:30'], ['p', '9:30', '12:30'], ['b', '12:30', '13:30'], ['f', '13:30', '17:00']],
      [['p', '8:30', '12:00'], ['b', '12:00', '13:00'], ['f', '13:00', '15:00'], ['m', '15:00', '16:00']],
      [['f', '9:00', '11:00'], ['m', '11:00', '11:30'], ['b', '12:00', '13:00'], ['p', '13:00', '15:00']],
      [['b', '9:00', '12:00']],
      [],
    ],
    barcode: [
      [['m', '9:00', '12:00'], ['b', '12:00', '12:30'], ['m', '12:30', '15:00'], ['f', '15:00', '15:25'], ['m', '15:30', '17:00']],
      [['m', '9:00', '10:30'], ['p', '10:30', '10:55'], ['m', '11:00', '12:00'], ['b', '12:00', '12:30'], ['m', '12:30', '16:00']],
      [['m', '9:00', '11:00'], ['f', '11:00', '11:25'], ['m', '11:30', '12:30'], ['b', '12:30', '13:00'], ['m', '13:00', '17:00']],
      [['m', '9:00', '12:00'], ['b', '12:00', '12:30'], ['m', '12:30', '14:30'], ['p', '14:30', '15:30'], ['m', '15:30', '17:00']],
      [['m', '9:00', '10:30'], ['f', '10:30', '11:30'], ['m', '11:30', '12:00'], ['b', '12:00', '13:00'], ['m', '13:00', '14:30']],
      [],
      [],
    ],
    scattered: scatteredWeek(),
    rest: [
      [['p', '9:00', '11:00'], ['m', '11:00', '11:30'], ['b', '12:00', '13:00'], ['f', '13:00', '15:00']],
      [['p', '9:00', '12:00'], ['b', '12:00', '13:00'], ['m', '13:00', '14:00'], ['f', '14:00', '15:00']],
      [['m', '9:30', '10:00'], ['f', '10:00', '12:00'], ['b', '13:00', '18:30']],
      [['b', '8:30', '18:30']],
      [['b', '8:30', '18:30']],
      [['b', '9:30', '17:00']],
      [['b', '10:00', '15:30']],
    ],
  };

  const HERO = {
    start: 7 * 60, end: 23 * 60,
    spacing: 17, rowH: 42, gutter: 58, top: 40, pad: 10, beam: 10,
    floatH: 28, restH: 12, stitchW: 6, stitchH: 30, tie: 3, inset: 2,
    labels: true,
  };

  const SWATCH = {
    start: 8 * 60, end: 19 * 60,
    spacing: 9, rowH: 22, gutter: 8, top: 14, pad: 14, beam: 14,
    floatH: 14, restH: 7, stitchW: 3, stitchH: 15, tie: 2, inset: 1,
    labels: false,
  };

  const toMin = (t) => {
    if (typeof t === 'number') return t;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const clock = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const h12 = ((h + 11) % 12) + 1;
    const suffix = h < 12 ? 'am' : 'pm';
    return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
  };

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
  }

  function draw(svg, week, o) {
    const warps = (o.end - o.start) / SLOT;
    const left = o.gutter;
    const right = o.gutter + warps * o.spacing;
    const bottom = o.top + week.length * o.rowH;
    const x = (min) => left + ((min - o.start) / SLOT) * o.spacing;
    const warpX = (j) => left + (j + 0.5) * o.spacing;

    svg.setAttribute('viewBox', `0 0 ${right + o.pad} ${bottom + o.pad}`);

    const warp = el('g', { class: 'weave__warp', 'aria-hidden': 'true' }, svg);
    for (let j = 0; j < warps; j++) {
      el('line', { x1: warpX(j), x2: warpX(j), y1: o.top - o.beam, y2: bottom + o.beam }, warp);
    }

    if (o.labels) {
      const labels = el('g', { class: 'weave__labels', 'aria-hidden': 'true' }, svg);
      for (let h = o.start / 60 + 1; h < o.end / 60; h += 2) {
        const t = el('text', { x: x(h * 60), y: o.top - o.beam - 10, 'text-anchor': 'middle' }, labels);
        t.textContent = clock(h * 60);
      }
      el('line', { class: 'weave__beam', x1: left, x2: right, y1: o.top - o.beam, y2: o.top - o.beam }, svg);
      el('line', { class: 'weave__beam', x1: left, x2: right, y1: bottom + o.beam, y2: bottom + o.beam }, svg);
    }

    const rows = week.map((blocks, r) => {
      const y0 = o.top + r * o.rowH;
      const cy = y0 + o.rowH / 2;

      if (o.labels) {
        const t = el('text', { class: 'weave__day', x: 0, y: cy + 5, 'aria-hidden': 'true' }, svg);
        t.textContent = DAYS[r].slice(0, 3);
      }

      const g = el('g', { class: 'weave__row' }, svg);

      for (const [kind, s, e, label] of blocks) {
        const start = toMin(s);
        const end = toMin(e);
        const thread = el('g', { class: `thread thread--${KINDS[kind].cls}` }, g);
        if (label) thread.dataset.readout = `${DAYS[r]}, ${clock(start)} to ${clock(end)}: ${label}`;

        el('rect', { class: 'thread__hit', x: x(start), y: y0, width: x(end) - x(start), height: o.rowH }, thread);

        const first = Math.ceil((start - o.start) / SLOT - 0.5);
        const last = Math.floor((end - o.start) / SLOT - 0.5);

        if (kind === 'm') {
          // Meetings show the warp on top: a comb of vertical stitches tied by one thin line.
          let lo = Infinity;
          let hi = -Infinity;
          for (let j = first; j <= last; j++) {
            const wx = warpX(j);
            if (wx <= x(start) || wx >= x(end)) continue;
            lo = Math.min(lo, wx);
            hi = Math.max(hi, wx);
            el('rect', {
              class: 'thread__stitch',
              x: wx - o.stitchW / 2, y: cy - o.stitchH / 2,
              width: o.stitchW, height: o.stitchH, rx: o.stitchW / 2,
            }, thread);
          }
          if (hi > lo) el('line', { class: 'thread__spine', x1: lo, x2: hi, y1: cy, y2: cy }, thread);
          continue;
        }

        // Everything else is a weft float, pinned down by warp ties on a twill diagonal.
        const h = kind === 'b' ? o.restH : o.floatH;
        const x1 = x(start) + o.inset;
        const x2 = x(end) - o.inset;
        el('rect', { class: 'thread__float', x: x1, y: cy - h / 2, width: x2 - x1, height: h, rx: h / 2 }, thread);
        for (let j = first; j <= last; j++) {
          const wx = warpX(j);
          if ((j + r) % TWILL !== 0 || wx - x1 < h || x2 - wx < h) continue;
          el('rect', { class: 'thread__tie', x: wx - o.tie / 2, y: cy - h / 2 - 1, width: o.tie, height: h + 2 }, thread);
        }
      }

      return { g, y0 };
    });

    return { rows, left, right, rowH: o.rowH, pad: o.pad };
  }

  // The shuttle throws each row in turn, alternating direction the way a hand loom does.
  let pass = 0;
  function weave(svg, layout) {
    const run = ++pass;
    const PASS = 360;
    const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
    const span = layout.right - layout.left + layout.pad * 2;
    const from = layout.left - layout.pad;

    const defs = svg.querySelector('defs') || el('defs', {}, svg);
    defs.replaceChildren();
    const clips = layout.rows.map((row, r) => {
      const id = `${svg.id}-row-${r}`;
      const clip = el('clipPath', { id }, defs);
      const rect = el('rect', { x: from, y: row.y0, width: 0, height: layout.rowH }, clip);
      row.g.setAttribute('clip-path', `url(#${id})`);
      return rect;
    });

    svg.querySelector('.shuttle')?.remove();
    const shuttle = el('g', { class: 'shuttle', 'aria-hidden': 'true' }, svg);
    el('path', { d: 'M-26 0 C-16 -8 16 -8 26 0 C16 8 -16 8 -26 0Z' }, shuttle);
    el('rect', { class: 'shuttle__bobbin', x: -8, y: -2, width: 16, height: 4, rx: 2 }, shuttle);

    const t0 = performance.now();
    const total = PASS * layout.rows.length;

    function frame(now) {
      if (run !== pass) return;
      const t = Math.max(0, Math.min(now - t0, total));
      layout.rows.forEach((row, r) => {
        const p = ease(Math.min(Math.max((t - r * PASS) / PASS, 0), 1));
        const w = span * p;
        const rect = clips[r];
        rect.setAttribute('width', w);
        rect.setAttribute('x', r % 2 ? from + span - w : from);
      });

      const r = Math.min(Math.floor(t / PASS), layout.rows.length - 1);
      const p = ease(Math.min((t - r * PASS) / PASS, 1));
      const edge = r % 2 ? from + span * (1 - p) : from + span * p;
      shuttle.setAttribute('transform', `translate(${edge} ${layout.rows[r].y0 + layout.rowH / 2})`);

      if (t < total) {
        requestAnimationFrame(frame);
      } else {
        layout.rows.forEach((row) => row.g.removeAttribute('clip-path'));
        shuttle.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  function readout(svg, output) {
    const fallback = output.dataset.default;
    const show = (thread) => {
      svg.querySelector('.thread.is-active')?.classList.remove('is-active');
      svg.classList.toggle('is-pointing', Boolean(thread));
      thread?.classList.add('is-active');
      output.textContent = thread ? thread.dataset.readout : fallback;
    };
    svg.addEventListener('pointerover', (e) => show(e.target.closest('[data-readout]')));
    svg.addEventListener('pointerleave', () => show(null));
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)');

  const hero = document.getElementById('hero-weave');
  const layout = draw(hero, HERO_WEEK, HERO);
  readout(hero, document.getElementById('readout'));

  const replay = document.getElementById('replay');
  replay.hidden = still.matches;
  replay.addEventListener('click', () => weave(hero, layout));
  if (!still.matches) weave(hero, layout);

  document.querySelectorAll('[data-swatch]').forEach((svg) => {
    draw(svg, SWATCHES[svg.dataset.swatch], SWATCH);
  });
})();
