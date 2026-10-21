import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Finding } from '../../shared/types'

export interface ScribbleFinding extends Finding {
  patternTitle?: string
  explanationText?: string
  noteScribble?: string
  anchor?: { x: number; y: number }
  side?: 'left' | 'right'
}

interface Props {
  src: string
  alt: string
  findings: Finding[]
  viewMode?: 'normal' | 'investigation'
  showOverlay: boolean
  activeId: string | null
  onActivate: (id: string) => void
  onWearSunglasses?: () => void
  isCustomUpload?: boolean
  onResetToDemo?: () => void
}

// Helper to create a rounded rectangle shape for Three.js geometry
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

export function Phone3DCanvas({
  src,
  alt: _alt,
  findings,
  viewMode = 'normal',
  showOverlay: _showOverlay,
  activeId,
  onActivate,
  onWearSunglasses,
  isCustomUpload: _isCustomUpload = false,
  onResetToDemo: _onResetToDemo,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 2D projected anchor positions for the handwritten notes & arrows
  const [projectedPoints, setProjectedPoints] = useState<
    Array<{
      id: string
      indexNum: number
      patternTitle: string
      explanationText: string
      targetX: number
      targetY: number
      noteX: number
      side: 'left' | 'right'
      active: boolean
    }>
  >([])

  // Three.js internal references
  const screenMeshRef = useRef<THREE.Mesh | null>(null)
  const phoneGroupRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // Physical phone bounds in 2D viewport pixels
  const phoneBoundsRef = useRef({ left: 160, right: 380, top: 60, bottom: 620 })

  // Movable Sunglasses Inspector state
  const [glassesPos, setGlassesPos] = useState({ x: 270, y: 220 })
  const [isDraggingGlasses, setIsDraggingGlasses] = useState(false)
  const isInteractingRef = useRef(false)
  const glassesPosRef = useRef({ x: 270, y: 220 })

  // Extract handwritten note parts: number at top, pattern title below, then explanation
  const getNoteHierarchy = (f: Finding, idx: number) => {
    const scribbleF = f as ScribbleFinding
    const patternTitle = scribbleF.patternTitle || f.pattern
    let explanationText = scribbleF.explanationText || scribbleF.noteScribble

    if (!explanationText) {
      if (f.pattern === 'False Urgency') {
        explanationText = 'Resetting countdown timer to panic you into buying before comparing options'
      } else if (f.pattern === 'Preselection') {
        explanationText = 'Silently auto-checks an extra $9.95/mo recurring warranty fee'
      } else if (f.pattern === 'Interface Interference') {
        explanationText = 'Giant primary button vs camouflaged microscopic decline text'
      } else if (f.pattern === 'Confirmshaming') {
        explanationText = 'Guilt-trips you as "reckless" for simply declining paid coverage'
      } else {
        explanationText = f.translation || f.explanation || f.evidence
      }
    }

    return {
      indexNum: idx + 1,
      patternTitle,
      explanationText,
    }
  }

  // 1. Set up Three.js scene (Floating iPhone without draft/touch responsiveness)
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth || 540
    const height = container.clientHeight || 640

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 0, 10.8)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(6, 8, 9)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x99bbff, 1.5)
    rimLight.position.set(-6, -6, 5)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8)
    fillLight.position.set(0, 2, 7)
    scene.add(fillLight)

    // iPhone Model Group
    const phoneGroup = new THREE.Group()
    phoneGroupRef.current = phoneGroup
    scene.add(phoneGroup)

    const phoneWidth = 3.2
    const phoneHeight = 6.6
    const phoneDepth = 0.32
    const cornerRadius = 0.44

    // Titanium / Space Black Body
    const bodyShape = createRoundedRectShape(phoneWidth, phoneHeight, cornerRadius)
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: phoneDepth,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 5,
    })
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x16161a,
      metalness: 0.88,
      roughness: 0.28,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.position.z = -phoneDepth / 2
    phoneGroup.add(bodyMesh)

    // Outer Edge Antenna Band
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x24242c,
      metalness: 0.95,
      roughness: 0.22,
    })
    const bandGeo = new THREE.BoxGeometry(phoneWidth + 0.04, phoneHeight + 0.04, phoneDepth * 0.92)
    const bandMesh = new THREE.Mesh(bandGeo, bandMat)
    phoneGroup.add(bandMesh)

    // Screen Glass & Texture Plane
    const screenWidth = phoneWidth - 0.22
    const screenHeight = phoneHeight - 0.22
    const screenRadius = cornerRadius - 0.08
    const screenShape = createRoundedRectShape(screenWidth, screenHeight, screenRadius)
    const screenGeo = new THREE.ShapeGeometry(screenShape)

    // Normalize UV coordinates for edge-to-edge texture fit
    const pos = screenGeo.attributes.position
    const uvs = []
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i)
      const py = pos.getY(i)
      const u = (px + screenWidth / 2) / screenWidth
      const v = (py + screenHeight / 2) / screenHeight
      uvs.push(u, v)
    }
    screenGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

    // Initial Screen Texture
    const textureLoader = new THREE.TextureLoader()
    const screenTexture = textureLoader.load(src)
    screenTexture.colorSpace = THREE.SRGBColorSpace
    screenTexture.generateMipmaps = true
    screenTexture.minFilter = THREE.LinearMipmapLinearFilter

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    })
    const screenMesh = new THREE.Mesh(screenGeo, screenMat)
    screenMesh.position.set(0, 0, phoneDepth / 2 + 0.042)
    phoneGroup.add(screenMesh)
    screenMeshRef.current = screenMesh

    // Dynamic Island Pill
    const islandWidth = 0.72
    const islandHeight = 0.2
    const islandRadius = 0.1
    const islandShape = createRoundedRectShape(islandWidth, islandHeight, islandRadius)
    const islandGeo = new THREE.ShapeGeometry(islandShape)
    const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const islandMesh = new THREE.Mesh(islandGeo, islandMat)
    islandMesh.position.set(0, screenHeight / 2 - 0.25, phoneDepth / 2 + 0.045)
    phoneGroup.add(islandMesh)

    // Reusable 3D vector for projecting coordinate space
    const tempVec = new THREE.Vector3()

    // 2. Animation Frame Loop (Natural Levitation Hovering without drafts/touch drag)
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)

      const t = clock.getElapsedTime()

      // Pure, graceful floating levitation physics (untouched by mouse drafts)
      const floatY = Math.sin(t * 1.25) * 0.08
      const floatTiltX = Math.sin(t * 0.9) * 0.025
      const floatTiltY = Math.cos(t * 0.7) * 0.035

      phoneGroup.position.y = floatY
      phoneGroup.rotation.x = 0.04 + floatTiltX
      phoneGroup.rotation.y = -0.04 + floatTiltY

      // Project 3D Screen Coordinates to 2D Viewport Space
      if (findings.length > 0 && containerRef.current) {
        const curW = containerRef.current.clientWidth || width
        const curH = containerRef.current.clientHeight || height

        // Physical phone bounds in 2D pixel space
        const leftEdgeVec = new THREE.Vector3(-phoneWidth / 2 - 0.1, 0, phoneDepth / 2)
        leftEdgeVec.applyMatrix4(phoneGroup.matrixWorld)
        leftEdgeVec.project(camera)
        const phoneLeftPixelX = (leftEdgeVec.x * 0.5 + 0.5) * curW

        const rightEdgeVec = new THREE.Vector3(phoneWidth / 2 + 0.1, 0, phoneDepth / 2)
        rightEdgeVec.applyMatrix4(phoneGroup.matrixWorld)
        rightEdgeVec.project(camera)
        const phoneRightPixelX = (rightEdgeVec.x * 0.5 + 0.5) * curW

        phoneBoundsRef.current = {
          left: Math.round(phoneLeftPixelX),
          right: Math.round(phoneRightPixelX),
          top: Math.round(curH * 0.5 - 290),
          bottom: Math.round(curH * 0.5 + 290),
        }

        const points = findings.map((f, i) => {
          const bbox = f.bbox || { x: 50, y: 30 + i * 15, w: 60, h: 8 }
          const preferredSide: 'left' | 'right' = (f as ScribbleFinding).side || (i % 2 === 0 ? 'right' : 'left')

          // Arrow terminates on the SIDE of the element facing the incoming note!
          // Right notes: target the right edge of the bbox
          // Left notes: target the left edge of the bbox
          const sideOffset = 1.8 // % padding inside boundary
          const sideTargetPercentX = preferredSide === 'right'
            ? Math.min(94, bbox.x + bbox.w - sideOffset)
            : Math.max(6, bbox.x + sideOffset)

          const normX = sideTargetPercentX / 100
          const normY = (bbox.y + bbox.h * 0.5) / 100

          // Screen local 3D coordinates
          const localX = (normX - 0.5) * screenWidth
          const localY = (0.5 - normY) * screenHeight
          const localZ = phoneDepth / 2 + 0.05

          // Transform into world space and project onto camera plane
          tempVec.set(localX, localY, localZ)
          tempVec.applyMatrix4(phoneGroup.matrixWorld)
          tempVec.project(camera)

          // 2D Pixel Coordinates of side target point
          const screenPixelX = (tempVec.x * 0.5 + 0.5) * curW
          const screenPixelY = (-(tempVec.y * 0.5) + 0.5) * curH

          // Position note completely outside the phone screen in outer margins
          const noteMargin = 30
          const noteX =
            preferredSide === 'right'
              ? Math.max(phoneRightPixelX + noteMargin, Math.round(screenPixelX) + 110)
              : Math.min(phoneLeftPixelX - noteMargin, Math.round(screenPixelX) - 110)

          const noteData = getNoteHierarchy(f, i)

          return {
            id: f.id,
            indexNum: noteData.indexNum,
            patternTitle: noteData.patternTitle,
            explanationText: noteData.explanationText,
            targetX: Math.round(screenPixelX),
            targetY: Math.round(screenPixelY),
            noteX: Math.round(noteX),
            side: preferredSide,
            active: activeId === f.id,
          }
        })

        setProjectedPoints(points)
      } else {
        setProjectedPoints([])
      }

      renderer.render(scene, camera)
    }

    animate()

    // Responsive Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const newW = container.clientWidth
      const newH = container.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      renderer.dispose()
      bodyGeo.dispose()
      bandGeo.dispose()
      screenGeo.dispose()
      islandGeo.dispose()
      bodyMat.dispose()
      bandMat.dispose()
      screenMat.dispose()
      islandMat.dispose()
    }
  }, [findings, activeId, src])

  // Update screen texture when `src` prop changes
  useEffect(() => {
    if (!screenMeshRef.current) return
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
      if (screenMeshRef.current) {
        ;(screenMeshRef.current.material as THREE.MeshBasicMaterial).map = tex
        ;(screenMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
      }
    })
  }, [src])

  // 3. Autonomous Idle Motion of Sunglasses across the phone (when user is not interacting)
  useEffect(() => {
    if (viewMode === 'investigation') return

    let animId: number
    const startTime = Date.now()

    const loop = () => {
      if (!isInteractingRef.current) {
        const elapsed = (Date.now() - startTime) / 1000
        const bounds = phoneBoundsRef.current
        const centerX = (bounds.left + bounds.right) / 2
        // Gentle sweeping figure-8 hover over the mobile screen
        const targetX = centerX + Math.sin(elapsed * 0.85) * 38
        const targetY = 260 + Math.cos(elapsed * 1.15) * 80

        // Smooth spring interpolation
        glassesPosRef.current.x += (targetX - glassesPosRef.current.x) * 0.08
        glassesPosRef.current.y += (targetY - glassesPosRef.current.y) * 0.08

        setGlassesPos({
          x: Math.round(glassesPosRef.current.x),
          y: Math.round(glassesPosRef.current.y),
        })
      }
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [viewMode])

  // 4. Pointer Interaction for the Movable Sunglasses
  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (viewMode === 'investigation') return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    if (isDraggingGlasses) {
      isInteractingRef.current = true
      glassesPosRef.current = { x: localX, y: localY }
      setGlassesPos({ x: localX, y: localY })
    } else if (e.pointerType === 'mouse') {
      // Magnetic cursor attraction on desktop hover
      isInteractingRef.current = true
      glassesPosRef.current.x += (localX - glassesPosRef.current.x) * 0.2
      glassesPosRef.current.y += (localY - glassesPosRef.current.y) * 0.2
      setGlassesPos({
        x: Math.round(glassesPosRef.current.x),
        y: Math.round(glassesPosRef.current.y),
      })
    }
  }

  const handleSpecsPointerDown = (e: React.PointerEvent) => {
    if (viewMode === 'investigation') return
    e.stopPropagation()
    isInteractingRef.current = true
    setIsDraggingGlasses(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handleSpecsPointerUp = (e: React.PointerEvent) => {
    setIsDraggingGlasses(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  // Check if sunglasses lens is positioned over the mobile screen
  const isOverScreen =
    glassesPos.x >= phoneBoundsRef.current.left - 50 &&
    glassesPos.x <= phoneBoundsRef.current.right + 50 &&
    glassesPos.y >= phoneBoundsRef.current.top &&
    glassesPos.y <= phoneBoundsRef.current.bottom

  return (
    <div
      className={`phone-3d-wrapper mode-${viewMode}${isOverScreen ? ' is-lens-over-phone' : ''}`}
      ref={containerRef}
      onPointerMove={handleStagePointerMove}
      onPointerLeave={() => {
        if (!isDraggingGlasses) {
          isInteractingRef.current = false
        }
      }}
    >
      {/* 3D Canvas (Clean floating iPhone, untouched by drafts or touch) */}
      <canvas
        ref={canvasRef}
        className="phone-3d-canvas"
        style={{ pointerEvents: 'none' }}
        aria-label="3D model of iPhone with sample screen floating in space"
      />

      {/* 2D SVG Scribbled Handwritten Notes & Curved Arrows Overlay */}
      <svg className="phone-scribble-svg-overlay" aria-hidden="true">
        <defs>
          <marker
            id="scribble-arrowhead-pink"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ff006e" />
          </marker>

          <marker
            id="scribble-arrowhead-pink-darker"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e0005a" />
          </marker>

          <marker
            id="scribble-arrowhead-cyan"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00f0ff" />
          </marker>

          <marker
            id="scribble-arrowhead-cyan-darker"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#008ba3" />
          </marker>
        </defs>

        {projectedPoints.map((pt, idx) => {
          const isRight = pt.side === 'right'
          const isCyan = idx % 2 === 1
          const isNormal = viewMode === 'normal'
          const inkColor = isCyan
            ? (isNormal ? '#008ba3' : '#00f0ff')
            : (isNormal ? '#e0005a' : '#ff006e')
          const markerId = isCyan
            ? (isNormal ? 'url(#scribble-arrowhead-cyan-darker)' : 'url(#scribble-arrowhead-cyan)')
            : (isNormal ? 'url(#scribble-arrowhead-pink-darker)' : 'url(#scribble-arrowhead-pink)')

          // Calculate reveal opacity through sunglasses lens
          const distY = Math.abs(glassesPos.y - pt.targetY)
          let revealOpacity = 0
          let isUnderLens = false

          if (viewMode === 'investigation') {
            revealOpacity = 1
            isUnderLens = true
          } else if (isOverScreen) {
            if (distY < 75) {
              revealOpacity = 1
              isUnderLens = true
            } else if (distY < 170) {
              revealOpacity = Math.max(0, 1 - (distY - 75) / 95)
              isUnderLens = revealOpacity > 0.4
            }
          }

          if (revealOpacity <= 0.02) return null

          // Arrow originates from handwritten note in the margin and arches into the side of the element
          const arrowStartX = isRight ? pt.noteX - 10 : pt.noteX + 10
          const arrowStartY = pt.targetY - 2

          // Organic curved control point for hand-drawn pen stroke
          const midX = (arrowStartX + pt.targetX) / 2
          const midY = (arrowStartY + pt.targetY) / 2 - (isRight ? 18 : -14)

          return (
            <g
              key={pt.id}
              className={`scribble-note-group${pt.active || isUnderLens ? ' is-active' : ''}`}
              onClick={() => onActivate(pt.id)}
              style={{
                cursor: 'pointer',
                opacity: revealOpacity,
                transition: 'opacity 0.22s ease',
              }}
            >
              {/* Curved Hand-Drawn Ink Arrow pointing to the side of the target element */}
              <path
                d={`M ${arrowStartX} ${arrowStartY} Q ${midX} ${midY} ${pt.targetX} ${pt.targetY}`}
                fill="none"
                stroke={inkColor}
                strokeWidth={pt.active || isUnderLens ? 3.4 : 2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={markerId}
                className="scribble-arrow-path"
              />

              {/* Side Pin Point resting on the outer border of the element */}
              <circle
                cx={pt.targetX}
                cy={pt.targetY}
                r={pt.active || isUnderLens ? 6 : 4}
                fill={inkColor}
                className="scribble-target-dot"
              />
            </g>
          )
        })}
      </svg>

      {/* Floating Handwritten Notes Elements in Outer Margins */}
      <div className="phone-scribble-notes-layer" aria-label="Dark pattern handwritten notes">
        {projectedPoints.map((pt, idx) => {
          const isRight = pt.side === 'right'
          const isCyan = idx % 2 === 1
          const isNormal = viewMode === 'normal'
          const inkColor = isCyan
            ? (isNormal ? '#008ba3' : '#00f0ff')
            : (isNormal ? '#e0005a' : '#ff006e')

          const distY = Math.abs(glassesPos.y - pt.targetY)
          let revealOpacity = 0
          let isUnderLens = false

          if (viewMode === 'investigation') {
            revealOpacity = 1
            isUnderLens = true
          } else if (isOverScreen) {
            if (distY < 75) {
              revealOpacity = 1
              isUnderLens = true
            } else if (distY < 170) {
              revealOpacity = Math.max(0, 1 - (distY - 75) / 95)
              isUnderLens = revealOpacity > 0.4
            }
          }

          if (revealOpacity <= 0.02) return null

          return (
            <div
              key={pt.id}
              className={`scribble-note-item side-${pt.side}${pt.active || isUnderLens ? ' is-active' : ''}`}
              style={{
                top: `${pt.targetY - 38}px`,
                left: isRight ? `${pt.noteX}px` : undefined,
                right: !isRight
                  ? `${containerRef.current ? containerRef.current.clientWidth - pt.noteX : 340}px`
                  : undefined,
                color: inkColor,
                opacity: revealOpacity,
                transform: `scale(${0.92 + revealOpacity * 0.08})`,
                transition: 'opacity 0.22s ease, transform 0.22s ease',
              }}
              onClick={() => onActivate(pt.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onActivate(pt.id)
                }
              }}
              aria-label={`Note ${pt.indexNum}: ${pt.patternTitle} — ${pt.explanationText}`}
            >
              {/* 1. TOP: Big Handwritten Number (no #) */}
              <span className="scribble-top-number">{pt.indexNum}</span>

              {/* 2. BELOW NUMBER: Dark Pattern Title */}
              <h2 className="scribble-pattern-title">{pt.patternTitle}</h2>

              {/* 3. BELOW TITLE: Scribbled Explanation */}
              <p className="scribble-explanation">{pt.explanationText}</p>
            </div>
          )
        })}
      </div>

      {/* MOVABLE SUNGLASSES INSPECTOR RIG (Visible in Normal / Light View) */}
      {viewMode === 'normal' && (
        <div
          className={`specs-movable-rig${isOverScreen ? ' is-lens-expanded' : ''}${
            isDraggingGlasses ? ' is-dragging' : ''
          }`}
          style={{
            left: `${glassesPos.x}px`,
            top: `${glassesPos.y}px`,
          }}
          onPointerDown={handleSpecsPointerDown}
          onPointerUp={handleSpecsPointerUp}
          role="region"
          aria-label="X-Ray Sunglasses Inspector. Move across the mobile screen to reveal dark patterns."
        >
          {/* Speech Bubble: "Move me across the mobile screen" */}
          <div className="specs-speech-bubble" aria-hidden="true">
            <span className="speech-text">Move me across the mobile screen</span>
            <span className="speech-tail" />
          </div>

          {/* Indicator & Wear Sunglasses Action Pill */}
          <div className="specs-controls-cluster">
            <div className="specs-xray-indicator">
              <span className="specs-indicator-dot" />
              <span>✦ X-Ray Reveal Lens</span>
            </div>

            <button
              type="button"
              className="specs-wear-btn"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onWearSunglasses?.()
              }}
              title="Put on sunglasses to enter dark investigation mode"
            >
              <span className="specs-wear-icon">🕶️</span>
              <span>Put on sunglasses</span>
            </button>
          </div>

          {/* Vector Full Black Sunglasses with Polarized Reveal Viewfinder */}
          <div className="specs-shades-frame">
            <svg
              viewBox="0 0 280 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="specs-shades-svg"
            >
              <defs>
                <linearGradient id="inspect-lens-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e1e26" stopOpacity="0.88" />
                  <stop offset="50%" stopColor="#0f0f15" stopOpacity="0.84" />
                  <stop offset="100%" stopColor="#050508" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="inspect-glare" x1="0%" y1="0%" x2="65%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                  <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="55%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="inspect-frame-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#282830" />
                  <stop offset="35%" stopColor="#141418" />
                  <stop offset="100%" stopColor="#060608" />
                </linearGradient>

                <filter id="specs-drop-shadow" x="-15%" y="-15%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.55" />
                </filter>
              </defs>

              <g filter="url(#specs-drop-shadow)">
                {/* Dark Glossy Acetate Frame */}
                <path
                  d="M 14 26 C 40 22 96 21 118 25 C 124 26 128 31 130 35 C 132 31 136 26 142 25 C 164 21 220 22 246 26 C 253 27 257 33 255 40 L 244 84 C 241 95 232 101 220 101 L 152 101 C 139 101 132 90 130 84 C 128 90 121 101 108 101 L 40 101 C 28 101 19 95 16 84 L 5 40 C 3 33 7 27 14 26 Z"
                  fill="url(#inspect-frame-grad)"
                  stroke="#060608"
                  strokeWidth="3.5"
                />

                {/* Metallic Browline Highlight */}
                <path
                  d="M 18 28 C 44 24 96 23 118 27 M 142 27 C 164 23 216 24 242 28"
                  stroke="#4a4a58"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Left Polarized Lens Viewfinder */}
                <g className="inspect-lens-left">
                  <path
                    d="M 24 36 C 48 33 90 33 108 36 C 114 38 118 44 116 52 L 110 80 C 108 88 101 92 92 92 L 40 92 C 31 92 24 88 22 80 L 16 52 C 15 44 18 38 24 36 Z"
                    fill="url(#inspect-lens-grad)"
                  />
                  <path d="M 26 38 L 52 35 L 32 90 L 24 80 Z" fill="url(#inspect-glare)" />
                </g>

                {/* Right Polarized Lens Viewfinder */}
                <g className="inspect-lens-right">
                  <path
                    d="M 152 36 C 170 33 212 33 236 36 C 242 38 245 44 244 52 L 238 80 C 236 88 229 92 220 92 L 168 92 C 159 92 152 88 150 80 L 144 52 C 143 44 146 38 152 36 Z"
                    fill="url(#inspect-lens-grad)"
                  />
                  <path d="M 154 38 L 180 35 L 160 90 L 152 80 Z" fill="url(#inspect-glare)" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
