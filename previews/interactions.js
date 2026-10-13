document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const dropdowns = nav?.querySelectorAll('.header-dropdown') || [];
  if (document.body.classList.contains('document-page')) {
    nav?.querySelectorAll('a').forEach(link => {
      if (link.pathname === window.location.pathname && !link.hash) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        link.closest('.header-dropdown')?.querySelector('.nav-dropdown-toggle')?.classList.add('active');
      }
    });
  }
  const setDropdown = (dropdown, open) => {
    dropdown.classList.toggle('dropdown-open', open);
    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', String(open));
  };
  const closeDropdowns = () => dropdowns.forEach(dropdown => setDropdown(dropdown, false));
  if (dropdowns.length) {
    const header = document.querySelector('.site-header');
    const updateHeader = () => {
      header?.classList.toggle('sticked', window.scrollY > 60);
      const position = window.scrollY + 180;
      nav.querySelectorAll('a[href^="#"]').forEach(link => {
        const section = document.querySelector(link.hash);
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.scrollY;
        const active = position >= top && position <= top + section.offsetHeight;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }
  const closeMenu = () => {
    menu?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    closeDropdowns();
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
    if (event.key === 'Escape') closeDropdowns();
  });
  dropdowns.forEach(dropdown => {
    dropdown.querySelector('.nav-dropdown-toggle')?.addEventListener('click', () => {
      const open = !dropdown.classList.contains('dropdown-open');
      closeDropdowns();
      setDropdown(dropdown, open);
    });
  });
  document.addEventListener('click', event => {
    dropdowns.forEach(dropdown => { if (!dropdown.contains(event.target)) setDropdown(dropdown, false); });
  });
  const interest = document.querySelector('#interest');
  document.querySelectorAll('[data-order]').forEach(link => {
    link.addEventListener('click', () => {
      if (interest) interest.value = link.dataset.order;
    });
  });
  const image = document.querySelector('.cut-active-image');
  const name = document.querySelector('.cut-active-name');
  const note = document.querySelector('.cut-active-note');
  document.querySelectorAll('.cut-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.cut-button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      if (image) { image.src = button.dataset.image; image.alt = `BTC Beef ${button.dataset.cut.toLowerCase()}`; }
      if (name) name.textContent = button.dataset.cut;
      if (note) note.textContent = button.dataset.note;
    });
  });
  const showcase = document.querySelector('[data-recipe-showcase]');
  if (showcase) {
    const photos = Array.from(showcase.querySelectorAll('.recipe-photo'));
    const recipes = Array.from(showcase.querySelectorAll('[data-recipe-photo]'));
    const list = showcase.querySelector('.recipe-list');
    const toggle = showcase.querySelector('.recipe-photo-toggle');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let timer;
    let visible = false;
    let paused = reducedMotion.matches;
    const showPhoto = index => {
      current = index;
      photos.forEach((photo, i) => {
        photo.classList.toggle('is-active', i === index);
        photo.setAttribute('aria-hidden', String(i !== index));
      });
      recipes.forEach((recipe, i) => recipe.classList.toggle('is-active', i === index));
    };
    const startRotation = () => {
      window.clearInterval(timer);
      if (paused || !visible || document.hidden || list.matches(':hover, :focus-within')) return;
      timer = window.setInterval(() => showPhoto((current + 1) % photos.length), 3000);
    };
    recipes.forEach(recipe => {
      const select = () => {
        window.clearInterval(timer);
        showPhoto(Number(recipe.dataset.recipePhoto));
      };
      recipe.addEventListener('pointerenter', select);
      recipe.addEventListener('focus', select);
    });
    list.addEventListener('pointerleave', startRotation);
    list.addEventListener('focusout', () => window.setTimeout(startRotation, 0));
    toggle.hidden = false;
    toggle.textContent = paused ? 'Play photos' : 'Pause photos';
    toggle.addEventListener('click', () => {
      paused = !paused;
      toggle.textContent = paused ? 'Play photos' : 'Pause photos';
      startRotation();
    });
    reducedMotion.addEventListener('change', event => {
      paused = event.matches;
      toggle.textContent = paused ? 'Play photos' : 'Pause photos';
      startRotation();
    });
    document.addEventListener('visibilitychange', startRotation);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      startRotation();
    }).observe(showcase);
  }
  const form = document.querySelector('.inquiry-form');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const result = form.querySelector('.form-result');
    if (form.hasAttribute('data-live-inquiry')) {
      const button = form.querySelector('button[type="submit"]');
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 20000);
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      result.hidden = false;
      result.dataset.error = 'false';
      result.textContent = 'Sending your inquiry…';
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: new FormData(form),
          headers: { Accept: 'application/json' }, signal: controller.signal
        });
        if (!response.ok) throw new Error('Submission failed');
        result.textContent = 'Thanks—your inquiry has been sent. We’ll be in touch with availability and next steps.';
        form.reset();
      } catch (error) {
        result.dataset.error = 'true';
        result.textContent = error.name === 'AbortError'
          ? 'The request took too long. Please try again or email btcbeef@gmail.com.'
          : 'We couldn’t send your inquiry. Please try again or email btcbeef@gmail.com.';
      } finally {
        window.clearTimeout(timer);
        button.disabled = false;
        form.removeAttribute('aria-busy');
      }
      return;
    }
    if (result) {
      result.textContent = `Thanks, ${form.elements.name.value}. Your ${interest.value.toLowerCase()} enquiry is ready to preview. This demonstration has not sent an email.`;
      result.hidden = false;
    }
  });
});
