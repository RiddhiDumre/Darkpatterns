import React, { useEffect, useMemo, useState } from 'react'

export interface AppIconDef {
  name: string
  bg: string
  renderSvg: () => React.ReactNode
}

export const FAMOUS_APP_ICONS_50: AppIconDef[] = [
  // 1. Spotify
  {
    name: 'Spotify',
    bg: '#1DB954',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#000000" width="24" height="24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.42a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 0 1-.28-1.22c3.8-.87 7.08-.5 9.72 1.12.3.17.38.56.21.85zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.16a.78.78 0 0 1-.46-1.5c3.63-1.1 8.15-.57 11.24 1.33.36.22.48.69.26 1.07zm.11-2.84C14.7 8.94 9.38 8.76 6.3 9.7a.94.94 0 1 1-.55-1.8c3.54-1.07 9.42-.87 12.87 1.18.42.25.56.8.31 1.22-.25.42-.8.56-1.22.31z" />
      </svg>
    ),
  },

  // 2. Apple Music
  {
    name: 'Apple Music',
    bg: 'linear-gradient(135deg, #FC3C44 0%, #F94C57 100%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    ),
  },

  // 3. Swiggy
  {
    name: 'Swiggy',
    bg: '#FC8019',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="24" height="24" aria-hidden="true">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.75 6.9 11.3 7.2 11.53.25.2.57.3.8.3s.55-.1.8-.3C13.1 21.3 20 15.75 20 10c0-4.42-3.58-8-8-8zm1.5 11.5c-.8.6-1.8.7-2.7.4-.3-.1-.5-.4-.4-.7.1-.3.4-.5.7-.4.6.2 1.2.1 1.7-.3.5-.4.8-1 .7-1.7-.1-.9-1-1.6-1.9-1.5-1.4.1-2.5 1.2-2.5 2.6 0 .7.4 1.4 1 1.9.2.2.3.6.1.8-.2.2-.6.3-.8.1-.8-.7-1.3-1.6-1.4-2.7-.1-2 1.5-3.7 3.5-3.8 1.3-.1 2.5.9 2.7 2.2.1.9-.2 1.9-1 2.5z" />
      </svg>
    ),
  },

  // 4. Zomato
  {
    name: 'Zomato',
    bg: '#CB202D',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="26" height="26" aria-hidden="true">
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          fontSize="9.5"
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
      <svg viewBox="0 0 24 24" fill="#FF9900" width="22" height="22" aria-hidden="true">
        <path d="M18.8 17.5c-4.4 2.8-9.8 1.9-13.6-.8-.2-.1-.1-.4.1-.3 4.1 2.3 9.4 2.6 13.3.4.3-.2.5.5.2.7z" />
        <path d="M19.9 16.3c-.2-.3-1.6-.7-2.6-.4-.3.1-.3-.2 0-.4 1.5-1 3.5-.8 3.7-.4.2.4-.4 2.3-1.8 3.4-.2.2-.4.1-.3-.2.4-.7.9-1.8 1-2z" />
        <text
          x="10.5"
          y="13"
          textAnchor="middle"
          fontSize="13"
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
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="24" height="24" aria-hidden="true">
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          fontSize="10"
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12 2C9.4 2 7.7 3.8 7.7 5.7c0 2.4 1.7 5.1 4.3 8.3 2.6-3.2 4.3-5.9 4.3-8.3C16.3 3.8 14.6 2 12 2zm0 6.5c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm6.4 8.7c-1.8-1.7-4-3.5-6.4-5.8-2.4 2.3-4.6 4.1-6.4 5.8-1.3 1.2-2.1 2.8-2.1 4.5 0 1.2.9 2.3 2.1 2.3 1.4 0 2.8-.7 3.9-1.9 2.5-2.7 2.5-2.7 2.5-2.7s0 0 2.5 2.7c1.1 1.2 2.5 1.9 3.9 1.9 1.2 0 2.1-1.1 2.1-2.3 0-1.7-.8-3.3-2.1-4.5z" />
      </svg>
    ),
  },

  // 10. YouTube
  {
    name: 'YouTube',
    bg: '#FF0000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M10 15.5l6-3.5-6-3.5v7z" />
      </svg>
    ),
  },

  // 11. X / Twitter
  {
    name: 'X',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="19" height="19" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },

  // 12. Duolingo
  {
    name: 'Duolingo',
    bg: '#58CC02',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="20" height="20" aria-hidden="true">
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
      </svg>
    ),
  },

  // 14. Deliveroo
  {
    name: 'Deliveroo',
    bg: '#00CDBC',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M21.5 12c0-2.5-2-4.5-4.5-4.5H4v3h13c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H8v3h9c2.5 0 4.5-2 4.5-4.5z" />
      </svg>
    ),
  },

  // 16. Booking.com
  {
    name: 'Booking.com',
    bg: '#003580',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <text
          x="46%"
          y="68%"
          textAnchor="middle"
          fontSize="14"
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zm5.78 13.98c-.24.67-1.39 1.28-1.92 1.36-.52.08-1.2.11-3.48-.84-2.73-1.14-4.48-3.92-4.62-4.1-.13-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4.06.61.56.22.52.75 1.83.82 1.96.07.14.12.3.02.49-.09.19-.14.3-.28.46-.14.16-.3.35-.43.47-.14.14-.29.3-.12.59.16.29.73 1.2 1.56 1.94 1.07.95 1.97 1.24 2.25 1.38.28.14.45.12.62-.07.17-.19.73-.85.92-1.14.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.7-.17 1.37z" />
      </svg>
    ),
  },

  // 18. TikTok
  {
    name: 'TikTok',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" width="22" height="22" aria-hidden="true">
        <path d="M12 3.5c-3.1 0-5.2 2.3-5.2 5.4 0 .8.2 1.6.4 2.1-.8.2-1.6.7-1.8 1.3-.2.5.1 1 .6 1.2.6.2 1.3.1 1.7-.1.4 1.5 1.5 2.7 3.2 3.1-.3.4-1 1-2.5 1.1-.4 0-.8.3-.8.7 0 .5.4.9.9 1 1.1.1 2.3-.3 3.5-.8 1.2.5 2.4.9 3.5.8.5-.1.9-.5.9-1 0-.4-.4-.7-.8-.7-1.5-.1-2.2-.7-2.5-1.1 1.7-.4 2.8-1.6 3.2-3.1.4.2 1.1.3 1.7.1.5-.2.8-.7.6-1.2-.2-.6-1-1.1-1.8-1.3.2-.5.4-1.3.4-2.1 0-3.1-2.1-5.4-5.2-5.4z" />
      </svg>
    ),
  },

  // 20. App Store
  {
    name: 'App Store',
    bg: 'linear-gradient(135deg, #1C9FFF 0%, #0076FF 100%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12.5 3c-.3 1.8-.7 3.2-1.7 4.5C9.6 9 8.5 10.4 8.5 12.3c0 2.9 2.1 5.3 5 5.3 2.9 0 5-2.4 5-5.3 0-3.6-2.5-6.5-6-9.3zm.5 12.5c-1.4 0-2.5-1.1-2.5-2.5 0-.8.4-1.5 1-1.9.3.8.9 1.4 1.5 1.4.3 0 .6-.1.9-.3.1 1.8-.9 3.3-.9 3.3z" />
      </svg>
    ),
  },

  // 23. Reddit
  {
    name: 'Reddit',
    bg: '#FF4500',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
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
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.38 9.3-.09-.78-.17-1.98.04-2.83.19-.8.1.84 1.23-5.23 0 0-.31-.63-.31-1.56 0-1.46.85-2.55 1.9-2.55.9 0 1.33.67 1.33 1.48 0 .9-.57 2.26-.87 3.51-.25 1.05.53 1.91 1.56 1.91 1.88 0 3.32-1.98 3.32-4.84 0-2.53-1.82-4.3-4.42-4.3-3.01 0-4.78 2.26-4.78 4.59 0 .91.35 1.88.79 2.41.09.1.1.19.07.3-.08.33-.26 1.05-.3 1.19-.05.2-.16.24-.37.15-1.38-.64-2.24-2.66-2.24-4.28 0-3.48 2.53-6.68 7.3-6.68 3.83 0 6.81 2.73 6.81 6.38 0 3.81-2.4 6.88-5.74 6.88-1.12 0-2.18-.58-2.54-1.27l-.69 2.64c-.25.97-.93 2.18-1.38 2.92.99.3 2.04.47 3.13.47 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ),
  },

  // 25. Flipkart
  {
    name: 'Flipkart',
    bg: '#2874F0',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFE500" width="22" height="22" aria-hidden="true">
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFE500"
        >
          f
        </text>
      </svg>
    ),
  },

  // 26. Myntra
  {
    name: 'Myntra',
    bg: '#FFFFFF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 17l4-9 4 7 4-7 4 9" stroke="#FF3F6C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },

  // 27. Blinkit
  {
    name: 'Blinkit',
    bg: '#F8CB46',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          fontSize="15"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#0C831F"
        >
          b
        </text>
      </svg>
    ),
  },

  // 28. Zepto
  {
    name: 'Zepto',
    bg: '#7C25E9',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          fontSize="15"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FF3269"
        >
          Z
        </text>
      </svg>
    ),
  },

  // 29. Ola
  {
    name: 'Ola',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="#B8EB1C" strokeWidth="3.2" />
      </svg>
    ),
  },

  // 30. Google
  {
    name: 'Google',
    bg: '#FFFFFF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
    ),
  },

  // 31. Google Maps
  {
    name: 'Google Maps',
    bg: '#FFFFFF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
        <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
      </svg>
    ),
  },

  // 32. Disney+
  {
    name: 'Disney+',
    bg: '#0E1B40',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <text
          x="42%"
          y="68%"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          D
        </text>
        <path d="M17 9v6m-3-3h6" stroke="#42C0FB" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 33. Prime Video
  {
    name: 'Prime Video',
    bg: '#00A8E1',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M4 15.5c4.5 3 11.5 3 16 0" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M18.5 13l2.5 2.5-3.5.5" fill="#FFFFFF" />
      </svg>
    ),
  },

  // 34. Paytm
  {
    name: 'Paytm',
    bg: '#002970',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#00BAF2"
        >
          paytm
        </text>
      </svg>
    ),
  },

  // 35. PhonePe
  {
    name: 'PhonePe',
    bg: '#5F259F',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          पे
        </text>
      </svg>
    ),
  },

  // 36. Google Pay
  {
    name: 'Google Pay',
    bg: '#FFFFFF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M9 8a4 4 0 0 0-4 4v4h3v-4a1 1 0 0 1 1-1h2V8H9z" fill="#4285F4" />
        <path d="M15 8h-2v3h2a1 1 0 0 1 1 1v4h3v-4a4 4 0 0 0-4-4z" fill="#34A853" />
        <circle cx="12" cy="12" r="1.5" fill="#EA4335" />
      </svg>
    ),
  },

  // 37. CRED
  {
    name: 'CRED',
    bg: '#101010',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" width="20" height="20" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M16 8H9a3 3 0 0 0 0 6h7" />
      </svg>
    ),
  },

  // 38. Meesho
  {
    name: 'Meesho',
    bg: '#D32F80',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M5 18V8l7 5 7-5v10" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },

  // 39. Discord
  {
    name: 'Discord',
    bg: '#5865F2',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
      </svg>
    ),
  },

  // 40. Telegram
  {
    name: 'Telegram',
    bg: '#2AABEE',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.88 8.01-3.44 3.82-1.59 4.61-1.87 5.13-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z" />
      </svg>
    ),
  },

  // 41. Steam
  {
    name: 'Steam',
    bg: '#171A21',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="15.5" cy="8.5" r="2.5" fill="#FFFFFF" />
        <circle cx="9" cy="15" r="2" fill="#FFFFFF" />
        <line x1="10" y1="14" x2="14" y2="10" stroke="#FFFFFF" strokeWidth="2.5" />
      </svg>
    ),
  },

  // 42. Twitch
  {
    name: 'Twitch',
    bg: '#9146FF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M4 3h16v12h-4l-3 3v-3H8L4 14V3zm9 4v4h2V7h-2zm-5 0v4h2V7H8z" />
      </svg>
    ),
  },

  // 43. McDonald's
  {
    name: 'McDonalds',
    bg: '#DA291C',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFC72C" width="24" height="24" aria-hidden="true">
        <path d="M5.5 19c0-4.5 1.8-8 4-8s3.5 3 3.5 7c0-4 1.5-7 3.5-7s4 3.5 4 8h-2c0-3.5-1-6-2-6s-2 2.5-2 6h-2c0-3.5-1-6-2-6s-2 2.5-2 6h-3z" />
      </svg>
    ),
  },

  // 44. Starbucks
  {
    name: 'Starbucks',
    bg: '#00704A',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.5" fill="#FFFFFF" />
        <path d="M12 4l1.5 2.5h2.5L14 8l1 2.5-3-1.5-3 1.5 1-2.5-2-1.5h2.5z" fill="#00704A" />
      </svg>
    ),
  },

  // 45. Bumble
  {
    name: 'Bumble',
    bg: '#FFC629',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <rect x="7" y="7" width="10" height="2" rx="1" />
        <rect x="6" y="11" width="12" height="2" rx="1" />
        <rect x="8" y="15" width="8" height="2" rx="1" />
      </svg>
    ),
  },

  // 46. Notion
  {
    name: 'Notion',
    bg: '#FFFFFF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#000000" width="22" height="22" aria-hidden="true">
        <path d="M4 4.5l11-1.5 4 1.5v15l-11 1.5-4-1.5v-15zm4 4v8l2.5-4.5v4.5h2v-8l-2.5 4.5V8.5H8z" />
      </svg>
    ),
  },

  // 47. Canva
  {
    name: 'Canva',
    bg: 'linear-gradient(135deg, #00C4CC 0%, #7D2AE8 100%)',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          fontSize="15"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          C
        </text>
      </svg>
    ),
  },

  // 48. Strava
  {
    name: 'Strava',
    bg: '#FC5200',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M12 4l4 8h-3l-1-2-1 2H8l4-8zm3 10l2 4h-2l-1-2-1 2h-2l2-4h2z" />
      </svg>
    ),
  },

  // 49. Lyft
  {
    name: 'Lyft',
    bg: '#FF00BF',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="24" height="24" aria-hidden="true">
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          lyft
        </text>
      </svg>
    ),
  },

  // 50. Nike
  {
    name: 'Nike',
    bg: '#000000',
    renderSvg: () => (
      <svg viewBox="0 0 24 24" fill="#FFFFFF" width="22" height="22" aria-hidden="true">
        <path d="M21.7 8.3c-2.3 2.8-5.8 5.6-10.2 7.7-2.6 1.2-5.1 1.7-6.9 1.7-1.3 0-2.2-.3-2.5-.7-.4-.5-.1-1.3.8-2.2 1.3-1.3 3.4-2.6 5.8-3.6 1.1-.5 2.1-.8 3-.9-.6.7-1.1 1.4-1.3 2-.2.6-.1 1.1.2 1.3.4.3 1.1.1 2-.5 2.8-1.7 5.8-3.6 9.1-4.8z" />
      </svg>
    ),
  },
]

