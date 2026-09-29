import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const smooth = (from, to, value) => {
  const position = clamp01((value - from) / (to - from))
  return position * position * (3 - 2 * position)
}

const atmosphereStops = [
  { at: 0, warm: 1, burgundy: 0.96, indigo: 0.08, blue: 0.04, violet: 0.06 },
  { at: 0.2, warm: 0.84, burgundy: 1, indigo: 0.18, blue: 0.1, violet: 0.18 },
  { at: 0.4, warm: 0.52, burgundy: 0.94, indigo: 0.48, blue: 0.3, violet: 0.48 },
  { at: 0.62, warm: 0.24, burgundy: 0.82, indigo: 0.82, blue: 0.64, violet: 0.46 },
  { at: 0.82, warm: 0.1, burgundy: 0.65, indigo: 1, blue: 0.94, violet: 0.3 },
  { at: 1, warm: 0.4, burgundy: 0.82, indigo: 0.78, blue: 0.76, violet: 0.24 },
]

const atmosphereAt = (progress, key) => {
  const nextIndex = atmosphereStops.findIndex((stop, index) => progress <= stop.at && index > 0)
  if (nextIndex < 0) return atmosphereStops.at(-1)[key]
  const previous = atmosphereStops[nextIndex - 1]
  const next = atmosphereStops[nextIndex]
  const amount = smooth(previous.at, next.at, progress)
  return previous[key] + (next[key] - previous[key]) * amount
}

export const initPageAnimations = ({ getScene }) => {
  const header = document.querySelector('.site-header')
  const menuButton = document.querySelector('.menu-toggle')
  const navigation = document.querySelector('.main-nav')
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const root = document.documentElement
  let sceneController
  let lastScroll = window.scrollY

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false')
    menuButton.setAttribute('aria-label', 'Open navigation menu')
    navigation.classList.remove('is-open')
    document.body.classList.remove('menu-open')
  }

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true'
    menuButton.setAttribute('aria-expanded', String(!expanded))
    menuButton.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu')
    navigation.classList.toggle('is-open', !expanded)
    document.body.classList.toggle('menu-open', !expanded)
  })

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
  document.querySelector('.header-contact').addEventListener('click', closeMenu)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu()
  })

  getScene().then((scene) => {
    sceneController = scene
    sceneController?.setScrollProgress(journeyState.progress)
  })

  const navLinks = [...navigation.querySelectorAll('a')]
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const active = link.hash === `#${id}`
      link.classList.toggle('is-active', active)
      if (active) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  const updateJourney = (progress) => {
    const value = clamp01(progress)
    root.style.setProperty('--journey-progress', value.toFixed(4))
    root.style.setProperty('--journey-warm', atmosphereAt(value, 'warm').toFixed(4))
    root.style.setProperty('--journey-burgundy', atmosphereAt(value, 'burgundy').toFixed(4))
    root.style.setProperty('--journey-indigo', atmosphereAt(value, 'indigo').toFixed(4))
    root.style.setProperty('--journey-violet', atmosphereAt(value, 'violet').toFixed(4))
    root.style.setProperty('--journey-blue', atmosphereAt(value, 'blue').toFixed(4))
    sceneController?.setScrollProgress(value)
  }

  const journeyState = { progress: 0 }
  const journey = gsap.timeline({
    scrollTrigger: {
      id: 'scene-scroll',
      trigger: '.page-main',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress === 0 || self.progress === 1) updateJourney(self.progress)
      },
    },
  })
  journey.to(journeyState, {
    progress: 1,
    duration: 1,
    ease: 'none',
    onUpdate: () => updateJourney(journeyState.progress),
  })

  const sectionIds = ['home', 'about', 'work', 'skills', 'services', 'contact']
  sectionIds.forEach((id) => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setActiveLink(id),
      onEnterBack: () => setActiveLink(id),
    })
  })

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top -24',
    onUpdate: () => {
      const current = window.scrollY
      header.classList.toggle('is-scrolled', current > 24)
      header.classList.toggle('scrolling-up', current < lastScroll)
      lastScroll = current
    },
  })

  if (motionPreference.matches) {
    gsap.set('[data-reveal]', { autoAlpha: 1, y: 0, clearProps: 'clipPath' })
  } else {
    // One masked reveal per section keeps the content grouped and scrub-reversible.
    const revealGroups = [
      { trigger: '#about', targets: ['#about .section-heading h2', '#about .about-layout'] },
      { trigger: '#work', targets: ['#work .section-heading h2', '#work .section-aside', '#work .project-grid'] },
      { trigger: '#skills', targets: ['#skills .section-heading h2', '#skills .section-aside', '#skills .skills-grid'] },
      { trigger: '#services', targets: ['#services .section-heading h2', '#services .services-list', '#services .services-cta'] },
      { trigger: '#contact', targets: ['#contact .section-kicker', '#contact h2', '#contact .contact-copy', '#contact .contact-email', '#contact .contact-socials'] },
    ]

    revealGroups.forEach(({ trigger, targets }) => {
      gsap.fromTo(targets.join(', '),
        { clipPath: 'inset(0% 0% 100% 0%)', y: 18 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
          duration: 1,
          stagger: 0.055,
          ease: 'none',
          scrollTrigger: { trigger, start: 'top 86%', end: 'top 38%', scrub: 0.8, invalidateOnRefresh: true },
        },
      )
    })

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.project-card').forEach((card) => {
        const preview = card.querySelector('.project-preview')
        card.addEventListener('pointermove', (event) => {
          const bounds = card.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width - 0.5
          const y = (event.clientY - bounds.top) / bounds.height - 0.5
          gsap.to(preview, { '--tilt-x': `${-y * 2.4}deg`, '--tilt-y': `${x * 2.8}deg`, duration: 0.35, overwrite: true })
        })
        card.addEventListener('pointerleave', () => {
          gsap.to(preview, { '--tilt-x': '0deg', '--tilt-y': '0deg', duration: 0.5, ease: 'power2.out', overwrite: true })
        })
      })
    }
  }

  ScrollTrigger.refresh()
  document.fonts?.ready.then(() => ScrollTrigger.refresh())

  return {
    destroy() {
      closeMenu()
      journey.scrollTrigger?.kill()
      journey.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      sceneController?.destroy()
      gsap.killTweensOf('[data-reveal], .project-preview')
    },
  }
}
