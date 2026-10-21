import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Finding } from '../../shared/types'

export interface ScribbleFinding extends Finding {
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
      pattern: string
      scribble: string
      targetX: number
      targetY: number
      noteX: number
      side: 'left' | 'right'
      active: boolean
    }>
  >([])

  // Rotation & interaction state refs for animation loop
  const isDraggingRef = useRef(false)
  const prevPointerRef = useRef({ x: 0, y: 0 })
  const rotTargetRef = useRef({ x: 0.05, y: -0.15 })
  const rotCurrentRef = useRef({ x: 0.05, y: -0.15 })
  const screenMeshRef = useRef<THREE.Mesh | null>(null)
  const phoneGroupRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // Default fallback scribble text if finding has no custom scribble
  const getScribbleText = (f: Finding, idx: number) => {
    const custom = (f as ScribbleFinding).noteScribble
    if (custom) return custom
    if (f.pattern === 'False Urgency') return '⚡ Fake urgency! Resetting countdown'
    if (f.pattern === 'Preselection') return 'Sneaky auto-check! Recurring fee pre-selected'
    if (f.pattern === 'Confirmshaming') return 'Guilt-trip copy: Shaming you for saying no'
    if (f.pattern === 'Interface Interference') return 'Visual asymmetry: Oversized primary button'
    return `Finding #${idx + 1}: ${f.pattern}`
  }

  // Pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true
    prevPointerRef.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const deltaX = e.clientX - prevPointerRef.current.x
    const deltaY = e.clientY - prevPointerRef.current.y
    prevPointerRef.current = { x: e.clientX, y: e.clientY }

    rotTargetRef.current.y += deltaX * 0.007
    rotTargetRef.current.x += deltaY * 0.007

    // Clamp rotation angles so the screen stays comfortably visible
    rotTargetRef.current.y = Math.max(-0.75, Math.min(0.75, rotTargetRef.current.y))
    rotTargetRef.current.x = Math.max(-0.45, Math.min(0.45, rotTargetRef.current.x))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  const handleResetRotation = () => {
    rotTargetRef.current = { x: 0.05, y: -0.15 }
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

      // Smooth damped rotation interpolation
      rotCurrentRef.current.x += (rotTargetRef.current.x - rotCurrentRef.current.x) * 0.1
      rotCurrentRef.current.y += (rotTargetRef.current.y - rotCurrentRef.current.y) * 0.1

      // Subtle breathing float when idle
      let floatY = 0
      let floatTiltX = 0
      let floatTiltY = 0
      if (!isDraggingRef.current) {
        floatY = Math.sin(elapsedTime * 1.6) * 0.06
        floatTiltX = Math.sin(elapsedTime * 1.2) * 0.03
        floatTiltY = Math.cos(elapsedTime * 1.4) * 0.04
      }

      phoneGroup.position.y = floatY
      phoneGroup.rotation.x = rotCurrentRef.current.x + floatTiltX
      phoneGroup.rotation.y = rotCurrentRef.current.y + floatTiltY

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
          // Compute center point of the target element on the phone screen
          const normX = (bbox.x + bbox.w * 0.5) / 100 // 0 to 1
          const normY = (bbox.y + bbox.h * 0.5) / 100 // 0 to 1

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

          // Determine preferred side (alternate or use custom)
          const preferredSide: 'left' | 'right' = (f as ScribbleFinding).side || (i % 2 === 0 ? 'right' : 'left')

          // Position note completely outside the phone screen in the margin!
          const noteMargin = 30
          const noteX =
            preferredSide === 'right'
              ? Math.max(phoneRightPixelX + noteMargin, Math.round(screenPixelX) + 110)
              : Math.min(phoneLeftPixelX - noteMargin, Math.round(screenPixelX) - 110)

          return {
            id: f.id,
            pattern: f.pattern,
            scribble: getScribbleText(f, i),
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
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="phone-3d-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Interactive 3D model of iPhone with sample screen. Drag to rotate in 3D."
      />

      {/* Floating 3D Hint Badge */}
      <div className="phone-3d-controls-overlay">
        <span className="phone-3d-drag-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Drag to rotate 3D iPhone
        </span>

        <button
          type="button"
          className="phone-3d-reset-btn"
          onClick={handleResetRotation}
          aria-label="Reset 3D rotation"
          title="Reset phone rotation"
        >
          Reset angle
        </button>
      </div>

      {/* 2D SVG Scribbled Handwritten Notes & Curved Arrows Overlay */}
      {showOverlay && (
        <svg className="phone-scribble-svg-overlay" aria-hidden="true">
          <defs>
            {/* Arrowhead marker in electric pink ink */}
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

            {/* Arrowhead marker in cyan ink */}
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
          </defs>

          {projectedPoints.map((pt, idx) => {
            const isRight = pt.side === 'right'
            const isCyan = idx % 2 === 1
            const inkColor = isCyan ? '#00f0ff' : '#ff006e'
            const markerId = isCyan ? 'url(#scribble-arrowhead-cyan)' : 'url(#scribble-arrowhead-pink)'

            // Arrow originates from handwritten note in the margin and arches into the phone screen
            const arrowStartX = isRight ? pt.noteX - 10 : pt.noteX + 10
            const arrowStartY = pt.targetY - 4

            // Organic curved control point for hand-drawn pen stroke
            const midX = (arrowStartX + pt.targetX) / 2
            const midY = (arrowStartY + pt.targetY) / 2 - (isRight ? 18 : -14)

            return (
              <g
                key={pt.id}
                className={`scribble-note-group${pt.active ? ' is-active' : ''}`}
                onClick={() => onActivate(pt.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Curved Hand-Drawn Ink Arrow pointing directly to target element */}
                <path
                  d={`M ${arrowStartX} ${arrowStartY} Q ${midX} ${midY} ${pt.targetX} ${pt.targetY}`}
                  fill="none"
                  stroke={inkColor}
                  strokeWidth={pt.active ? 3.4 : 2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={markerId}
                  className="scribble-arrow-path"
                />

                {/* Target Pin Point */}
                <circle
                  cx={pt.targetX}
                  cy={pt.targetY}
                  r={pt.active ? 6 : 4}
                  fill={inkColor}
                  className="scribble-target-dot"
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* Floating Handwritten Notes Elements (HTML for natural handwriting text wrapping) */}
      {showOverlay && (
        <div className="phone-scribble-notes-layer" aria-label="Dark pattern handwritten notes">
          {projectedPoints.map((pt, idx) => {
            const isRight = pt.side === 'right'
            const isCyan = idx % 2 === 1
            const inkColor = isCyan ? '#00f0ff' : '#ff006e'

            return (
              <div
                key={pt.id}
                className={`scribble-note-item side-${pt.side}${pt.active ? ' is-active' : ''}`}
                style={{
                  top: `${pt.targetY - 26}px`,
                  left: isRight ? `${pt.noteX}px` : undefined,
                  right: !isRight
                    ? `${containerRef.current ? containerRef.current.clientWidth - pt.noteX : 340}px`
                    : undefined,
                  color: inkColor,
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
                aria-label={`Note #${idx + 1}: ${pt.scribble}`}
              >
                {/* Handwritten ink scribble text - NO BOX, NO BORDER, PURE HANDWRITING */}
                <span className="scribble-note-text">
                  <span className="scribble-num">#{idx + 1} </span>
                  {pt.scribble}
                </span>
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
