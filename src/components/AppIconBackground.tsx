import React, { useState } from 'react'

interface AppIconDef {
  name: string
  bg: string
  renderSvg: () => React.ReactNode
}

export const FAMOUS_APP_ICONS: AppIconDef[] = [
  // 1. Spotify
  {
    name: 'Spotify',
    bg: '#1DB954',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#000000" width="28" height="28" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm4.587 14.425a.623.623 0 0 1-.859.206c-2.348-1.436-5.305-1.76-8.788-.964a.625.625 0 0 1-.277-1.22c3.807-.87 7.077-.5 9.718 1.119a.624.624 0 0 1 .206.859zm1.225-2.723a.78.78 0 0 1-1.074.258c-2.688-1.652-6.786-2.13-9.965-1.164a.782.782 0 0 1-.462-1.493c3.633-1.103 8.147-.57 11.243 1.325a.78.78 0 0 1 .258 1.074zm.105-2.835C14.7 8.94 9.385 8.763 6.3 9.7a.936.936 0 1 1-.546-1.792c3.541-1.074 9.42-.87 12.87 1.179a.937.937 0 0 1-1.008 1.621z" />
      </svg>
    ),
  },

  // 2. Apple Music
  {
    name: 'Apple Music',
    bg: 'linear-gradient(135deg, #FC3C44 0%, #F94C57 100%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    ),
  },

  // 3. Swiggy
  {
    name: 'Swiggy',
    bg: '#FC8019',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="28" height="28" aria-hidden="true">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.75 6.9 11.3 7.2 11.53.25.2.57.3.8.3s.55-.1.8-.3C13.1 21.3 20 15.75 20 10c0-4.42-3.58-8-8-8zm1.5 11.5c-.8.6-1.8.7-2.7.4-.3-.1-.5-.4-.4-.7.1-.3.4-.5.7-.4.6.2 1.2.1 1.7-.3.5-.4.8-1 .7-1.7-.1-.9-1-1.6-1.9-1.5-1.4.1-2.5 1.2-2.5 2.6 0 .7.4 1.4 1 1.9.2.2.3.6.1.8-.2.2-.6.3-.8.1-.8-.7-1.3-1.6-1.4-2.7-.1-2 1.5-3.7 3.5-3.8 1.3-.1 2.5.9 2.7 2.2.1.9-.2 1.9-1 2.5z" />
      </svg>
    ),
  },

  // 4. Zomato
  {
    name: 'Zomato',
    bg: '#CB202D',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="30" height="30" aria-hidden="true">
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-0.5px"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          zomato
        </text>
      </svg>
    ),
  },

  // 5. Amazon
  {
    name: 'Amazon',
    bg: '#131921',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FF9900" width="26" height="26" aria-hidden="true">
        <path d="M18.8 17.5c-4.4 2.8-9.8 1.9-13.6-.8-.2-.1-.1-.4.1-.3 4.1 2.3 9.4 2.6 13.3.4.3-.2.5.5.2.7z" />
        <path d="M19.9 16.3c-.2-.3-1.6-.7-2.6-.4-.3.1-.3-.2 0-.4 1.5-1 3.5-.8 3.7-.4.2.4-.4 2.3-1.8 3.4-.2.2-.4.1-.3-.2.4-.7.9-1.8 1-2z" />
        <text
          x="10.5"
          y="13.5"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          a
        </text>
      </svg>
    ),
  },

  // 6. Netflix
  {
    name: 'Netflix',
    bg: '#141414',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M6 3h3v18H6z" fill="#B81D24" />
        <path d="M15 3h3v18h-3z" fill="#B81D24" />
        <path d="M6 3h3.5l5.5 18h-3.5z" fill="#E50914" />
      </svg>
    ),
  },

  // 7. Instagram
  {
    name: 'Instagram',
    bg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },

  // 8. Uber
  {
    name: 'Uber',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="28" height="28" aria-hidden="true">
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          Uber
        </text>
      </svg>
    ),
  },

  // 9. Airbnb
  {
    name: 'Airbnb',
    bg: '#FF5A5F',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M12 2C9.4 2 7.7 3.8 7.7 5.7c0 2.4 1.7 5.1 4.3 8.3 2.6-3.2 4.3-5.9 4.3-8.3C16.3 3.8 14.6 2 12 2zm0 6.5c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm6.4 8.7c-1.8-1.7-4-3.5-6.4-5.8-2.4 2.3-4.6 4.1-6.4 5.8-1.3 1.2-2.1 2.8-2.1 4.5 0 1.2.9 2.3 2.1 2.3 1.4 0 2.8-.7 3.9-1.9 2.5-2.7 2.5-2.7 2.5-2.7s0 0 2.5 2.7c1.1 1.2 2.5 1.9 3.9 1.9 1.2 0 2.1-1.1 2.1-2.3 0-1.7-.8-3.3-2.1-4.5z" />
      </svg>
    ),
  },

  // 10. YouTube
  {
    name: 'YouTube',
    bg: '#FF0000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M10 15.5l6-3.5-6-3.5v7z" />
      </svg>
    ),
  },

  // 11. X / Twitter
  {
    name: 'X',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },

  // 12. Duolingo
  {
    name: 'Duolingo',
    bg: '#58CC02',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <circle cx="8.5" cy="11.5" r="3.5" fill="#FFFFFF" />
        <circle cx="15.5" cy="11.5" r="3.5" fill="#FFFFFF" />
        <circle cx="9.5" cy="11.5" r="1.8" fill="#4B4B4B" />
        <circle cx="14.5" cy="11.5" r="1.8" fill="#4B4B4B" />
        <path d="M12 14.5l-1.5 2h3z" fill="#FF9600" />
      </svg>
    ),
  },

  // 13. LinkedIn
  {
    name: 'LinkedIn',
    bg: '#0A66C2',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="24" height="24" aria-hidden="true">
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
      </svg>
    ),
  },

  // 14. Deliveroo
  {
    name: 'Deliveroo',
    bg: '#00CDBC',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <circle cx="9.5" cy="10" r="1.5" />
        <circle cx="14.5" cy="9" r="1.5" />
        <path d="M19 12.5c-1-2.5-3-5-6-6-2.5-.8-5 .5-6.5 2L3 13.5l2 4 4-1 2 4.5 4-1 1-3.5 3-4z" />
      </svg>
    ),
  },

  // 15. DoorDash
  {
    name: 'DoorDash',
    bg: '#FF3008',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M21.5 12c0-2.5-2-4.5-4.5-4.5H4v3h13c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H8v3h9c2.5 0 4.5-2 4.5-4.5z" />
      </svg>
    ),
  },

  // 16. Booking.com
  {
    name: 'Booking.com',
    bg: '#003580',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <text
          x="46%"
          y="68%"
          textAnchor="middle"
          fontSize="15"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          B.
        </text>
      </svg>
    ),
  },

  // 17. WhatsApp
  {
    name: 'WhatsApp',
    bg: '#25D366',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zm5.78 13.98c-.24.67-1.39 1.28-1.92 1.36-.52.08-1.2.11-3.48-.84-2.73-1.14-4.48-3.92-4.62-4.1-.13-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4.06.61.56.22.52.75 1.83.82 1.96.07.14.12.3.02.49-.09.19-.14.3-.28.46-.14.16-.3.35-.43.47-.14.14-.29.3-.12.59.16.29.73 1.2 1.56 1.94 1.07.95 1.97 1.24 2.25 1.38.28.14.45.12.62-.07.17-.19.73-.85.92-1.14.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.7-.17 1.37z" />
      </svg>
    ),
  },

  // 18. TikTok
  {
    name: 'TikTok',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M16.6 5.8c1.1.8 2.4 1.2 3.8 1.3V3.9c-1.4-.1-2.7-.8-3.5-1.9H14v13.3c0 1.9-1.5 3.4-3.4 3.4s-3.4-1.5-3.4-3.4 1.5-3.4 3.4-3.4c.4 0 .7.1 1 .2V8.9c-.3 0-.7-.1-1-.1-3.6 0-6.6 2.9-6.6 6.5s2.9 6.5 6.6 6.5 6.6-2.9 6.6-6.5V9.4c1.8 1.3 4 2.1 6.4 2.1v-3.2c-2.4 0-4.6-.9-6.4-2.5z" fill="#25F4EE" />
        <path d="M16 5.2c1.1.8 2.4 1.2 3.8 1.3V3.3c-1.4-.1-2.7-.8-3.5-1.9h-2.9v13.3c0 1.9-1.5 3.4-3.4 3.4s-3.4-1.5-3.4-3.4 1.5-3.4 3.4-3.4c.4 0 .7.1 1 .2V8.3c-.3 0-.7-.1-1-.1-3.6 0-6.6 2.9-6.6 6.5s2.9 6.5 6.6 6.5 6.6-2.9 6.6-6.5V8.8c1.8 1.3 4 2.1 6.4 2.1V7.7c-2.4 0-4.6-.9-6.4-2.5z" fill="#FE2C55" />
        <path d="M16.3 5.5c1.1.8 2.4 1.2 3.8 1.3V3.6c-1.4-.1-2.7-.8-3.5-1.9h-2.9v13.3c0 1.9-1.5 3.4-3.4 3.4s-3.4-1.5-3.4-3.4 1.5-3.4 3.4-3.4c.4 0 .7.1 1 .2V8.6c-.3 0-.7-.1-1-.1-3.6 0-6.6 2.9-6.6 6.5s2.9 6.5 6.6 6.5 6.6-2.9 6.6-6.5V9.1c1.8 1.3 4 2.1 6.4 2.1V8c-2.4 0-4.6-.9-6.4-2.5z" fill="#FFFFFF" />
      </svg>
    ),
  },

  // 19. Snapchat
  {
    name: 'Snapchat',
    bg: '#FFFC00',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" width="26" height="26" aria-hidden="true">
        <path d="M12 3.5c-3.1 0-5.2 2.3-5.2 5.4 0 .8.2 1.6.4 2.1-.8.2-1.6.7-1.8 1.3-.2.5.1 1 .6 1.2.6.2 1.3.1 1.7-.1.4 1.5 1.5 2.7 3.2 3.1-.3.4-1 1-2.5 1.1-.4 0-.8.3-.8.7 0 .5.4.9.9 1 1.1.1 2.3-.3 3.5-.8 1.2.5 2.4.9 3.5.8.5-.1.9-.5.9-1 0-.4-.4-.7-.8-.7-1.5-.1-2.2-.7-2.5-1.1 1.7-.4 2.8-1.6 3.2-3.1.4.2 1.1.3 1.7.1.5-.2.8-.7.6-1.2-.2-.6-1-1.1-1.8-1.3.2-.5.4-1.3.4-2.1 0-3.1-2.1-5.4-5.2-5.4z" />
      </svg>
    ),
  },

  // 20. App Store
  {
    name: 'App Store',
    bg: 'linear-gradient(135deg, #1C9FFF 0%, #0076FF 100%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M13.2 13.8l-1.2-2.1-1.2 2.1H8.5l3.5-6.1L15.5 16h-2.3z" />
        <line x1="7" y1="14" x2="17" y2="14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },

  // 21. Slack
  {
    name: 'Slack',
    bg: '#4A154B',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 0 1 4 0v5a2 2 0 1 1-4 0v-5zm2-6a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 0 1 0 4H4a2 2 0 1 1 0-4h5zm6 2a2 2 0 1 1 2 2h-2v-2zm-1 0a2 2 0 0 1-4 0V7a2 2 0 1 1 4 0v5zm-2 6a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 0 1 0-4h5a2 2 0 1 1 0 4h-5z" fill="#ECB22E" />
        <circle cx="14" cy="5" r="1.5" fill="#36C5F0" />
        <circle cx="19" cy="10" r="1.5" fill="#2EB67D" />
        <circle cx="10" cy="19" r="1.5" fill="#E01E5A" />
      </svg>
    ),
  },

  // 22. Tinder
  {
    name: 'Tinder',
    bg: 'linear-gradient(135deg, #FD5068 0%, #FF6036 100%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M12.5 3c-.3 1.8-.7 3.2-1.7 4.5C9.6 9 8.5 10.4 8.5 12.3c0 2.9 2.1 5.3 5 5.3 2.9 0 5-2.4 5-5.3 0-3.6-2.5-6.5-6-9.3zm.5 12.5c-1.4 0-2.5-1.1-2.5-2.5 0-.8.4-1.5 1-1.9.3.8.9 1.4 1.5 1.4.3 0 .6-.1.9-.3.1 1.8-.9 3.3-.9 3.3z" />
      </svg>
    ),
  },

  // 23. Reddit
  {
    name: 'Reddit',
    bg: '#FF4500',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#FF4500" />
        <path d="M18.8 11.2a1.8 1.8 0 0 0-1.8-1.8c-.5 0-.9.2-1.2.5-1-.7-2.4-1.1-3.9-1.2l.7-3.1 2.2.5a1.3 1.3 0 1 0 .2-.9l-2.6-.6-.9 4c-1.6.1-3 .5-4 1.2a1.8 1.8 0 0 0-1.2-.5 1.8 1.8 0 0 0-.6 3.5c-.1.3-.1.6-.1.9 0 2.6 2.9 4.7 6.5 4.7s6.5-2.1 6.5-4.7c0-.3 0-.6-.1-.9a1.8 1.8 0 0 0 .6-1.6zm-8.8.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1zm4.8 3.6c-.6.6-1.7.6-2.8.6s-2.2 0-2.8-.6a.3.3 0 0 1 .4-.4c.5.5 1.4.5 2.4.5s1.9 0 2.4-.5a.3.3 0 0 1 .4.4zm-.4-2.6a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" fill="#FFFFFF" />
      </svg>
    ),
  },

  // 24. Pinterest
  {
    name: 'Pinterest',
    bg: '#E60023',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.38 9.3-.09-.78-.17-1.98.04-2.83.19-.8.1.84 1.23-5.23 0 0-.31-.63-.31-1.56 0-1.46.85-2.55 1.9-2.55.9 0 1.33.67 1.33 1.48 0 .9-.57 2.26-.87 3.51-.25 1.05.53 1.91 1.56 1.91 1.88 0 3.32-1.98 3.32-4.84 0-2.53-1.82-4.3-4.42-4.3-3.01 0-4.78 2.26-4.78 4.59 0 .91.35 1.88.79 2.41.09.1.1.19.07.3-.08.33-.26 1.05-.3 1.19-.05.2-.16.24-.37.15-1.38-.64-2.24-2.66-2.24-4.28 0-3.48 2.53-6.68 7.3-6.68 3.83 0 6.81 2.73 6.81 6.38 0 3.81-2.4 6.88-5.74 6.88-1.12 0-2.18-.58-2.54-1.27l-.69 2.64c-.25.97-.93 2.18-1.38 2.92.99.3 2.04.47 3.13.47 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ),
  },
]

