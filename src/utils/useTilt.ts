import { useState, useRef, useCallback } from 'react'

interface TiltState {
  rotateX: number
  rotateY: number
  glareX: number
  glareY: number
  isHovered: boolean
}

export function useTilt(maxTilt = 8) {
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  })

  const ref = useRef<HTMLDivElement | null>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotateX = (0.5 - y) * maxTilt * 2
      const rotateY = (x - 0.5) * maxTilt * 2

      setTilt({
        rotateX,
        rotateY,
        glareX: x * 100,
        glareY: y * 100,
        isHovered: true,
      })
    },
    [maxTilt],
  )

  const onMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    })
  }, [])

  return { ref, tilt, onMouseMove, onMouseLeave }
}
