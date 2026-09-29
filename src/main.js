import './style.css'
import { profile, projects, services, skillGroups } from './data/portfolio.js'
import { initPageAnimations } from './animations.js'
import {
  siBootstrap,
  siGithub,
  siGo,
  siHtml5,
  siJavascript,
  siMongodb,
  siMysql,
  siNodedotjs,
  siNumpy,
  siPandas,
  siPostgresql,
  siPython,
  siTelegram,
  siWhatsapp,
} from 'simple-icons'
import { faCss3Alt, faJava, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faBrain, faEnvelope } from '@fortawesome/free-solid-svg-icons'

const technologyIcons = {
  HTML: siHtml5,
  CSS: faCss3Alt,
  JavaScript: siJavascript,
  Bootstrap: siBootstrap,
  Go: siGo,
  Java: faJava,
  'Node.js': siNodedotjs,
  MySQL: siMysql,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  Python: siPython,
  NumPy: siNumpy,
  pandas: siPandas,
  'AI and machine learning fundamentals': faBrain,
  'DSA with Java': faJava,
}

const iconSvg = (icon, className = '') => {
  const [width, height, , , fontAwesomePath] = icon.icon ?? []
  const viewWidth = width ?? 24
  const viewHeight = height ?? 24
  const path = fontAwesomePath ?? icon.path
  return `<svg class="${className}" viewBox="0 0 ${viewWidth} ${viewHeight}" aria-hidden="true" focusable="false"><path d="${path}" /></svg>`
}

const technologyTag = (name) => {
  const icon = technologyIcons[name]
  if (!icon) return `<li>${name}</li>`
  const iconMarkup = iconSvg(icon, 'skill-icon').replace('<svg ', `<svg role="img" aria-label="${name} icon" `)
  return `<li>${iconMarkup}<span>${name}</span></li>`
}

const socialIcon = (icon) => iconSvg(icon, 'social-icon')

const projectPreview = (project) => {
  if (project.visual === 'coursehub') {
    return `<div class="project-preview preview-coursehub" aria-label="CourseHub project preview" role="img"><img class="project-preview-image" src="${import.meta.env.BASE_URL}images/coursehub-preview.jpg" alt="" aria-hidden="true" /></div>`
  }
  if (project.visual === 'marketplace') {
    return `<div class="project-preview preview-marketplace" aria-label="Service Marketplace project preview" role="img"><img class="project-preview-image" src="${import.meta.env.BASE_URL}images/service-marketplace-preview.jpg" alt="" aria-hidden="true" /></div>`
  }
  if (project.visual === 'skillswap') {
    return `<div class="project-preview preview-skillswap" aria-label="Skill Swap project preview" role="img"><img class="project-preview-image" src="${import.meta.env.BASE_URL}images/skill-swap-preview.jpg" alt="" aria-hidden="true" /></div>`
  }

  const preview = {
    coursehub: `
      <div class="preview-topbar"><span class="preview-brand"><i></i> coursehub</span><span class="preview-menu">Explore&nbsp;&nbsp; Teach&nbsp;&nbsp; Log in</span></div>
      <div class="preview-course-content"><small>LEARN AT YOUR PACE</small><strong>Skills for<br />what’s next.</strong><div class="preview-search">⌕ &nbsp; Find your next course</div><div class="course-thumbnails"><i>DESIGN<br /><b>01</b></i><i>DEVELOPMENT<br /><b>02</b></i><i>BUSINESS<br /><b>03</b></i></div></div>`,
    marketplace: `
      <div class="preview-topbar"><span class="preview-brand"><i></i> handy</span><span class="preview-menu">Explore&nbsp;&nbsp; How it works</span></div>
      <div class="market-content"><div><small>LOCAL HELP, MADE SIMPLE</small><strong>Find your<br />kind of expert.</strong><span class="preview-search">⌕ &nbsp; What do you need?</span></div><div class="market-map"><i></i><b></b><em></em><span>●</span></div></div>
      <div class="provider-strip"><i>AM</i><span><b>Available nearby</b><small>People ready to help</small></span><strong>↗</strong></div>`,
  }[project.visual]

  return `<div class="project-preview preview-${project.visual}" aria-label="Illustrated concept preview for ${project.name}" role="img">${preview}</div>`
}

