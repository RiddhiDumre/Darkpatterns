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
  showOverlay: boolean
  activeId: string | null
  onActivate: (id: string) => void
  isCustomUpload?: boolean
  onResetToDemo?: () => void
}

// Helper to create a rounded rectangle shape
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

  // Base resting orientation
  const baseRotX = 0.04
  const baseRotY = -0.14
  const screenMeshRef = useRef<THREE.Mesh | null>(null)
  const phoneGroupRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

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

  // Set up Three.js scene
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth || 540
    const height = container.clientHeight || 640

    // 1. Scene, Camera, Renderer
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

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    // Key light (soft studio light from top-left)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(6, 8, 9)
    scene.add(keyLight)

    // Metallic Rim Light from bottom-right
    const rimLight = new THREE.DirectionalLight(0x99bbff, 1.5)
    rimLight.position.set(-6, -6, 5)
    scene.add(rimLight)

    // Soft Front Fill
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8)
    fillLight.position.set(0, 2, 7)
    scene.add(fillLight)

    // 3. iPhone Model Group
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
    bodyGeo.center()

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x121216,
      metalness: 0.88,
      roughness: 0.28,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    phoneGroup.add(bodyMesh)

    // Polished Metallic Outer Band
    const bandShape = createRoundedRectShape(phoneWidth + 0.015, phoneHeight + 0.015, cornerRadius)
    const bandGeo = new THREE.ExtrudeGeometry(bandShape, {
      depth: phoneDepth - 0.04,
      bevelEnabled: false,
    })
    bandGeo.center()
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x22222a,
      metalness: 0.94,
      roughness: 0.16,
    })
    const bandMesh = new THREE.Mesh(bandGeo, bandMat)
    phoneGroup.add(bandMesh)

    // Side Buttons (Volume & Power)
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0x2b2b35, metalness: 0.9, roughness: 0.2 })
    // Power Button (right)
    const powerGeo = new THREE.BoxGeometry(0.04, 0.65, 0.08)
    const powerBtn = new THREE.Mesh(powerGeo, buttonMat)
    powerBtn.position.set(phoneWidth / 2 + 0.03, 0.8, 0)
    phoneGroup.add(powerBtn)

    // Volume Buttons (left)
    const volGeo = new THREE.BoxGeometry(0.04, 0.45, 0.08)
    const volUpBtn = new THREE.Mesh(volGeo, buttonMat)
    volUpBtn.position.set(-phoneWidth / 2 - 0.03, 1.1, 0)
    const volDownBtn = new THREE.Mesh(volGeo, buttonMat)
    volDownBtn.position.set(-phoneWidth / 2 - 0.03, 0.5, 0)
    phoneGroup.add(volUpBtn)
    phoneGroup.add(volDownBtn)

    // Front Screen Glass Bezel
    const screenWidth = 3.02
    const screenHeight = 6.42
    const screenRadius = 0.4
    const screenShape = createRoundedRectShape(screenWidth, screenHeight, screenRadius)
    const screenGeo = new THREE.ShapeGeometry(screenShape)

    // Normalize UV coordinates so screenshot texture spans the full rounded screen edge-to-edge
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

    // Texture Loader for the Screenshot
    const textureLoader = new THREE.TextureLoader()
    const screenTexture = textureLoader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
    })

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    })
    const screenMesh = new THREE.Mesh(screenGeo, screenMat)
    screenMesh.position.set(0, 0, phoneDepth / 2 + 0.042)
    screenMeshRef.current = screenMesh
    phoneGroup.add(screenMesh)

    // Dynamic Island Pill
    const islandShape = createRoundedRectShape(0.72, 0.2, 0.1)
    const islandGeo = new THREE.ShapeGeometry(islandShape)
    const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const islandMesh = new THREE.Mesh(islandGeo, islandMat)
    islandMesh.position.set(0, 2.92, phoneDepth / 2 + 0.045)
    phoneGroup.add(islandMesh)

    // Glass Reflection Overlay
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

    // Rear Camera Island (visible if user rotates phone around)
    const cameraBumpShape = createRoundedRectShape(1.3, 1.3, 0.25)
    const cameraBumpGeo = new THREE.ExtrudeGeometry(cameraBumpShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    })
    const cameraBumpMat = new THREE.MeshStandardMaterial({ color: 0x18181f, metalness: 0.8, roughness: 0.3 })
    const cameraBumpMesh = new THREE.Mesh(cameraBumpGeo, cameraBumpMat)
    cameraBumpMesh.position.set(-0.75, 1.8, -phoneDepth / 2 - 0.14)
    phoneGroup.add(cameraBumpMesh)

    // 4. Animation & Projection Loop
    let animId: number
    const clock = new THREE.Clock()
    const tempVec = new THREE.Vector3()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Serene, continuous ambient floating motion (no drag/touch interaction)
      const floatY = Math.sin(elapsedTime * 1.5) * 0.07
      const floatTiltX = Math.sin(elapsedTime * 1.1) * 0.025
      const floatTiltY = Math.cos(elapsedTime * 1.3) * 0.035

      phoneGroup.position.y = floatY
      phoneGroup.rotation.x = baseRotX + floatTiltX
      phoneGroup.rotation.y = baseRotY + floatTiltY

      // Project 3D Screen Coordinates of Dark Pattern Findings to 2D Viewport Space
      if (showOverlay && findings.length > 0 && containerRef.current) {
        const curW = containerRef.current.clientWidth || width
        const curH = containerRef.current.clientHeight || height

        // Calculate 2D X pixel bounds of the physical phone body in world space
        const leftEdgeVec = new THREE.Vector3(-phoneWidth / 2 - 0.1, 0, phoneDepth / 2)
        leftEdgeVec.applyMatrix4(phoneGroup.matrixWorld)
        leftEdgeVec.project(camera)
        const phoneLeftPixelX = (leftEdgeVec.x * 0.5 + 0.5) * curW

        const rightEdgeVec = new THREE.Vector3(phoneWidth / 2 + 0.1, 0, phoneDepth / 2)
        rightEdgeVec.applyMatrix4(phoneGroup.matrixWorld)
        rightEdgeVec.project(camera)
        const phoneRightPixelX = (rightEdgeVec.x * 0.5 + 0.5) * curW

        const points = findings.map((f, i) => {
          // Bounding box percentages (0-100)
          const bbox = f.bbox || { x: 50, y: 30 + i * 15, w: 60, h: 8 }

          // Determine preferred side (alternate or use custom)
          const preferredSide: 'left' | 'right' = (f as ScribbleFinding).side || (i % 2 === 0 ? 'right' : 'left')

          // Point arrow directly to the SIDE of the element facing the incoming note (not the center)
          let normX: number
          if ((f as ScribbleFinding).anchor?.x !== undefined) {
            normX = (f as ScribbleFinding).anchor!.x / 100
          } else if (preferredSide === 'right') {
            // Arrow comes from right note -> point to right side/edge of element
            normX = (bbox.x + bbox.w) / 100
          } else {
            // Arrow comes from left note -> point to left side/edge of element
            normX = bbox.x / 100
          }

          const normY =
            (f as ScribbleFinding).anchor?.y !== undefined
              ? (f as ScribbleFinding).anchor!.y / 100
              : (bbox.y + bbox.h * 0.5) / 100

          // Screen local 3D coordinates
          const localX = (normX - 0.5) * screenWidth
          const localY = (0.5 - normY) * screenHeight
          const localZ = phoneDepth / 2 + 0.05

          // Transform into world space and project onto camera plane
          tempVec.set(localX, localY, localZ)
          tempVec.applyMatrix4(phoneGroup.matrixWorld)
          tempVec.project(camera)

          // 2D Pixel Coordinates of target element on screen
          const screenPixelX = (tempVec.x * 0.5 + 0.5) * curW
          const screenPixelY = (-(tempVec.y * 0.5) + 0.5) * curH

          // Position note completely outside the phone screen in the margin!
          const noteMargin = 28
          const noteX =
            preferredSide === 'right'
              ? Math.round(phoneRightPixelX + noteMargin)
              : Math.round(phoneLeftPixelX - noteMargin)

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

    // 5. Responsive Resize Observer
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

    // Cleanup on unmount
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
  }, [showOverlay, findings, activeId])

  // Update screen texture when `src` prop changes (e.g. user uploads custom screenshot)
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

  return (
    <div className="phone-3d-wrapper" ref={containerRef}>
      {/* 3D Canvas - Serene floating display */}
      <canvas
        ref={canvasRef}
        className="phone-3d-canvas"
        aria-label="3D model of iPhone displaying sample checkout screen with detected dark patterns."
      />

      {/* 2D SVG Scribbled Handwritten Notes & Curved Arrows Overlay */}
      {showOverlay && (
        <svg className="phone-scribble-svg-overlay" aria-hidden="true">
          <defs>
            {/* Unified forensic ink arrowhead marker */}
            <marker
              id="scribble-arrowhead-unified"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 2 L 7 5 L 0 8 z" fill="currentColor" />
            </marker>
          </defs>

          {projectedPoints.map((pt) => {
            const isRight = pt.side === 'right'

            // Arrow originates from handwritten note in the margin and arches cleanly to the side of the element
            const arrowStartX = isRight ? pt.noteX - 8 : pt.noteX + 8
            const arrowStartY = pt.targetY + 2

            // Organic curved control point for hand-drawn pen stroke
            const midX = (arrowStartX + pt.targetX) / 2
            const midY = (arrowStartY + pt.targetY) / 2 - 12

            return (
              <g
                key={pt.id}
                className={`scribble-note-group${pt.active ? ' is-active' : ''}`}
                onClick={() => onActivate(pt.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Curved Hand-Drawn Ink Arrow pointing cleanly to the side of the element */}
                <path
                  d={`M ${arrowStartX} ${arrowStartY} Q ${midX} ${midY} ${pt.targetX} ${pt.targetY}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={pt.active ? 3 : 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#scribble-arrowhead-unified)"
                  className="scribble-arrow-path"
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* Floating Handwritten Notes Elements (HTML for natural handwriting text wrapping) */}
      {showOverlay && (
        <div className="phone-scribble-notes-layer" aria-label="Dark pattern handwritten notes">
          {projectedPoints.map((pt) => {
            const isRight = pt.side === 'right'

            return (
              <div
                key={pt.id}
                className={`scribble-note-item post-it-note side-${pt.side}${pt.active ? ' is-active' : ''}`}
                style={{
                  top: `${pt.targetY - 45}px`,
                  left: isRight ? `${pt.noteX}px` : undefined,
                  right: !isRight
                    ? `${containerRef.current ? containerRef.current.clientWidth - pt.noteX : 340}px`
                    : undefined,
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
                {/* Post-it Washi Tape accent at top */}
                <div className="post-it-tape" aria-hidden="true" />

                {/* 1. TOP: Big Handwritten Number (no #) */}
                <span className="scribble-top-number">
                  {pt.indexNum}
                </span>

                {/* 2. BELOW NUMBER: Dark Pattern Title */}
                <h4 className="scribble-pattern-title">
                  {pt.patternTitle}
                </h4>

                {/* 3. BELOW TITLE: The Explanation */}
                <p className="scribble-explanation">
                  {pt.explanationText}
                </p>
              </div>
            )
          })}
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
