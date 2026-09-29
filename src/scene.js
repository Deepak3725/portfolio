import * as THREE from 'three'

const clamp = THREE.MathUtils.clamp
const smooth = (from, to, value) => THREE.MathUtils.smoothstep(value, from, to)

const makePortraitTexture = (image, maskImage, renderer) => {
  const width = image.naturalWidth
  const height = image.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)

  // Use an organic figure silhouette so no circular or rectangular image edge
  // is introduced. The SVG mask feathers the silhouette while keeping the face sharp.
  context.globalCompositeOperation = 'destination-in'
  context.drawImage(maskImage, 0, 0, width, height)

  // Cool only the deepest tones, preserving the portrait's neutral highlights.
  const pixels = context.getImageData(0, 0, width, height)
  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance = pixels.data[index] * 0.2126 + pixels.data[index + 1] * 0.7152 + pixels.data[index + 2] * 0.0722
    const shadow = Math.max(0, Math.min(1, (150 - luminance) / 150))
    const tint = shadow * 0.035
    pixels.data[index] *= 1 - tint * 0.22
    pixels.data[index + 1] *= 1 - tint * 0.08
    pixels.data[index + 2] *= 1 + tint
  }
  context.putImageData(pixels, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
  return texture
}

const getJourneyState = (progress) => {
  const stops = [
    { at: 0, x: 0, y: 0, scale: 1, rx: 0.012, ry: -0.025 },
    { at: 0.16, x: -0.12, y: 0.14, scale: 1.025, rx: 0.035, ry: 0.015 },
    { at: 0.39, x: -0.84, y: 0.07, scale: 0.94, rx: -0.018, ry: 0.045 },
    { at: 0.62, x: -0.5, y: -0.28, scale: 0.82, rx: -0.035, ry: -0.02 },
    { at: 0.83, x: 0.02, y: -0.17, scale: 0.73, rx: 0.018, ry: -0.04 },
    { at: 1, x: 0.12, y: 0.08, scale: 0.7, rx: 0, ry: -0.01 },
  ]
  const index = stops.findIndex((stop, stopIndex) => progress <= stop.at && stopIndex > 0)
  const next = stops[index < 0 ? stops.length - 1 : index]
  const previous = stops[Math.max(0, (index < 0 ? stops.length : index) - 1)]
  const amount = smooth(previous.at, next.at, progress)
  const lerp = (key) => THREE.MathUtils.lerp(previous[key], next[key], amount)
  return { x: lerp('x'), y: lerp('y'), scale: lerp('scale'), rx: lerp('rx'), ry: lerp('ry') }
}

/**
 * Image-sequence-ready portrait scene.
 * Pass a list of frame URLs in sequenceUrls to map the scroll timeline to
 * consistent frames. With no sequence, the approved single portrait remains
 * the source of truth and receives restrained depth, lighting, and transforms.
 */
