import { useEffect, useRef, useState, useCallback } from 'react'
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
  showOverlay: boolean
  activeId: string | null
  onActivate: (id: string) => void
  isCustomUpload?: boolean
  onResetToDemo?: () => void
}

interface ProjectedPoint {
  id: string
  indexNum: number
  patternTitle: string
  explanationText: string
  targetX: number
  targetY: number
  pinX: number
  pinY: number
  noteX: number
  side: 'left' | 'right'
}

// Helper to create a rounded rectangle shape for Three.js
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
  showOverlay,
  activeId,
  onActivate,
  isCustomUpload = false,
  onResetToDemo,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [projectedPoints, setProjectedPoints] = useState<ProjectedPoint[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Resting orientation (subtle natural angle, no bobbing)
  const baseRotX = 0.04
  const baseRotY = -0.14

  const screenMeshRef = useRef<THREE.Mesh | null>(null)
  const phoneGroupRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  // Physical phone dimensions in Three.js world units
  const phoneWidth = 3.22
  const phoneHeight = 6.8
  const phoneDepth = 0.28
  const cornerRadius = 0.46
  const screenWidth = 3.08
  const screenHeight = 6.66

  // Extract clean note parts: number, pattern title, explanation
  const getNoteHierarchy = useCallback((f: Finding, idx: number) => {
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
  }, [])

  // Only pure mobile screens (< 640px) switch to mobile view.
  // Tablets (e.g. 768px, 820px, 1024px) and desktops preserve the original floating post-it notes and curved arrows.
  const isMobileLayout = useCallback((stageW: number) => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640
    }
    return stageW < 560
  }, [])

  // Calculate 2D screen coordinate projections of 3D phone screen findings
  const computeProjections = useCallback(
    (stageW: number, stageH: number, mobileMode: boolean): ProjectedPoint[] => {
      const phoneGroup = phoneGroupRef.current
      const camera = cameraRef.current
      if (!phoneGroup || !camera || findings.length === 0 || stageW === 0 || stageH === 0) {
        return []
      }

      const tempVec = new THREE.Vector3()

      // Calculate 2D X pixel bounds of the physical phone body in world space
      const leftEdgeVec = new THREE.Vector3(-phoneWidth / 2 - 0.1, 0, phoneDepth / 2)
      leftEdgeVec.applyMatrix4(phoneGroup.matrixWorld)
      leftEdgeVec.project(camera)
      const phoneLeftPixelX = (leftEdgeVec.x * 0.5 + 0.5) * stageW

      const rightEdgeVec = new THREE.Vector3(phoneWidth / 2 + 0.1, 0, phoneDepth / 2)
      rightEdgeVec.applyMatrix4(phoneGroup.matrixWorld)
      rightEdgeVec.project(camera)
      const phoneRightPixelX = (rightEdgeVec.x * 0.5 + 0.5) * stageW

      const pts: ProjectedPoint[] = findings.map((f, i) => {
        const bbox = f.bbox || { x: 50, y: 30 + i * 15, w: 60, h: 8 }
        const preferredSide: 'left' | 'right' = (f as ScribbleFinding).side || (i % 2 === 0 ? 'right' : 'left')

        let normX: number
        if ((f as ScribbleFinding).anchor?.x !== undefined) {
          normX = (f as ScribbleFinding).anchor!.x / 100
        } else if (preferredSide === 'right') {
          normX = (bbox.x + bbox.w) / 100
        } else {
          normX = bbox.x / 100
        }

        const normY =
          (f as ScribbleFinding).anchor?.y !== undefined
            ? (f as ScribbleFinding).anchor!.y / 100
            : (bbox.y + bbox.h * 0.5) / 100

        const localX = (normX - 0.5) * screenWidth
        const localY = (0.5 - normY) * screenHeight
        const localZ = phoneDepth / 2 + 0.05

        tempVec.set(localX, localY, localZ)
        tempVec.applyMatrix4(phoneGroup.matrixWorld)
        tempVec.project(camera)

        const screenPixelX = Math.round((tempVec.x * 0.5 + 0.5) * stageW)
        const screenPixelY = Math.round((-(tempVec.y * 0.5) + 0.5) * stageH)

        // On desktop, clamp notes comfortably within container boundaries
        const noteMargin = 28
        const noteWidth = 200
        let noteX: number
        if (preferredSide === 'right') {
          noteX = Math.min(stageW - noteWidth - 8, Math.max(phoneRightPixelX + 14, phoneRightPixelX + noteMargin))
        } else {
          noteX = Math.max(8, Math.min(phoneLeftPixelX - noteMargin - noteWidth, phoneLeftPixelX - 14 - noteWidth))
        }

        const noteData = getNoteHierarchy(f, i)

        return {
          id: f.id,
          indexNum: noteData.indexNum,
          patternTitle: noteData.patternTitle,
          explanationText: noteData.explanationText,
          targetX: screenPixelX,
          targetY: screenPixelY,
          pinX: screenPixelX,
          pinY: screenPixelY,
          noteX: Math.round(noteX),
          side: preferredSide,
        }
      })

      // On desktop, stagger notes vertically into distinct slots to prevent overlap
      if (!mobileMode) {
        const slotMap: Record<number, number> = {
          1: Math.round(stageH * 0.12),
          2: Math.round(stageH * 0.15),
          3: Math.round(stageH * 0.52),
          4: Math.round(stageH * 0.55),
        }
        pts.forEach((pt) => {
          if (slotMap[pt.indexNum] !== undefined) {
            pt.targetY = slotMap[pt.indexNum]
          }
        })
      }

      return pts
    },
    [findings, getNoteHierarchy, phoneWidth, phoneDepth, screenWidth, screenHeight],
  )

  // Update Camera aspect and frustum distance without clipping
  const updateCameraFrustum = useCallback((stageW: number, stageH: number) => {
    const camera = cameraRef.current
    const renderer = rendererRef.current
    if (!camera || !renderer || stageW === 0 || stageH === 0) return

    const aspect = stageW / stageH
    camera.aspect = aspect

    const vFovRad = THREE.MathUtils.degToRad(38)
    const halfFovTan = Math.tan(vFovRad / 2)

    // Fit phone neatly inside stage
    const mobileMode = stageW < 860
    const margin = mobileMode ? 1.12 : 1.18
    const distV = (6.8 * margin) / (2 * halfFovTan)
    const distH = (3.22 * margin) / (2 * halfFovTan * Math.max(aspect, 0.45))

    const targetZ = Math.max(10.8, distV, distH)
    camera.position.set(0, 0, targetZ)
    camera.updateProjectionMatrix()

    renderer.setSize(stageW, stageH, false)
  }, [])

  // Initialize Three.js scene once on mount
  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return

    const width = stage.clientWidth || 540
    const height = stage.clientHeight || 580

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer

    updateCameraFrustum(width, height)

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(5, 7, 8)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6)
    rimLight.position.set(-6, -6, 5)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2)
    fillLight.position.set(0, 1, 6)
    scene.add(fillLight)

    // 3. iPhone Chassis & Screen
    const phoneGroup = new THREE.Group()
    phoneGroupRef.current = phoneGroup
    phoneGroup.position.set(0, 0, 0)
    phoneGroup.rotation.set(baseRotX, baseRotY, 0)
    scene.add(phoneGroup)

    // Body Mesh
    const bodyShape = createRoundedRectShape(phoneWidth, phoneHeight, cornerRadius)
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: phoneDepth,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
    })
    bodyGeo.center()

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      metalness: 0.82,
      roughness: 0.25,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    phoneGroup.add(bodyMesh)

    // Outer Silver Chamfer Ring
    const bandShape = createRoundedRectShape(phoneWidth + 0.015, phoneHeight + 0.015, cornerRadius)
    const bandGeo = new THREE.ExtrudeGeometry(bandShape, {
      depth: phoneDepth - 0.05,
      bevelEnabled: false,
    })
    bandGeo.center()
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.92,
      roughness: 0.15,
    })
    const bandMesh = new THREE.Mesh(bandGeo, bandMat)
    phoneGroup.add(bandMesh)

    // Buttons
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.85, roughness: 0.2 })
    const powerGeo = new THREE.BoxGeometry(0.035, 0.65, 0.07)
    const powerBtn = new THREE.Mesh(powerGeo, buttonMat)
    powerBtn.position.set(phoneWidth / 2 + 0.025, 0.75, 0)
    phoneGroup.add(powerBtn)

    const volGeo = new THREE.BoxGeometry(0.035, 0.45, 0.07)
    const volUpBtn = new THREE.Mesh(volGeo, buttonMat)
    volUpBtn.position.set(-phoneWidth / 2 - 0.025, 1.05, 0)
    const volDownBtn = new THREE.Mesh(volGeo, buttonMat)
    volDownBtn.position.set(-phoneWidth / 2 - 0.025, 0.48, 0)
    phoneGroup.add(volUpBtn)
    phoneGroup.add(volDownBtn)

    // Front Screen Glass Face
    const screenRadius = 0.42
    const screenShape = createRoundedRectShape(screenWidth, screenHeight, screenRadius)
    const screenGeo = new THREE.ShapeGeometry(screenShape)

    const pos = screenGeo.attributes.position
    const uvs = screenGeo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const u = (x + screenWidth / 2) / screenWidth
      const v = (y + screenHeight / 2) / screenHeight
      uvs.setXY(i, u, v)
    }
    uvs.needsUpdate = true

    const textureLoader = new THREE.TextureLoader()
    const screenTexture = textureLoader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
      renderer.render(scene, camera)
    })

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    })
    const screenMesh = new THREE.Mesh(screenGeo, screenMat)
    screenMesh.position.set(0, 0, phoneDepth / 2 + 0.038)
    screenMeshRef.current = screenMesh
    phoneGroup.add(screenMesh)

    // Speaker Micro-slit
    const speakerShape = createRoundedRectShape(0.48, 0.035, 0.015)
    const speakerGeo = new THREE.ShapeGeometry(speakerShape)
    const speakerMat = new THREE.MeshBasicMaterial({ color: 0x111115 })
    const speakerMesh = new THREE.Mesh(speakerGeo, speakerMat)
    speakerMesh.position.set(0, screenHeight / 2 - 0.06, phoneDepth / 2 + 0.042)
    phoneGroup.add(speakerMesh)

    // Glass Reflection
    const glareGeo = new THREE.PlaneGeometry(screenWidth, screenHeight)
    const glareCanvas = document.createElement('canvas')
    glareCanvas.width = 256
    glareCanvas.height = 512
    const gctx = glareCanvas.getContext('2d')
    if (gctx) {
      const grad = gctx.createLinearGradient(0, 0, 256, 512)
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.04)')
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)')
      gctx.fillStyle = grad
      gctx.fillRect(0, 0, 256, 512)
    }
    const glareTex = new THREE.CanvasTexture(glareCanvas)
    const glareMat = new THREE.MeshBasicMaterial({
      map: glareTex,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    })
    const glareMesh = new THREE.Mesh(glareGeo, glareMat)
    glareMesh.position.set(0, 0, phoneDepth / 2 + 0.044)
    phoneGroup.add(glareMesh)

    // Initial render and points calculation
    phoneGroup.updateMatrixWorld(true)
    renderer.render(scene, camera)
    const mobile = isMobileLayout(width)
    setIsMobile(mobile)
    setProjectedPoints(computeProjections(width, height, mobile))

    // Animation Loop: Render only. NO setState in RAF loop.
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Smooth Resize Handling via ResizeObserver
    let resizeTimer: number | null = null
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (!entry) return

      const newW = Math.round(entry.contentRect.width)
      const newH = Math.round(entry.contentRect.height)
      if (newW === 0 || newH === 0) return

      if (resizeTimer) cancelAnimationFrame(resizeTimer)
      resizeTimer = requestAnimationFrame(() => {
        updateCameraFrustum(newW, newH)
        const isMob = isMobileLayout(newW)
        setIsMobile(isMob)
        if (showOverlay) {
          setProjectedPoints(computeProjections(newW, newH, isMob))
        }
        renderer.render(scene, camera)
      })
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(stage)

    return () => {
      cancelAnimationFrame(animId)
      if (resizeTimer) cancelAnimationFrame(resizeTimer)
      resizeObserver.disconnect()
      renderer.dispose()
      bodyGeo.dispose()
      bandGeo.dispose()
      screenGeo.dispose()
      speakerGeo.dispose()
      glareGeo.dispose()
      bodyMat.dispose()
      bandMat.dispose()
      screenMat.dispose()
      speakerMat.dispose()
      glareMat.dispose()
      screenTexture.dispose()
      glareTex.dispose()
    }
  }, [computeProjections, updateCameraFrustum, showOverlay])

  // Update texture when `src` prop changes
  useEffect(() => {
    if (!screenMeshRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
      if (screenMeshRef.current) {
        ;(screenMeshRef.current.material as THREE.MeshBasicMaterial).map = tex
        ;(screenMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    })
  }, [src])

  // Recalculate projections when findings change
  useEffect(() => {
    if (!stageRef.current || !showOverlay) return
    const w = stageRef.current.clientWidth
    const h = stageRef.current.clientHeight
    if (w > 0 && h > 0) {
      setProjectedPoints(computeProjections(w, h, isMobileLayout(w)))
    }
  }, [findings, showOverlay, computeProjections])

  return (
    <div className={`phone-3d-root${isMobile ? ' is-mobile-view' : ''}`} ref={containerRef}>
      {/* 3D Phone Stage */}
      <div className="phone-canvas-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          className="phone-3d-canvas"
          aria-label="3D model of iPhone displaying specimen checkout screen"
        />

        {/* DESKTOP VIEW: SVG Hand-Drawn Curved Arrows */}
        {!isMobile && showOverlay && (
          <svg className="phone-scribble-svg-overlay" aria-hidden="true">
            {projectedPoints.map((pt) => {
              const isRight = pt.side === 'right'
              const isActive = activeId === pt.id

              const noteWidth = 185
              const arrowStartX = isRight ? pt.noteX - 4 : pt.noteX + noteWidth + 4
              const arrowStartY = pt.targetY + 30
              const arrowEndX = pt.pinX
              const arrowEndY = pt.pinY

              const dx = arrowEndX - arrowStartX
              const dy = arrowEndY - arrowStartY

              const archOffset = isRight ? (pt.indexNum === 1 ? -24 : 18) : (pt.indexNum === 2 ? -20 : 16)
              const c1x = arrowStartX + dx * 0.35 + (isRight ? -12 : 12)
              const c1y = arrowStartY + dy * 0.2 + archOffset
              const c2x = arrowStartX + dx * 0.75
              const c2y = arrowStartY + dy * 0.85 + archOffset * 0.3

              const tangentX = arrowEndX - c2x
              const tangentY = arrowEndY - c2y
              const angle = Math.atan2(tangentY, tangentX)

              const headLength = 14
              const barb1Angle = angle - Math.PI + 0.52
              const barb2Angle = angle - Math.PI - 0.44

              const barb1X = arrowEndX + Math.cos(barb1Angle) * headLength
              const barb1Y = arrowEndY + Math.sin(barb1Angle) * headLength
              const barb2X = arrowEndX + Math.cos(barb2Angle) * (headLength * 0.92)
              const barb2Y = arrowEndY + Math.sin(barb2Angle) * (headLength * 0.92)

              return (
                <g
                  key={pt.id}
                  className={`scribble-note-group${isActive ? ' is-active' : ''}`}
                  onClick={() => onActivate(pt.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={`M ${arrowStartX} ${arrowStartY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${arrowEndX} ${arrowEndY}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 3.4 : 2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="scribble-arrow-path"
                  />
                  <path
                    d={`M ${barb1X} ${barb1Y} Q ${(arrowEndX + barb1X) / 2} ${(arrowEndY + barb1Y) / 2 - 1} ${arrowEndX} ${arrowEndY} Q ${(arrowEndX + barb2X) / 2} ${(arrowEndY + barb2Y) / 2 + 1} ${barb2X} ${barb2Y}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 3.4 : 2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="scribble-arrow-head"
                  />
                </g>
              )
            })}
          </svg>
        )}

        {/* DESKTOP VIEW: Floating Handwritten Post-It Notes */}
        {!isMobile && showOverlay && (
          <div className="phone-scribble-notes-layer" aria-label="Dark pattern handwritten notes">
            {projectedPoints.map((pt) => {
              const isRight = pt.side === 'right'
              const isActive = activeId === pt.id

              return (
                <div
                  key={pt.id}
                  className={`scribble-note-item post-it-note side-${pt.side}${isActive ? ' is-active' : ''}`}
                  style={{
                    top: `${pt.targetY}px`,
                    left: `${pt.noteX}px`,
                  }}
                  onClick={() => onActivate(pt.id)}
                  onMouseEnter={() => onActivate(pt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onActivate(pt.id)
                    }
                  }}
                  aria-label={`Note ${pt.indexNum}: ${pt.patternTitle} — ${pt.explanationText}`}
                >
                  <div className="post-it-tape" aria-hidden="true" />
                  <span className="scribble-top-number">{pt.indexNum}</span>
                  <h4 className="scribble-pattern-title">{pt.patternTitle}</h4>
                  <p className="scribble-explanation">{pt.explanationText}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* MOBILE VIEW: Interactive Forensic Target Pins Directly on Phone Screen */}
        {isMobile && showOverlay && (
          <div className="mobile-phone-pins-layer" aria-hidden="true">
            {projectedPoints.map((pt) => {
              const isActive = activeId === pt.id
              return (
                <button
                  key={pt.id}
                  type="button"
                  className={`mobile-forensic-pin${isActive ? ' is-active' : ''}`}
                  style={{
                    left: `${pt.pinX}px`,
                    top: `${pt.pinY}px`,
                  }}
                  onClick={() => onActivate(pt.id)}
                  aria-label={`Pin ${pt.indexNum}: ${pt.patternTitle}`}
                >
                  <span className="mobile-pin-ping" />
                  <span className="mobile-pin-core">{pt.indexNum}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* MOBILE VIEW: Clean Touch-Friendly Forensic Dossier Tray Below Phone */}
      {isMobile && showOverlay && projectedPoints.length > 0 && (
        <div className="mobile-findings-tray" aria-label="Detected deceptive patterns">
          <div className="mobile-findings-tray-header">
            <span className="mobile-findings-pill">
              {projectedPoints.length} TRAPS DETECTED
            </span>
            <span className="mobile-findings-hint">Tap a card to pinpoint on screen</span>
          </div>

          <div className="mobile-findings-carousel">
            {projectedPoints.map((pt) => {
              const isActive = activeId === pt.id
              return (
                <div
                  key={pt.id}
                  className={`mobile-finding-card post-it-note${isActive ? ' is-active' : ''}`}
                  onClick={() => onActivate(pt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onActivate(pt.id)
                    }
                  }}
                  aria-label={`Trap ${pt.indexNum}: ${pt.patternTitle}`}
                >
                  <div className="mobile-card-top-row">
                    <span className="mobile-card-badge">{pt.indexNum}</span>
                    <h4 className="mobile-card-title">{pt.patternTitle}</h4>
                  </div>
                  <p className="mobile-card-desc">{pt.explanationText}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer controls: Reset to demo if custom upload */}
      {isCustomUpload && onResetToDemo && (
        <div className="phone-3d-footer">
          <button
            type="button"
            className="phone-demo-reset-btn"
            onClick={onResetToDemo}
          >
            &larr; View demo specimen
          </button>
        </div>
      )}
    </div>
  )
}