document.querySelector('#app').innerHTML = `
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="#home" aria-label="Wilte Tech, home">
      <img class="brand-logo" src="${import.meta.env.BASE_URL}images/wilte-tech-logo.png" alt="Wilte Tech" />
    </a>

    <nav class="main-nav" id="primary-navigation" aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#work">Work</a>
      <a href="#skills">Skills</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>
    </nav>

    <a class="header-contact" href="#contact"><span>Hire me</span><span class="arrow" aria-hidden="true">↗</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu">
      <span></span><span></span>
    </button>
  </header>

  <main id="main-content" class="page-main">
    <section class="hero" id="home" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-line"></span>Collaborative developer <span class="eyebrow-separator">/</span> Leading teams from idea to product</p>
        <h1 id="hero-title">Deepak<br /><span class="name-accent">Luitel.</span></h1>
        <p class="hero-description" aria-label="Hii, I am Deepak Luitel. AI and Full Stack Developer. I Build Modern Web Experiences.">
          <span class="typing-text">Hii, I am Deepak Luitel</span><span class="typing-caret" aria-hidden="true"></span>
        </p>
        <p class="hero-summary">I build useful digital products with thoughtful design and dependable engineering — from first sketch to final interaction.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#work"><span>View my work</span><span class="button-arrow" aria-hidden="true">↗</span></a>
          <a class="button button-secondary" href="#contact"><span>Let’s talk</span></a>
        </div>
        <div class="hero-socials" aria-label="Social links">
          <a href="${profile.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${socialIcon(siGithub)}<span>GitHub</span></a>
          <a href="${profile.linkedin}" target="_blank" rel="noreferrer" aria-label="LinkedIn">${socialIcon(faLinkedinIn)}<span>LinkedIn</span></a>
          <a href="mailto:${profile.email}" aria-label="Email">${socialIcon(faEnvelope)}<span>Email</span></a>
        </div>
      </div>

      <div class="hero-visual-space" aria-hidden="true"></div>
      <div class="hero-visual" role="img" aria-label="A cinematic, softly illuminated portrait from the supplied portfolio reference">
        <canvas class="portfolio-canvas" aria-hidden="true"></canvas>
        <img class="portrait-fallback" src="${import.meta.env.BASE_URL}images/deepak-portrait-reference.png" alt="" aria-hidden="true" style="--portrait-mask: url('${import.meta.env.BASE_URL}images/deepak-portrait-mask.svg')" />
      </div>
      <a href="#about" class="scroll-cue" aria-label="Scroll to about Deepak"><span class="scroll-cue-line"></span><span>Scroll to explore</span></a>
    </section>

    <section class="portfolio-section about-section" id="about" aria-labelledby="about-title">
      <div class="section-heading">
        <p class="section-kicker"><span>01</span> A little about me</p>
        <h2 id="about-title" data-reveal>Building with<br /><span>curiosity and care.</span></h2>
      </div>
      <div class="about-layout">
        <div class="about-copy" data-reveal>
          <p class="about-lead">I’m an undergraduate at Gyalpozing College of Information Technology, studying AI and Full Stack Development. I build modern web applications and useful digital experiences.</p>
          <p>I enjoy solving problems, learning new technologies, and turning ideas into functional products. My goal is to build beautiful, practical, and reliable software.</p>
          <a class="text-link" href="#contact">A bit more about working together <span aria-hidden="true">↗</span></a>
        </div>
        <aside class="about-note" data-reveal aria-label="Development approach">
          <div class="note-orbit" aria-hidden="true"><span></span><i></i></div>
          <p class="note-label">MY APPROACH</p>
          <p class="note-title">Good work starts with a good question.</p>
          <div class="note-foot"><span>Listen closely</span><span>Build deliberately</span><span>Refine the details</span></div>
        </aside>
      </div>
    </section>

    <section class="portfolio-section work-section" id="work" aria-labelledby="work-title">
      <div class="section-heading section-heading-row">
        <div><p class="section-kicker"><span>02</span> Selected work</p><h2 id="work-title" data-reveal>Ideas, made <span>tangible.</span></h2></div>
        <p class="section-aside" data-reveal>A few project concepts to show how I approach the problem, the interface, and the details.</p>
      </div>
      <div class="project-grid">
        ${projects.map((project) => `
          <article class="project-card" data-reveal>
            <a class="project-visual-link" href="#contact" aria-label="Ask Deepak about the ${project.name} concept">
              ${projectPreview(project)}
              <span class="preview-disclaimer">${project.visualLabel}</span>
            </a>
            <div class="project-info">
              <div class="project-title-line"><span class="project-number">${project.number} / 03</span><span class="project-category">${project.category}</span></div>
              <h3>${project.name}</h3>
              <p>${project.description}</p>
              <ul class="tag-list" aria-label="Technologies">${project.technologies.map((tech) => `<li>${tech}</li>`).join('')}</ul>
              <a class="project-link" href="#contact">Discuss a similar project <span aria-hidden="true">↗</span></a>
            </div>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="portfolio-section skills-section" id="skills" aria-labelledby="skills-title">
      <div class="section-heading section-heading-row">
        <div><p class="section-kicker"><span>03</span> Tools & technologies</p><h2 id="skills-title" data-reveal>A practical <span>toolkit.</span></h2></div>
        <p class="section-aside" data-reveal>The tools I use to take ideas from a useful first version to a reliable product.</p>
      </div>
      <div class="skills-grid">
        ${skillGroups.map((group) => `
          <article class="skill-group" data-reveal>
            <div class="skill-group-heading"><span>${group.number}</span><h3>${group.title}</h3><span class="skill-plus" aria-hidden="true">＋</span></div>
            <ul class="tag-list skill-tags">${group.skills.map(technologyTag).join('')}</ul>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="portfolio-section services-section" id="services" aria-labelledby="services-title">
      <div class="section-heading"><p class="section-kicker"><span>04</span> What I can help with</p><h2 id="services-title" data-reveal>From first idea<br />to <span>finished product.</span></h2></div>
      <div class="services-list">
        ${services.map((service) => `
          <article class="service-row" data-reveal>
            <span class="service-number">${service.number}</span>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <span class="service-arrow" aria-hidden="true">↗</span>
          </article>
        `).join('')}
      </div>
      <a class="button button-secondary services-cta" href="#contact">Tell me what you’re planning <span class="button-arrow" aria-hidden="true">↗</span></a>
    </section>

    <section class="contact-section" id="contact" aria-labelledby="contact-title">
      <div class="contact-glow" aria-hidden="true"></div>
      <p class="section-kicker" data-reveal><span>05</span> Start a conversation</p>
      <h2 data-reveal id="contact-title">Have a good<br />one in <span>mind?</span></h2>
      <p class="contact-copy" data-reveal>Tell me a little about what you’re building. I’d love to hear what’s next.</p>
      <a class="contact-email" data-reveal href="mailto:12250005.gcit@rub.edu.bt" aria-label="Email">${socialIcon(faEnvelope)}<span class="contact-email-address">12250005.gcit@rub.edu.bt</span><span class="contact-email-arrow" aria-hidden="true">↗</span></a>
      <div class="contact-socials" data-reveal>
        <a href="${profile.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${socialIcon(siGithub)}<span>GitHub</span></a>
        <a href="https://www.linkedin.com/in/deepak-luitel-139837360?utm_source=share_via&amp;utm_content=profile&amp;utm_medium=member_android" target="_blank" rel="noreferrer" aria-label="LinkedIn">${socialIcon(faLinkedinIn)}<span>LinkedIn</span></a>
        <a href="https://t.me/+97577665525" target="_blank" rel="noreferrer" aria-label="Telegram">${socialIcon(siTelegram)}<span>Telegram</span></a>
        <a href="https://wa.me/97577665525" target="_blank" rel="noreferrer" aria-label="WhatsApp">${socialIcon(siWhatsapp)}<span>WhatsApp</span></a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <a class="brand footer-brand" href="#home"><span class="brand-mark" aria-hidden="true">D<span>.</span></span><span class="brand-name">${profile.name}</span></a>
    <span class="copyright">© <span id="copyright-year"></span> ${profile.name}. Built with intention.</span>
    <nav class="footer-nav" aria-label="Footer navigation"><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></nav>
    <a class="back-to-top" href="#home" aria-label="Back to top">↑</a>
  </footer>
`

document.querySelector('#copyright-year').textContent = new Date().getFullYear()

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let typingTimeout
const phrases = ['Hii, I am Deepak Luitel', 'AI and Full Stack Developer', 'I Build Modern Web Experiences']
const typingNode = document.querySelector('.typing-text')
let phraseIndex = 0
let characterIndex = 0
let deleting = false

const typeNext = () => {
  if (reducedMotion.matches) {
    typingNode.textContent = phrases[0]
    return
  }
  const phrase = phrases[phraseIndex]
  characterIndex += deleting ? -1 : 1
  typingNode.textContent = phrase.slice(0, characterIndex)
  let delay = deleting ? 48 : 78
  if (!deleting && characterIndex === phrase.length) {
    deleting = true
    delay = 1900
  } else if (deleting && characterIndex === 0) {
    deleting = false
    phraseIndex = (phraseIndex + 1) % phrases.length
    delay = 520
  }
  typingTimeout = window.setTimeout(typeNext, delay)
}

typeNext()
reducedMotion.addEventListener('change', () => {
  window.clearTimeout(typingTimeout)
  if (!reducedMotion.matches) typeNext()
  else typingNode.textContent = phrases[0]
})

const sceneReady = import('./scene.js').then(({ initHeroScene }) => initHeroScene(
  document.querySelector('.portfolio-canvas'),
  document.querySelector('.hero-visual'),
)).catch((error) => {
  document.querySelector('.hero-visual').classList.add('is-static')
  console.warn('The 3D scene could not start; showing the supplied portrait instead.', error)
  return null
})

initPageAnimations({ getScene: () => sceneReady })