export const initHeroScene = (canvas, stage, { sequenceUrls = [] } = {}) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const image = new Image()
  const maskImage = new Image()
  image.decoding = 'async'
  maskImage.decoding = 'async'
  image.src = `${import.meta.env.BASE_URL}images/deepak-portrait-reference.png`
  maskImage.src = `${import.meta.env.BASE_URL}images/deepak-portrait-mask.svg`

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch (error) {
    stage.classList.add('is-static')
    console.warn('WebGL is unavailable; using the supplied portrait fallback.', error)
    return { setScrollProgress() {}, setChapter() {}, destroy() {} }
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.04

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80)
  camera.position.set(0, 0, 9)

  const ambient = new THREE.HemisphereLight(0xd8def0, 0x100c12, 1.1)
  scene.add(ambient)
  const warmLight = new THREE.PointLight(0xa74735, 2.8, 13, 2)
  warmLight.position.set(-3.5, 1.5, 2.6)
  scene.add(warmLight)
  const blueLight = new THREE.PointLight(0x527bdb, 1.4, 14, 2)
  blueLight.position.set(3.4, 1.2, 2.2)
  scene.add(blueLight)
  const violetLight = new THREE.PointLight(0x805ce0, 1, 12, 2)
  violetLight.position.set(1.5, -3.2, 1.8)
  scene.add(violetLight)

  const portraitGroup = new THREE.Group()
  scene.add(portraitGroup)

  let portraitMesh
  let portraitTexture
  let stopped = false
  let visible = true
  let progress = 0
  let pointerX = 0
  let pointerY = 0
  let currentPointerX = 0
  let currentPointerY = 0
  let rafId = 0
  const sequenceCache = new Map()
  const sequencePending = new Set()
  let sequenceQueue = []
  let sequenceMaterial
  let sequenceTarget = 0
  let previousSequenceTarget = 0
  const sequenceLoader = sequenceUrls.length ? new THREE.TextureLoader() : null

  const trimSequenceCache = () => {
    while (sequenceCache.size > 8) {
      const staleIndex = [...sequenceCache.keys()].find((index) =>
        Math.abs(index - sequenceTarget) > 2 && sequenceCache.get(index) !== sequenceMaterial?.map,
      )
      if (staleIndex === undefined) break
      sequenceCache.get(staleIndex).dispose()
      sequenceCache.delete(staleIndex)
    }
  }

  const pumpSequenceQueue = () => {
    if (!sequenceLoader || stopped) return
    while (sequencePending.size < 2 && sequenceQueue.length) {
      const index = sequenceQueue.shift()
      if (sequenceCache.has(index) || sequencePending.has(index)) continue
      sequencePending.add(index)
      sequenceLoader.load(sequenceUrls[index], (texture) => {
        sequencePending.delete(index)
        if (stopped) { texture.dispose(); return }
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 2)
        sequenceCache.set(index, texture)
        if (index === sequenceTarget && sequenceMaterial) {
          sequenceMaterial.map = texture
          sequenceMaterial.needsUpdate = true
        }
        trimSequenceCache()
        render()
        pumpSequenceQueue()
      }, undefined, () => {
        sequencePending.delete(index)
        pumpSequenceQueue()
      })
    }
  }

  const requestSequenceFrame = (value) => {
    if (!sequenceUrls.length || !sequenceMaterial) return
    const target = Math.round(clamp(value, 0, 1) * (sequenceUrls.length - 1))
    if (target === sequenceTarget && sequenceQueue.length === 0 && sequencePending.has(target)) return
    previousSequenceTarget = sequenceTarget
    sequenceTarget = target
    const direction = target >= previousSequenceTarget ? 1 : -1
    const priority = [target, target + direction, target - direction, target + direction * 2]
      .filter((index) => index >= 0 && index < sequenceUrls.length)
    const cached = sequenceCache.get(target)
    if (cached) {
      sequenceCache.delete(target)
      sequenceCache.set(target, cached)
      if (sequenceMaterial.map !== cached) {
        sequenceMaterial.map = cached
        sequenceMaterial.needsUpdate = true
      }
    }
    sequenceQueue = priority.filter((index) => !sequenceCache.has(index) && !sequencePending.has(index))
    trimSequenceCache()
    pumpSequenceQueue()
  }

  const imageReady = Promise.all([image, maskImage].map((asset) => new Promise((resolve) => {
    if (asset.complete && asset.naturalWidth) resolve()
    else {
      asset.addEventListener('load', resolve, { once: true })
      asset.addEventListener('error', resolve, { once: true })
    }
  }))).then(() => {
    if (!image.naturalWidth || !maskImage.naturalWidth) return
    portraitTexture = makePortraitTexture(image, maskImage, renderer)
    const imageAspect = image.naturalWidth / image.naturalHeight
    const height = 5.58
    portraitMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(height * imageAspect, height),
      new THREE.MeshBasicMaterial({ map: portraitTexture, transparent: true, opacity: 0.96, depthWrite: false, toneMapped: false }),
    )
    portraitMesh.position.set(0.02, 0.015, 0.04)
    portraitGroup.add(portraitMesh)

    if (sequenceUrls.length) {
      sequenceMaterial = portraitMesh.material
      requestSequenceFrame(progress)
    }
    render()
  })

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.position.z = Math.max(8.2, 6.25 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))))
    camera.updateProjectionMatrix()
    render()
  }

  const applyProgress = () => {
    const state = getJourneyState(reducedMotion.matches ? 0 : progress)
    const motion = reducedMotion.matches ? 0 : 1
    portraitGroup.position.set(state.x + currentPointerX * 0.1 * motion, state.y - currentPointerY * 0.08 * motion, 0)
    portraitGroup.rotation.set(state.rx + currentPointerY * 0.035 * motion, state.ry + currentPointerX * 0.045 * motion, currentPointerX * -0.012 * motion)
    portraitGroup.scale.setScalar(state.scale)
    warmLight.intensity = 0.18 + (1 - smooth(0.06, 0.46, progress)) * 2.7
    blueLight.intensity = 0.4 + smooth(0.24, 0.88, progress) * 2.55
    violetLight.intensity = 0.38 + smooth(0.1, 0.44, progress) * (1 - smooth(0.49, 0.86, progress)) * 1.45

    requestSequenceFrame(progress)
  }

  const render = () => {
    if (stopped || !visible || document.hidden) return
    applyProgress()
    renderer.render(scene, camera)
  }

  const settlePointer = () => {
    rafId = 0
    if (stopped || !visible || document.hidden || reducedMotion.matches) return
    currentPointerX = THREE.MathUtils.damp(currentPointerX, pointerX, 10, 1 / 60)
    currentPointerY = THREE.MathUtils.damp(currentPointerY, pointerY, 10, 1 / 60)
    render()
    if (Math.abs(currentPointerX - pointerX) > 0.001 || Math.abs(currentPointerY - pointerY) > 0.001) {
      rafId = requestAnimationFrame(settlePointer)
    }
  }

  const requestPointerFrame = () => {
    if (!rafId && !reducedMotion.matches) rafId = requestAnimationFrame(settlePointer)
  }

  const setScrollProgress = (value) => {
    progress = clamp(value, 0, 1)
    render()
  }

  const onPointerMove = (event) => {
    const bounds = stage.getBoundingClientRect()
    pointerX = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5)
    pointerY = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5)
    requestPointerFrame()
  }
  const onPointerLeave = () => { pointerX = 0; pointerY = 0; requestPointerFrame() }
  const onVisibilityChange = () => { if (!document.hidden) render() }
  const onMotionChange = () => { currentPointerX = 0; currentPointerY = 0; render() }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting || window.scrollY > 0
    if (visible) render()
  })
  visibilityObserver.observe(stage)
  stage.addEventListener('pointermove', onPointerMove, { passive: true })
  stage.addEventListener('pointerleave', onPointerLeave, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
  reducedMotion.addEventListener('change', onMotionChange)
  resize()
  imageReady.then(render)

  return {
    setScrollProgress,
    setChapter() {},
    destroy() {
      stopped = true
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      reducedMotion.removeEventListener('change', onMotionChange)
      portraitTexture?.dispose()
      sequenceCache.forEach((texture) => texture.dispose())
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else object.material?.dispose()
      })
      renderer.dispose()
    },
  }
}
