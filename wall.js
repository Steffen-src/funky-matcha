(function () {
  'use strict';
  const $ = (s) => document.querySelector(s),
    $$ = (s) => Array.from(document.querySelectorAll(s)),
    D = window.FunkyWall;
  let language = 'de',
    state = D.normalize(null),
    motionPaused = matchMedia('(prefers-reduced-motion: reduce)').matches,
    photoIndex = 0,
    confirmation = null,
    toastTimer;
  try {
    state = D.normalize(
      JSON.parse(localStorage.getItem('funky-wall-mix') || 'null'),
    );
    if (
      (localStorage.getItem('funky-wall-lang') ||
        localStorage.getItem('funky-matcha.lang')) === 'en'
    )
      language = 'en';
    if (localStorage.getItem('funky-wall-motion') === 'paused')
      motionPaused = true;
  } catch {}
  const ui = {
    de: {
      close: 'Schließen',
      previous: 'Vorheriges Motiv',
      next: 'Nächstes Motiv',
      photo: 'im Detail ansehen',
      choose: 'Diese Sorte wählen ↗',
      less: 'Weniger',
      more: 'Mehr',
      cans: 'Dosen',
      pack: 'Boxgröße',
      of: 'von',
      selected: 'ausgewählt',
      empty:
        'Wähle deine Sorten links oder nimm alle sechs für einen bunten Mix.',
      full: 'Deine Box ist voll. Nimm eine Dose heraus oder wähle die 12er-Box.',
      added: 'Die Sorte ist in deinem Mix.',
      incomplete: 'Wähle erst alle Dosen für deine Box aus.',
      total: 'Gesamt',
      reference: 'Lokale Referenz',
      play: 'Video abspielen',
      pause: 'Video pausieren',
      expand: 'Video vergrößern',
      collapse: 'Vergrößerte Ansicht schließen',
      motionPause: 'Bewegung pausieren',
      motionPlay: 'Bewegung fortsetzen',
      confirmed: 'Deine Auswahl ist lokal bestätigt.',
      changed: 'Auswahl geändert. Du kannst deinen Mix erneut bestätigen.',
      aboutTitle: 'Funky Matcha.',
      about:
        'Funky Matcha ist eine kreative Marken- und Verpackungsidee von BAUVERIS. Sorten, Packgrößen und Preise sind illustrative Produktdaten für diese lokale Ansicht. Eine physische Rezeptur, Lieferfähigkeit oder echte Bestellabwicklung ist damit nicht zugesagt. Der letzte Schritt bestätigt nur die Auswahl in diesem Browser.',
      creditsTitle: 'Behind the colour.',
      credits:
        'Die Produkt- und Sommermotive wurden für Funky Matcha mit dem eingebauten KI-Bildwerkzeug erzeugt. Sie zeigen keine Fotografien real hergestellter Produkte. Gestaltung und Prompts: BAUVERIS. Lifestyle-Clip: „Woman Dancing with a Shining Background“, Mikhail Nilov / Pexels, unter Pexels-Lizenz. Stockaufnahme, keine persönliche Empfehlung für die Marke. Der Clip hat keine Tonspur. Schriften: Fraunces und Bricolage Grotesque, SIL Open Font License.',
      privacyTitle: 'Alles bleibt hier.',
      privacy:
        'Es werden keine Analyse-, Werbe-, Zahlungs- oder Versanddienste geladen. Deine Sortenauswahl und Sprache werden nur in diesem Browser gespeichert, sofern lokale Speicherung verfügbar ist. Die Bestätigung bleibt in der geöffneten Ansicht. Lieferdaten bleiben nur bis zum Neuladen im Arbeitsspeicher dieser Ansicht und werden nicht übertragen.',
      alt: 'Funky Matcha mit farblich passenden Früchten, Eis und Wassertropfen im Purple-Disco-Licht',
    },
    en: {
      close: 'Close',
      previous: 'Previous image',
      next: 'Next image',
      photo: 'view in detail',
      choose: 'Choose this flavour ↗',
      less: 'Less',
      more: 'More',
      cans: 'cans',
      pack: 'Box size',
      of: 'of',
      selected: 'selected',
      empty:
        'Choose your flavours on the left, or mix all six for a colourful box.',
      full: 'Your box is full. Remove a can or choose the box of 12.',
      added: 'This flavour is in your mix.',
      incomplete: 'Choose every can for your box first.',
      total: 'Total',
      reference: 'Local reference',
      play: 'Play video',
      pause: 'Pause video',
      expand: 'Expand video',
      collapse: 'Close expanded view',
      motionPause: 'Pause motion',
      motionPlay: 'Resume motion',
      confirmed: 'Your selection is confirmed locally.',
      changed: 'Selection changed. You can confirm your mix again.',
      aboutTitle: 'Funky Matcha.',
      about:
        'Funky Matcha is a creative brand and packaging concept by BAUVERIS. Flavours, pack sizes and prices are illustrative product data for this local view. They do not promise a physical recipe, availability or real order fulfilment. The last step only confirms the selection in this browser.',
      creditsTitle: 'Behind the colour.',
      credits:
        'The product and summer scenes were created for Funky Matcha using the built-in AI image tool. They are not photographs of real manufactured products. Art direction and prompts: BAUVERIS. Lifestyle clip: “Woman Dancing with a Shining Background”, Mikhail Nilov / Pexels, under the Pexels License. Stock footage, not a personal endorsement of the brand. The clip has no audio track. Fonts: Fraunces and Bricolage Grotesque, SIL Open Font License.',
      privacyTitle: 'Everything stays here.',
      privacy:
        'No analytics, advertising, payment or delivery services are loaded. Your flavour selection and language stay only in this browser when local storage is available. The confirmation remains in the open view. Delivery details remain only in this page’s memory until reload and are not transmitted.',
      alt: 'Funky Matcha with matching fruit, ice and water droplets in purple disco lighting',
    },
  };
  const t = (key) => ui[language][key],
    money = (cents) =>
      new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-IE', {
        style: 'currency',
        currency: 'EUR',
      }).format(cents / 100);
  function store() {
    try {
      localStorage.setItem('funky-wall-mix', JSON.stringify(state));
      localStorage.setItem('funky-wall-lang', language);
    } catch {}
  }
  function toast(text) {
    $('#toast').textContent = text;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2800);
  }
  function translate(next) {
    language = next;
    document.documentElement.lang = next;
    $$('[data-de][data-en]').forEach((e) => (e.innerHTML = e.dataset[next]));
    $$('[data-language]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.language === next)),
    );
    $$('[data-close]').forEach((b) => b.setAttribute('aria-label', t('close')));
    $('[data-photo-prev]').setAttribute('aria-label', t('previous'));
    $('[data-photo-next]').setAttribute('aria-label', t('next'));
    $('.pack-toggle').setAttribute('aria-label', t('pack'));
    $$('.photo-tile').forEach((b) => {
      const f = D.flavours.find((f) => f.id === b.dataset.photo);
      b.setAttribute('aria-label', f.name + ' ' + t('photo'));
      const img = b.querySelector('img');
      if (!img.dataset.altDe) img.dataset.altDe = img.alt;
      img.alt = next === 'de' ? img.dataset.altDe : f.name + ' — ' + t('alt');
    });
    $('#dance-video').setAttribute(
      'aria-label',
      next === 'de'
        ? 'Colour Dance – stummer Lifestyle-Clip'
        : 'Colour Dance — silent lifestyle clip',
    );
    renderMix();
    renderPhoto();
    if (confirmation) renderConfirmation();
    videoLabel();
    motionLabel();
    store();
  }
  function renderMix() {
    const count = D.total(state);
    $('#flavour-rows').innerHTML = D.flavours
      .map(
        (f) =>
          `<div class="flavour-row" style="--flavour:${f.color}"><span class="flavour-dot" aria-hidden="true"></span><strong>${f.name}</strong><div class="stepper"><button data-adjust="${f.id}" data-delta="-1" aria-label="${f.name}: ${t('less')}" ${state.counts[f.id] === 0 ? 'disabled' : ''}>−</button><output aria-label="${f.name} ${t('cans')}">${state.counts[f.id]}</output><button data-adjust="${f.id}" data-delta="1" aria-label="${f.name}: ${t('more')}" ${count >= state.pack ? 'disabled' : ''}>+</button></div></div>`,
      )
      .join('');
    $$('[data-pack]').forEach((b) =>
      b.setAttribute('aria-pressed', String(+b.dataset.pack === state.pack)),
    );
    $('#mix-count').textContent = count;
    $('#selection-status').textContent =
      `${count} ${t('of')} ${state.pack} ${t('selected')}`;
    $('#selection-bar').style.width = (count / state.pack) * 100 + '%';
    $('#total-price').textContent = money(count * D.unitCents);
    $('#review-selection').disabled = count !== state.pack;
    const chosen = D.flavours.filter((f) => state.counts[f.id]);
    $('#selected-lines').innerHTML = chosen.length
      ? chosen
          .map(
            (f) =>
              `<p class="selected-line"><span>${state.counts[f.id]} × ${f.name}</span><span>${money(state.counts[f.id] * D.unitCents)}</span></p>`,
          )
          .join('')
      : `<p class="selected-empty">${t('empty')}</p>`;
  }
  function changeState(next) {
    state = next;
    if (confirmation) {
      confirmation = null;
      $('#confirmation').hidden = true;
      toast(t('changed'));
    }
    renderMix();
    store();
  }
  document.addEventListener('click', (e) => {
    const close = e.target.closest('[data-close]');
    if (close) {
      close.closest('dialog').close();
      return;
    }
    const adjust = e.target.closest('[data-adjust]');
    if (adjust) {
      changeState(
        D.adjust(state, adjust.dataset.adjust, +adjust.dataset.delta),
      );
      return;
    }
    const pack = e.target.closest('[data-pack]');
    if (pack) {
      changeState(D.setPack(state, +pack.dataset.pack));
      return;
    }
    const photo = e.target.closest('[data-photo]');
    if (photo) {
      photoIndex = D.ids.indexOf(photo.dataset.photo);
      renderPhoto();
      $('#photo-dialog').showModal();
    }
  });
  $('#all-flavours').onclick = () => changeState(D.allFlavours(state.pack));
  $$('[data-language]').forEach(
    (b) => (b.onclick = () => translate(b.dataset.language)),
  );
  function renderPhoto() {
    const f = D.flavours[photoIndex];
    $('#photo-title').textContent = f.name;
    const img = $('#photo-detail');
    const src = 'assets/photo-' + f.id + '.png';
    if (img.getAttribute('src') !== src) img.src = src;
    img.alt = f.name + ' — ' + t('alt');
    $('#choose-photo').textContent = t('choose');
  }
  $('[data-photo-prev]').onclick = () => {
    photoIndex = (photoIndex + D.ids.length - 1) % D.ids.length;
    renderPhoto();
  };
  $('[data-photo-next]').onclick = () => {
    photoIndex = (photoIndex + 1) % D.ids.length;
    renderPhoto();
  };
  $('#photo-dialog').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      photoIndex =
        (photoIndex + (e.key === 'ArrowRight' ? 1 : D.ids.length - 1)) %
        D.ids.length;
      renderPhoto();
    }
  });
  $('#choose-photo').onclick = () => {
    const id = D.ids[photoIndex];
    $('#photo-dialog').close();
    if (D.total(state) < state.pack) {
      changeState(D.adjust(state, id, 1));
      toast(t('added'));
    } else toast(t('full'));
    $('#shop').scrollIntoView({
      behavior: motionPaused ? 'instant' : 'smooth',
    });
  };
  $$('dialog').forEach((d) =>
    d.addEventListener('click', (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }),
  );
  function summaryLines(order) {
    return (
      order.lines
        .map(
          (line) =>
            `<p class="review-row"><span>${line.qty} × ${line.name}</span><strong>${money(line.lineCents)}</strong></p>`,
        )
        .join('') +
      `<p class="review-row review-total"><span>${t('total')}</span><strong>${money(order.totalCents)}</strong></p>`
    );
  }
  $('#review-selection').onclick = () => {
    if (D.total(state) !== state.pack) {
      toast(t('incomplete'));
      return;
    }
    const order = D.snapshot(state, '');
    $('#review-lines').innerHTML = summaryLines(order);
    $('#review-dialog').showModal();
  };
  $('#confirm-selection').onclick = () => {
    if (D.total(state) !== state.pack) return;
    $('#review-dialog').close();
    $('#checkout-summary').innerHTML = summaryLines(D.snapshot(state, ''));
    $('#checkout-dialog').showModal();
  };
  $('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity() || D.total(state) !== state.pack) return;
    const fields = [
      'firstName',
      'lastName',
      'email',
      'street',
      'postal',
      'city',
    ];
    for (const name of fields) {
      const input = form.elements.namedItem(name);
      if (!input.value.trim()) {
        input.value = '';
        input.reportValidity();
        return;
      }
    }
    const values = Object.fromEntries(new FormData(form));
    const ref = 'FM-' + Date.now().toString(36).slice(-7).toUpperCase();
    confirmation = D.snapshot(state, ref);
    $('#checkout-dialog').close();
    renderConfirmation();
    const address = $('#confirmation-address');
    address.replaceChildren();
    const title = document.createElement('strong');
    title.textContent =
      language === 'de'
        ? 'Lieferdaten für diesen Testkauf'
        : 'Delivery details for this test purchase';
    address.append(title);
    for (const value of [
      values.firstName + ' ' + values.lastName,
      values.street,
      values.extra,
      values.postal + ' ' + values.city,
      values.country,
      values.email,
    ]) {
      if (!value) continue;
      const line = document.createElement('p');
      line.textContent = value;
      address.append(line);
    }
    form.reset();
    $('#confirmation').hidden = false;
    $('#confirmation').scrollIntoView({
      behavior: motionPaused ? 'instant' : 'smooth',
      block: 'start',
    });
    toast(
      language === 'de'
        ? 'Dein Testkauf ist bestätigt. Keine Zahlung ausgelöst.'
        : 'Your test purchase is confirmed. No payment processed.',
    );
  });
  function renderConfirmation() {
    if (!confirmation) return;
    $('#confirmation-details').innerHTML =
      `<p class="confirmation-reference">${t('reference')}: ${confirmation.reference}</p><div class="confirmation-lines">${confirmation.lines.map((line) => `<p><span>${line.qty} × ${line.name}</span><strong>${money(line.lineCents)}</strong></p>`).join('')}<p class="confirmed-total"><span>${t('total')}</span><strong>${money(confirmation.totalCents)}</strong></p></div>`;
  }
  $('#change-selection').onclick = () => {
    confirmation = null;
    $('#confirmation').hidden = true;
    $('#shop').scrollIntoView({
      behavior: motionPaused ? 'instant' : 'smooth',
    });
  };
  $$('[data-info]').forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.info;
        $('#info-title').textContent = t(id + 'Title');
        $('#info-content').textContent = t(id);
        if (id === 'credits') {
          const a = document.createElement('a');
          a.href =
            'https://www.pexels.com/video/woman-dancing-with-a-shining-background-6835385/';
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = ' Mikhail Nilov / Pexels ↗';
          $('#info-content').append(a);
        }
        $('#info-dialog').showModal();
      }),
  );
  const video = $('#dance-video');
  video.controls = false;
  video.loop = true;
  video.muted = true;
  let videoInView = false,
    videoUserPaused = false,
    explicitVideoPlay = false;
  function videoLabel() {
    $('#video-play').textContent = video.paused ? '▶' : 'Ⅱ';
    $('#video-play').setAttribute(
      'aria-label',
      t(video.paused ? 'play' : 'pause'),
    );
    $('#video-expand').setAttribute(
      'aria-label',
      t(
        $('#film-shell').classList.contains('expanded') ? 'collapse' : 'expand',
      ),
    );
  }
  function updateVideo() {
    if (
      videoInView &&
      !videoUserPaused &&
      (!motionPaused || explicitVideoPlay) &&
      !document.hidden
    )
      video.play().catch(videoLabel);
    else video.pause();
    videoLabel();
  }
  $('#video-play').onclick = () => {
    if (video.paused) {
      videoUserPaused = false;
      explicitVideoPlay = true;
      video.play().catch(videoLabel);
    } else {
      videoUserPaused = true;
      explicitVideoPlay = false;
      video.pause();
    }
    videoLabel();
  };
  ['play', 'pause'].forEach((event) =>
    video.addEventListener(event, videoLabel),
  );
  new IntersectionObserver(
    ([e]) => {
      videoInView = e.isIntersecting;
      updateVideo();
    },
    { threshold: 0.2 },
  ).observe(video);
  document.addEventListener('visibilitychange', updateVideo);
  $('#video-expand').onclick = () => {
    $('#film-shell').classList.toggle('expanded');
    videoLabel();
  };
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('#film-shell').classList.remove('expanded');
      videoLabel();
    }
  });
  function motionLabel() {
    $('#motion-toggle').textContent = t(
      motionPaused ? 'motionPlay' : 'motionPause',
    );
    $('#motion-toggle').setAttribute('aria-pressed', String(motionPaused));
  }
  function setMotion(value, persist) {
    motionPaused = value;
    document.body.classList.toggle('motion-paused', value);
    document.documentElement.style.scrollBehavior = value ? 'auto' : '';
    if (value) {
      explicitVideoPlay = false;
      window.FunkyIntro?.finish();
    }
    motionLabel();
    updateVideo();
    if (persist)
      try {
        localStorage.setItem('funky-wall-motion', value ? 'paused' : 'playing');
      } catch {}
  }
  $('#motion-toggle').onclick = () => setMotion(!motionPaused, true);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener(
    'change',
    (e) => setMotion(e.matches, false),
  );
  translate(language);
  setMotion(motionPaused, false);
})();