// Single 3D App Icon Item with interactive movement and tilt on hover
function AppIconItem({ icon, index }: { icon: AppIconDef; index: number }) {
  const [transform, setTransform] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  // Floating animation cycle staggered by index
  const floatDuration = 4.0 + (index % 5) * 0.5
  const floatDelay = -((index * 0.3) % 4)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // 3D rotation angles
    const rotateX = -(y / (rect.height / 2)) * 24
    const rotateY = (x / (rect.width / 2)) * 24

    // Physical movement on mouse hover (shifts following cursor + floats up)
    const moveX = (x / (rect.width / 2)) * 10
    const moveY = (y / (rect.height / 2)) * 10 - 6

    setTransform(
      `perspective(420px) translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 16px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale3d(1.2, 1.2, 1.2)`
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
        aria-label={`${icon.name} app icon`}
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
  // 1. Interactive subtle pan background following mouse position
  const [pan, setPan] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let animId: number
    const handleWindowMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animId)
      animId = requestAnimationFrame(() => {
        // Normalized -0.5 to 0.5
        const normX = e.clientX / window.innerWidth - 0.5
        const normY = e.clientY / window.innerHeight - 0.5
        setPan({ x: normX * -20, y: normY * -16 })
      })
    }
    window.addEventListener('mousemove', handleWindowMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  // 2. Responsive exact calculation to ensure NO icon is incomplete / sliced off
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  })

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 3. Calculate exact number of complete rows and columns that fit without overflow
  const iconList = useMemo(() => {
    // Reduced row height: ~58px vertical pitch (44px icon + 14px gap)
    // Column pitch: ~74px horizontal pitch (44px icon + 30px gap)
    const availableW = Math.max(320, viewportSize.width - 48)
    const availableH = Math.max(300, viewportSize.height - 40)

    const cols = Math.max(4, Math.floor(availableW / 76))
    const rows = Math.max(4, Math.floor(availableH / 58))
    const totalSlots = cols * rows

    // Shuffle 50 apps and fill totalSlots ensuring no app repeats more than 2 times
    const pool = [...FAMOUS_APP_ICONS_50]
    // Deterministic pseudo-shuffle
    const shuffled = pool.sort((a, b) => (a.name.charCodeAt(0) * 17) % 31 - (b.name.charCodeAt(0) * 17) % 31)

    const result: AppIconDef[] = []
    const counts: Record<string, number> = {}

    let poolIdx = 0
    while (result.length < totalSlots) {
      const candidate = shuffled[poolIdx % shuffled.length]
      const currentCount = counts[candidate.name] || 0

      if (currentCount < 2) {
        result.push(candidate)
        counts[candidate.name] = currentCount + 1
      }
      poolIdx++

      // Safety escape if all items hit cap
      if (poolIdx > shuffled.length * 3) break
    }

    return result
  }, [viewportSize.width, viewportSize.height])

  return (
    <div className="app-icon-bg-container" aria-hidden="true">
      <div
        className="app-icon-grid-viewport"
        style={{
          transform: `translate3d(${pan.x.toFixed(1)}px, ${pan.y.toFixed(1)}px, 0)`,
        }}
      >
        {iconList.map((icon, i) => (
          <AppIconItem key={`${icon.name}-${i}`} icon={icon} index={i} />
        ))}
      </div>
    </div>
  )
}