// Single 3D App Icon Item with interactive tilt on hover
function AppIconItem({ icon, index }: { icon: AppIconDef; index: number }) {
  const [transform, setTransform] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  // Floating animation cycle staggered by index
  const floatDuration = 4.2 + (index % 6) * 0.6
  const floatDelay = -((index * 0.4) % 4)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Smooth responsive 3D tilt
    const rotateX = -(y / (rect.height / 2)) * 26
    const rotateY = (x / (rect.width / 2)) * 26

    setTransform(
      `perspective(400px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale3d(1.18, 1.18, 1.18) translateZ(14px)`
    )
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTransform('')
  }

  return (
    <div
      className="app-icon-grid-cell"
      style={{
        animationDuration: `${floatDuration}s`,
        animationDelay: `${floatDelay}s`,
      }}
    >
      <div
        className={`app-icon-3d-box${isHovered ? ' is-hovered' : ''}`}
        style={{
          background: icon.bg,
          transform: isHovered ? transform : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`${icon.name} icon`}
        title={icon.name}
      >
        {/* 3D Gloss Highlight Overlay */}
        <div className="app-icon-gloss" aria-hidden="true" />
        <div className="app-icon-bevel-bottom" aria-hidden="true" />

        {/* SVG Graphic */}
        <div className="app-icon-svg-wrap" aria-hidden="true">
          {icon.renderSvg()}
        </div>
      </div>
    </div>
  )
}

export function AppIconBackground() {
  // Generate 192 icons so it densely covers any viewport height/width completely without empty bands
  const repeatedIcons = React.useMemo(() => {
    const result: AppIconDef[] = []
    const targetCount = 192
    while (result.length < targetCount) {
      for (const icon of FAMOUS_APP_ICONS) {
        result.push(icon)
        if (result.length >= targetCount) break
      }
    }
    return result
  }, [])

  return (
    <div className="app-icon-bg-container" aria-hidden="true">
      <div className="app-icon-grid-viewport">
        {repeatedIcons.map((icon, i) => (
          <AppIconItem key={`${icon.name}-${i}`} icon={icon} index={i} />
        ))}
      </div>
    </div>
  )
}
