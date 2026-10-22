import os
import base64

def get_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

b64_specimen = get_b64("public/mobile-checkout-specimen.png")
b64_detective = get_b64("public/detective-doodle.png")
b64_archivo = get_b64("public/fonts/archivo-var.woff2")
b64_caveat = get_b64("public/fonts/caveat-var.woff2")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dark Pattern Detector · Launch Film</title>
  <style>
    @font-face {{
      font-family: 'Archivo';
      src: url('data:font/woff2;base64,{b64_archivo}') format('woff2');
      font-weight: 100 900;
      font-style: normal;
    }}
    @font-face {{
      font-family: 'Caveat';
      src: url('data:font/woff2;base64,{b64_caveat}') format('woff2');
      font-weight: 400 700;
      font-style: normal;
    }}

    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body, html {{
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background-color: #fafaf9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }}

    #viewport {{
      position: relative;
      width: 1920px;
      height: 1080px;
      background-color: #fafaf9;
      overflow: hidden;
    }}

    /* Background Ambient Grid & Dot Pattern */
    #bg {{
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(18, 19, 22, 0.12) 1.5px, transparent 1.5px);
      background-size: 36px 36px;
      pointer-events: none;
      z-index: 1;
    }}

    .ambient-icons {{
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.18;
      z-index: 2;
    }}
    .app-icon-squircle {{
      position: absolute;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px -4px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.4);
    }}

    /* Top Brand Bar HUD */
    #topBar {{
      position: absolute;
      top: 36px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 150;
      pointer-events: none;
    }}
    .brand-group {{
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      padding: 8px 18px 8px 12px;
      border-radius: 999px;
      border: 1px solid rgba(18, 19, 22, 0.08);
      box-shadow: 0 4px 16px -2px rgba(0,0,0,0.04);
    }}
    .brand-group img {{
      width: 32px;
      height: 32px;
      object-fit: contain;
    }}
    .brand-title {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: -0.02em;
      color: #121316;
    }}
    .brand-pill {{
      font-family: 'Archivo', sans-serif;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: #121316;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 999px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }}

    /* Camera World Layer */
    #world {{
      position: absolute;
      top: 0;
      left: 0;
      width: 1920px;
      height: 1080px;
      transform-origin: 0 0;
      z-index: 10;
    }}

    /* THE ONE SHAPE CONTAINER */
    #shape {{
      position: absolute;
      box-sizing: border-box;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border: 1px solid rgba(18, 19, 22, 0.08);
      box-shadow: 0 24px 64px -12px rgba(18, 19, 22, 0.12), 0 4px 16px -2px rgba(18, 19, 22, 0.06);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }}

    /* Individual State Views Inside Shape */
    .state-view {{
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transform-origin: center center;
    }}

    /* 1. DROPZONE */
    .dz-inner {{
      width: 90%;
      height: 85%;
      border: 2px dashed rgba(18, 19, 22, 0.2);
      border-radius: 20px;
      background: #fafaf9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
      text-align: center;
    }}
    .dz-icon {{
      font-size: 38px;
    }}
    .dz-heading {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 22px;
      color: #121316;
      letter-spacing: -0.02em;
    }}
    .dz-sub {{
      font-size: 14px;
      color: #6b7280;
    }}
    .dz-chip {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1.5px solid #121316;
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 700;
      color: #121316;
      box-shadow: 2px 2px 0px #121316;
      margin-top: 6px;
    }}

    /* 2. RADAR SCANNER */
    .radar-lens {{
      position: relative;
      width: 100%;
      height: 100%;
      background: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .radar-circle {{
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }}
    .radar-crosshair {{
      position: absolute;
      width: 100%;
      height: 1px;
      background: rgba(16, 185, 129, 0.25);
    }}
    .radar-crosshair.vert {{
      width: 1px;
      height: 100%;
    }}
    .radar-sweep {{
      position: absolute;
      width: 50%;
      height: 50%;
      top: 0;
      right: 0;
      transform-origin: bottom left;
      background: conic-gradient(from 0deg, rgba(16, 185, 129, 0.5) 0deg, transparent 90deg);
      border-radius: 100% 0 0 0;
    }}
    .radar-hud-text {{
      position: absolute;
      bottom: 24px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #34d399;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }}

    /* 3. 3D PHONE SPECIMEN */
    .phone-body {{
      position: relative;
      width: 100%;
      height: 100%;
      background: #09090b;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .phone-island {{
      position: absolute;
      top: 14px;
      width: 110px;
      height: 28px;
      background: #000000;
      border-radius: 16px;
      z-index: 5;
    }}
    .phone-screen {{
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border-radius: 44px;
      overflow: hidden;
      background: #ffffff;
    }}
    .phone-screen img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }}
    .screen-overlay-urgency {{
      position: absolute;
      top: 32%;
      left: 6%;
      right: 6%;
      height: 8.5%;
      border: 2.5px solid #d32f2f;
      background: rgba(211, 47, 47, 0.15);
      border-radius: 8px;
      opacity: 0;
    }}
    .screen-overlay-warranty {{
      position: absolute;
      top: 40.5%;
      left: 6%;
      right: 6%;
      height: 10%;
      border: 2.5px solid #d97706;
      background: rgba(217, 119, 6, 0.15);
      border-radius: 8px;
      opacity: 0;
    }}

    /* 4. FORENSIC FLAG CARD */
    .forensic-card {{
      width: 100%;
      height: 100%;
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }}
    .forensic-badge-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .forensic-pill {{
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 6px 14px;
      border-radius: 999px;
      color: #d32f2f;
      font-weight: 800;
      font-size: 13px;
    }}
    .forensic-num {{
      width: 22px;
      height: 22px;
      background: #d32f2f;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }}
    .forensic-heading {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 32px;
      color: #121316;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-top: 8px;
    }}
    .forensic-quote {{
      font-family: 'Caveat', cursive;
      font-size: 26px;
      color: #d32f2f;
      line-height: 1.25;
      font-weight: 700;
    }}
    .forensic-guideline {{
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
    }}

    /* 5. SEVERITY SLIDER */
    .slider-wrap {{
      width: 100%;
      height: 100%;
      padding: 24px 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
    }}
    .slider-header {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }}
    .slider-title {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.02em;
      color: #121316;
    }}
    .slider-val {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 28px;
      color: #d32f2f;
      letter-spacing: -0.02em;
    }}
    .slider-track {{
      position: relative;
      width: 100%;
      height: 20px;
      background: #f3f3f0;
      border-radius: 999px;
      overflow: visible;
    }}
    .slider-fill {{
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #d32f2f 100%);
      border-radius: 999px;
    }}
    .slider-thumb {{
      position: absolute;
      top: 50%;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #ffffff;
      border: 3px solid #d32f2f;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
      transform: translate(-50%, -50%);
    }}
    .slider-sub {{
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
    }}

    /* 6. TACTICS CASCADE */
    .cascade-card {{
      width: 100%;
      height: 100%;
      padding: 32px 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }}
    .cascade-top {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .cascade-idx {{
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #d32f2f;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }}
    .cascade-name {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 26px;
      color: #121316;
      letter-spacing: -0.02em;
    }}
    .cascade-evidence {{
      background: #f8fafc;
      border-left: 3px solid #d32f2f;
      padding: 12px 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #334155;
      border-radius: 0 8px 8px 0;
    }}
    .cascade-reality {{
      font-family: 'Caveat', cursive;
      font-size: 24px;
      color: #d32f2f;
      font-weight: 700;
      line-height: 1.2;
    }}

    /* 7. ETHICAL FIX TOGGLE */
    .toggle-view {{
      width: 100%;
      height: 100%;
      padding: 24px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      background: #ffffff;
    }}
    .toggle-heading {{
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 24px;
      color: #121316;
      letter-spacing: -0.02em;
    }}
    .toggle-track-outer {{
      position: relative;
      width: 380px;
      height: 72px;
      background: #f3f3f0;
      border-radius: 999px;
      padding: 6px;
      display: flex;
      align-items: center;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.06);
    }}
    .toggle-label-left, .toggle-label-right {{
      position: absolute;
      width: 50%;
      text-align: center;
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 15px;
      z-index: 2;
      pointer-events: none;
      transition: color 0.15s ease;
    }}
    .toggle-label-left {{ left: 0; color: #6b7280; }}
    .toggle-label-right {{ right: 0; color: #10b981; }}
    .toggle-knob {{
      position: absolute;
      top: 6px;
      bottom: 6px;
      background: #ffffff;
      border-radius: 999px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
      z-index: 1;
    }}
    .toggle-fix-text {{
      font-size: 14px;
      font-weight: 600;
      color: #059669;
    }}

    /* 8. DECEPTION ODOMETER */
    .odometer-view {{
      width: 100%;
      height: 100%;
      padding: 24px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #ffffff;
    }}
    .odo-label {{
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #6b7280;
    }}
    .odo-price-row {{
      display: flex;
      align-items: center;
      font-family: 'Archivo', sans-serif;
      font-weight: 900;
      font-size: 56px;
      letter-spacing: -0.04em;
      color: #121316;
      line-height: 1;
      height: 64px;
      overflow: hidden;
    }}
    .odo-slot {{
      display: inline-block;
      height: 64px;
      clip-path: inset(0 -10px);
      position: relative;
    }}
    .odo-strip {{
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
    }}
    .odo-digit {{
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .odo-subtext {{
      font-size: 14px;
      font-weight: 700;
      color: #10b981;
      background: #ecfdf5;
      padding: 4px 12px;
      border-radius: 999px;
    }}

    /* 9. VERIFIED BADGE */
    .shield-view {{
      width: 100%;
      height: 100%;
      background: #059669;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: #ffffff;
      text-align: center;
      box-shadow: inset 0 2px 8px rgba(255,255,255,0.3);
    }}
    .shield-svg {{
      width: 84px;
      height: 84px;
      stroke: #ffffff;
      stroke-width: 4;
      fill: none;
    }}
    .shield-title {{
      font-family: 'Archivo', sans-serif;
      font-weight: 900;
      font-size: 24px;
      letter-spacing: 0.02em;
    }}
    .shield-sub {{
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }}

    /* 10. WORDMARK STING */
    .wordmark-view {{
      width: 100%;
      height: 100%;
      padding: 36px 44px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 16px;
      background: #ffffff;
    }}
    .wm-logo {{
      width: 72px;
      height: 72px;
      object-fit: contain;
    }}
    .wm-title {{
      font-family: 'Archivo', sans-serif;
      font-weight: 900;
      font-size: 42px;
      color: #121316;
      letter-spacing: -0.035em;
      line-height: 1.05;
    }}
    .wm-slogan {{
      font-family: 'Caveat', cursive;
      font-size: 28px;
      color: #d32f2f;
      font-weight: 700;
    }}
    .wm-btn {{
      background: #121316;
      color: #ffffff;
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 999px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      margin-top: 4px;
    }}
    .wm-credit {{
      font-size: 13px;
      color: #878b96;
      font-weight: 500;
    }}

    /* CURSOR & TRAIL LAYER */
    #cursorTrail {{
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 180;
    }}
    #cursor {{
      position: absolute;
      top: 0;
      left: 0;
      z-index: 200;
      pointer-events: none;
      transform: translate(-4px, -4px);
    }}
    .cursor-arrow {{
      width: 22px;
      height: 22px;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
    }}
    .cursor-pill {{
      position: absolute;
      top: 18px;
      left: 18px;
      background: #121316;
      color: #ffffff;
      font-family: 'Archivo', sans-serif;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.04em;
      padding: 3px 10px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }}
    #ripple {{
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #d32f2f;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      pointer-events: none;
      z-index: 190;
    }}
  </style>
</head>
<body>
  <div id="viewport">
    <div id="bg"></div>

    <!-- Ambient 3D App Icons Grid -->
    <div class="ambient-icons" id="ambientIcons">
      <div class="app-icon-squircle" style="top: 120px; left: 140px; background: #1DB954;">
        <svg viewBox="0 0 24 24" fill="#000000" width="32" height="32"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm4.587 14.425a.623.623 0 0 1-.859.206c-2.348-1.436-5.305-1.76-8.788-.964a.625.625 0 0 1-.277-1.22c3.807-.87 7.077-.5 9.718 1.119a.624.624 0 0 1 .206.859zm1.225-2.723a.78.78 0 0 1-1.074.258c-2.688-1.652-6.786-2.13-9.965-1.164a.782.782 0 0 1-.462-1.493c3.633-1.103 8.147-.57 11.243 1.325a.78.78 0 0 1 .258 1.074z"/></svg>
      </div>
      <div class="app-icon-squircle" style="top: 140px; right: 180px; background: #FC8019;">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" width="30" height="30"><path d="M12 2C7.58 2 4 5.58 4 10c0 5.75 6.9 11.3 7.2 11.53.25.2.57.3.8.3s.55-.1.8-.3C13.1 21.3 20 15.75 20 10c0-4.42-3.58-8-8-8zm1.5 11.5c-.8.6-1.8.7-2.7.4-.3-.1-.5-.4-.4-.7.1-.3.4-.5.7-.4.6.2 1.2.1 1.7-.3.5-.4.8-1 .7-1.7-.1-.9-1-1.6-1.9-1.5-1.4.1-2.5 1.2-2.5 2.6 0 .7.4 1.4 1 1.9.2.2.3.6.1.8-.2.2-.6.3-.8.1-.8-.7-1.3-1.6-1.4-2.7-.1-2 1.5-3.7 3.5-3.8 1.3-.1 2.5.9 2.7 2.2.1.9-.2 1.9-1 2.5z"/></svg>
      </div>
      <div class="app-icon-squircle" style="bottom: 150px; left: 180px; background: #E50914;">
        <svg viewBox="0 0 24 24" fill="#FFFFFF" width="28" height="28"><path d="M4 2h4.5l7.5 14.5V2H20v20h-4.5L8 7.5V22H4V2z"/></svg>
      </div>
      <div class="app-icon-squircle" style="bottom: 120px; right: 160px; background: #FF9900;">
        <svg viewBox="0 0 24 24" fill="#111827" width="32" height="32"><path d="M13.9 16.5c-2.4 1.8-6 .9-8.2-.4-.2-.1-.4.1-.3.3 1.5 2.2 4.7 3.6 7.6 2.5 2.6-1 4.5-3.5 4.3-6.2-.2-2.5-2.1-4.2-4.5-4.2-3.1 0-5.3 2.5-5.3 5.7 0 2.4 1.4 4.3 3.6 4.7 1.4.3 2.8-.2 3.8-1.1.2-.2 0-.5-.2-.5l-.8-.8z"/></svg>
      </div>
    </div>

    <!-- Top Brand Bar -->
    <div id="topBar">
      <div class="brand-group">
        <img src="data:image/png;base64,{b64_detective}" alt="Detective Logo">
        <span class="brand-title">DARK PATTERN DETECTOR</span>
      </div>
      <div class="brand-pill">AI FORENSIC SCANNER</div>
    </div>

    <!-- Camera World -->
    <div id="world">
      <!-- THE ONE SHAPE -->
      <div id="shape">

        <!-- 1. DROPZONE -->
        <div class="state-view" id="view1">
          <div class="dz-inner">
            <div class="dz-icon">📂</div>
            <div class="dz-heading">Drop checkout screenshot, or paste ⌘V</div>
            <div class="dz-sub">Instant zero-friction AI vision analysis for deceptive UX</div>
            <div class="dz-chip" id="sampleChip">
              <span>⚡ Try Sample:</span>
              <span>Mobile Checkout Specimen</span>
            </div>
          </div>
        </div>

        <!-- 2. RADAR SCANNER -->
        <div class="state-view" id="view2">
          <div class="radar-lens">
            <div class="radar-circle" style="width: 260px; height: 260px;"></div>
            <div class="radar-circle" style="width: 180px; height: 180px;"></div>
            <div class="radar-circle" style="width: 100px; height: 100px;"></div>
            <div class="radar-crosshair"></div>
            <div class="radar-crosshair vert"></div>
            <div class="radar-sweep" id="radarSweep"></div>
            <div class="radar-hud-text">AUDITING MATRIX · 3200×1440</div>
          </div>
        </div>

        <!-- 3. 3D PHONE SPECIMEN -->
        <div class="state-view" id="view3">
          <div class="phone-body">
            <div class="phone-island"></div>
            <div class="phone-screen">
              <img src="data:image/png;base64,{b64_specimen}" alt="Checkout Screen">
              <div class="screen-overlay-urgency" id="ovUrgency"></div>
              <div class="screen-overlay-warranty" id="ovWarranty"></div>
            </div>
          </div>
        </div>

        <!-- 4. FORENSIC FLAG CARD -->
        <div class="state-view" id="view4">
          <div class="forensic-card">
            <div class="forensic-badge-row">
              <div class="forensic-pill">
                <span class="forensic-num">1</span>
                <span>FALSE URGENCY CAUGHT</span>
              </div>
              <span class="forensic-guideline">CCPA GUIDELINE 5(b)</span>
            </div>
            <div class="forensic-heading">Manufactured Urgency Timer</div>
            <div class="forensic-quote">"Only 2 left! Sale ends in 02:14:33" — Fabricated to panic you before comparing options.</div>
          </div>
        </div>

        <!-- 5. SEVERITY SLIDER -->
        <div class="state-view" id="view5">
          <div class="slider-wrap">
            <div class="slider-header">
              <span class="slider-title">Deceptive Severity Risk</span>
              <span class="slider-val" id="sliderScore">88 / 100</span>
            </div>
            <div class="slider-track" id="sliderTrack">
              <div class="slider-fill" id="sliderFill"></div>
              <div class="slider-thumb" id="sliderThumb"></div>
            </div>
            <div class="slider-sub">
              <span>0 (Honest)</span>
              <span style="color: #d32f2f; font-weight: 800;">CRITICAL MANIPULATION (88)</span>
              <span>100 (Predatory)</span>
            </div>
          </div>
        </div>

        <!-- 6. TACTICS CASCADE -->
        <div class="state-view" id="view6">
          <div class="cascade-card">
            <div class="cascade-top">
              <div class="cascade-idx" id="casIdx">1</div>
              <div class="cascade-name" id="casTitle">False Urgency</div>
            </div>
            <div class="cascade-evidence" id="casEvidence">"Only 2 left in stock — Sale ends in 02:14:33"</div>
            <div class="cascade-reality" id="casQuote">"Buy right now before you realize you don't need it."</div>
          </div>
        </div>

        <!-- 7. ETHICAL FIX TOGGLE -->
        <div class="state-view" id="view7">
          <div class="toggle-view">
            <div class="toggle-heading">1-Click Ethical UI Fix</div>
            <div class="toggle-track-outer" id="toggleTrack">
              <span class="toggle-label-left">✗ Manipulative</span>
              <span class="toggle-label-right">✓ Honest UX</span>
              <div class="toggle-knob" id="toggleKnob"></div>
            </div>
            <div class="toggle-fix-text">Removed fake timer · Unchecked recurring warranty</div>
          </div>
        </div>

        <!-- 8. DECEPTION ODOMETER -->
        <div class="state-view" id="view8">
          <div class="odometer-view">
            <div class="odo-label">Corrected Cart Total</div>
            <div class="odo-price-row">
              <span>$</span>
              <div class="odo-slot" style="width: 38px;">
                <div class="odo-strip" id="odoD1">
                  <div class="odo-digit">5</div><div class="odo-digit">4</div><div class="odo-digit">3</div><div class="odo-digit">2</div>
                </div>
              </div>
              <div class="odo-slot" style="width: 38px;">
                <div class="odo-strip" id="odoD2">
                  <div class="odo-digit">9</div><div class="odo-digit">8</div><div class="odo-digit">7</div><div class="odo-digit">9</div>
                </div>
              </div>
              <span>.</span>
              <div class="odo-slot" style="width: 38px;">
                <div class="odo-strip" id="odoD3">
                  <div class="odo-digit">9</div><div class="odo-digit">8</div><div class="odo-digit">9</div>
                </div>
              </div>
              <div class="odo-slot" style="width: 38px;">
                <div class="odo-strip" id="odoD4">
                  <div class="odo-digit">4</div><div class="odo-digit">6</div><div class="odo-digit">9</div>
                </div>
              </div>
            </div>
            <div class="odo-subtext">-$29.95 Sneak-in Fees Stripped</div>
          </div>
        </div>

        <!-- 9. VERIFIED BADGE -->
        <div class="state-view" id="view9">
          <div class="shield-view">
            <svg class="shield-svg" viewBox="0 0 24 24">
              <path id="shieldCheck" d="M20 6L9 17l-5-5" stroke-dasharray="30" stroke-dashoffset="0"/>
            </svg>
            <div class="shield-title">CERTIFIED HONEST UX</div>
            <div class="shield-sub">0 Manipulative Traps · Pure Consumer Respect</div>
          </div>
        </div>

        <!-- 10. WORDMARK STING -->
        <div class="state-view" id="view10">
          <div class="wordmark-view">
            <img class="wm-logo" src="data:image/png;base64,{b64_detective}" alt="Detective">
            <h1 class="wm-title">DARK PATTERN DETECTOR</h1>
            <p class="wm-slogan">"Deceptive design, unmasked."</p>
            <div class="wm-btn">Scan your checkout at darkpatterns.dev →</div>
            <p class="wm-credit">Zero data stored · Instant AI vision audit</p>
          </div>
        </div>

      </div><!-- /#shape -->
    </div><!-- /#world -->

    <!-- HUD Cursor & Trail -->
    <canvas id="cursorTrail" width="1920" height="1080"></canvas>
    <div id="cursor">
      <svg class="cursor-arrow" viewBox="0 0 24 24" fill="none">
        <path d="M3 3l7 18 3-7 7-3L3 3z" fill="#121316" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <div class="cursor-pill" id="cursorPill">You</div>
    </div>
    <div id="ripple"></div>
  </div>

  <script>
    // Closed-form damped spring step response: 0 -> 1
    function stepR(tau, {{w, z}}) {{
      if (tau <= 0) return 0;
      if (z >= 1) {{ const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }}
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
    }}

    function clamp(val, min, max) {{
      return Math.max(min, Math.min(max, val));
    }}

    // Multi-target Spring Track
    class Track {{
      constructor(v0) {{
        this.v0 = v0;
        this.cur = v0;
        this.ev = [];
      }}
      to(t, v, sp = {{w: 26, z: 0.82}}) {{
        if (v !== this.cur) {{
          this.ev.push([t, v - this.cur, sp]);
          this.cur = v;
        }}
        return this;
      }}
      at(t) {{
        let v = this.v0;
        for (const [ti, d, sp] of this.ev) {{
          v += d * stepR(t - ti, sp);
        }}
        return v;
      }}
    }}

    // Visibility window with spring-in and quick blur-out
    function vis(t, tin, tout, dOut = 0.12) {{
      const e = stepR(t - tin, {{w: 28, z: 1.0}});
      const x = tout == null ? 0 : clamp((t - tout) / dOut, 0, 1);
      const xo = x * x;
      return {{
        o: clamp(e * (1 - xo), 0, 1),
        b: clamp((1 - e) * 8 + xo * 8, 0, 20),
        dy: (1 - e) * 16 - xo * 12,
        e
      }};
    }}

    // DOM Elements
    const world = document.getElementById('world');
    const shape = document.getElementById('shape');
    const cursor = document.getElementById('cursor');
    const cursorPill = document.getElementById('cursorPill');
    const ripple = document.getElementById('ripple');
    const trailCanvas = document.getElementById('cursorTrail');
    const ctx = trailCanvas.getContext('2d');

    // State Views
    const views = [
      null,
      document.getElementById('view1'),
      document.getElementById('view2'),
      document.getElementById('view3'),
      document.getElementById('view4'),
      document.getElementById('view5'),
      document.getElementById('view6'),
      document.getElementById('view7'),
      document.getElementById('view8'),
      document.getElementById('view9'),
      document.getElementById('view10'),
    ];

    // State Sub-elements
    const radarSweep = document.getElementById('radarSweep');
    const ovUrgency = document.getElementById('ovUrgency');
    const ovWarranty = document.getElementById('ovWarranty');
    const sliderScore = document.getElementById('sliderScore');
    const sliderFill = document.getElementById('sliderFill');
    const sliderThumb = document.getElementById('sliderThumb');
    const casIdx = document.getElementById('casIdx');
    const casTitle = document.getElementById('casTitle');
    const casEvidence = document.getElementById('casEvidence');
    const casQuote = document.getElementById('casQuote');
    const toggleKnob = document.getElementById('toggleKnob');
    const odoD1 = document.getElementById('odoD1');
    const odoD2 = document.getElementById('odoD2');
    const odoD3 = document.getElementById('odoD3');
    const odoD4 = document.getElementById('odoD4');
    const shieldCheck = document.getElementById('shieldCheck');
    const sampleChip = document.getElementById('sampleChip');

    // Build Tracks for Shape: width, height, borderRadius, background
    const T = {{
      // Shape Dimensions
      sW: new Track(560)
        .to(1.85, 320, {{w: 30, z: 0.85}})  // Radar circle
        .to(3.85, 420, {{w: 28, z: 0.82}})  // Phone
        .to(5.85, 660, {{w: 32, z: 0.84}})  // Forensic Flag
        .to(6.85, 700, {{w: 30, z: 0.82}})  // Slider
        .to(8.85, 700, {{w: 32, z: 0.84}})  // Cascade
        .to(10.85, 600, {{w: 30, z: 0.82}}) // Toggle
        .to(12.35, 540, {{w: 28, z: 0.82}}) // Odometer
        .to(13.85, 360, {{w: 32, z: 0.84}}) // Shield
        .to(14.85, 800, {{w: 30, z: 0.82}}), // Wordmark

      sH: new Track(240)
        .to(1.85, 320, {{w: 30, z: 0.85}})  // Radar
        .to(3.85, 840, {{w: 28, z: 0.82}})  // Phone
        .to(5.85, 300, {{w: 32, z: 0.84}})  // Forensic Flag
        .to(6.85, 180, {{w: 30, z: 0.82}})  // Slider
        .to(8.85, 360, {{w: 32, z: 0.84}})  // Cascade
        .to(10.85, 230, {{w: 30, z: 0.82}}) // Toggle
        .to(12.35, 210, {{w: 28, z: 0.82}}) // Odometer
        .to(13.85, 360, {{w: 32, z: 0.84}}) // Shield
        .to(14.85, 440, {{w: 30, z: 0.82}}), // Wordmark

      sR: new Track(28)
        .to(1.85, 160, {{w: 32, z: 0.85}})  // Radar circle
        .to(3.85, 54, {{w: 28, z: 0.82}})   // Phone
        .to(5.85, 24, {{w: 32, z: 0.84}})   // Forensic Flag
        .to(6.85, 28, {{w: 30, z: 0.82}})   // Slider
        .to(8.85, 24, {{w: 32, z: 0.84}})   // Cascade
        .to(10.85, 36, {{w: 30, z: 0.82}})  // Toggle
        .to(12.35, 24, {{w: 28, z: 0.82}})  // Odometer
        .to(13.85, 180, {{w: 32, z: 0.84}}) // Shield circle
        .to(14.85, 32, {{w: 30, z: 0.82}}), // Wordmark

      // Camera Log Zoom and Centers
      camLogZ: new Track(0)
        .to(2.0, 0.12, {{w: 22, z: 1.0}})   // Radar zoom
        .to(4.0, -0.05, {{w: 20, z: 1.0}})  // Phone zoom
        .to(6.0, 0.08, {{w: 22, z: 1.0}})   // Flag zoom
        .to(7.0, 0.0, {{w: 20, z: 1.0}})    // Slider
        .to(11.0, 0.04, {{w: 20, z: 1.0}})  // Toggle
        .to(12.5, 0.1, {{w: 22, z: 1.0}})   // Odometer
        .to(14.0, 0.0, {{w: 20, z: 1.0}}),  // Final Wordmark

      camX: new Track(960),
      camY: new Track(540),

      // Cursor World Position
      curX: new Track(1300)
        .to(0.1, 960, {{w: 22, z: 0.85}})   // Move to sample chip
        .to(1.8, 880, {{w: 24, z: 0.85}})   // Move with radar
        .to(3.8, 960, {{w: 20, z: 0.85}})   // Phone
        .to(5.8, 960, {{w: 24, z: 0.85}})   // Flag
        .to(6.9, 650, {{w: 24, z: 0.85}})   // Slider thumb start
        .to(7.3, 1220, {{w: 28, z: 0.82}})  // Drag slider thumb to 88!
        .to(8.8, 1100, {{w: 22, z: 0.85}})  // Cascade
        .to(10.9, 1080, {{w: 24, z: 0.85}}) // Toggle right
        .to(12.2, 1350, {{w: 18, z: 0.85}}) // Move away for odometer
        .to(14.8, 960, {{w: 22, z: 0.85}}), // Final button hover

      curY: new Track(750)
        .to(0.1, 600, {{w: 22, z: 0.85}})   // Sample chip Y
        .to(1.8, 540, {{w: 24, z: 0.85}})   // Radar
        .to(3.8, 480, {{w: 20, z: 0.85}})   // Phone urgency area
        .to(5.8, 540, {{w: 24, z: 0.85}})   // Flag
        .to(6.9, 540, {{w: 24, z: 0.85}})   // Slider thumb Y
        .to(7.3, 540, {{w: 28, z: 0.82}})   // Dragging slider
        .to(8.8, 500, {{w: 22, z: 0.85}})   // Cascade
        .to(10.9, 540, {{w: 24, z: 0.85}})  // Toggle knob Y
        .to(12.2, 700, {{w: 18, z: 0.85}})  // Out of way
        .to(14.8, 640, {{w: 22, z: 0.85}}), // Wordmark button Y

      // Slider fill & thumb progression (dual springs for stretch)
      slideLeading: new Track(0)
        .to(7.2, 88, {{w: 34, z: 0.85}}),
      slideTrailing: new Track(0)
        .to(7.28, 88, {{w: 22, z: 0.85}}),

      // Toggle knob leading & trailing edge stretch
      tgL: new Track(6).to(11.35, 196, {{w: 24, z: 0.88}}),
      tgR: new Track(190).to(11.30, 374, {{w: 36, z: 0.88}}),
    }};

    // Position helper
    shape.style.left = '960px';
    shape.style.top = '540px';

    // History buffer for smooth cursor trail
    const trailHistory = [];

    // Main Pure Seek Function
    window.seek = function(t) {{
      // 1. Camera Transform
      const z = Math.exp(T.camLogZ.at(t));
      const cx = T.camX.at(t);
      const cy = T.camY.at(t);
      world.style.transform = `translate(960px,540px) scale(${{z}}) translate(${{-cx}}px,${{-cy}}px)`;

      // 2. Shape Dimensions & Morphing
      const w = T.sW.at(t);
      const h = T.sH.at(t);
      const r = T.sR.at(t);
      shape.style.width = `${{w}}px`;
      shape.style.height = `${{h}}px`;
      shape.style.borderRadius = `${{r}}px`;

      // Theme background on shape
      if (t >= 1.95 && t < 3.9) {{
        shape.style.background = '#111827';
      }} else if (t >= 13.9 && t < 14.9) {{
        shape.style.background = '#059669';
      }} else {{
        shape.style.background = '#ffffff';
      }}

      // 3. State Visibilities (Pure blur & slide crossfades)
      const vWindows = [
        null,
        vis(t, 0.0, 1.92),        // 1. Dropzone
        vis(t, 1.92, 3.92),       // 2. Radar
        vis(t, 3.92, 5.92),       // 3. Phone
        vis(t, 5.92, 6.92),       // 4. Forensic Flag
        vis(t, 6.92, 8.92),       // 5. Severity Slider
        vis(t, 8.92, 10.92),      // 6. Cascade
        vis(t, 10.92, 12.42),     // 7. Toggle
        vis(t, 12.42, 13.92),     // 8. Odometer
        vis(t, 13.92, 14.92),     // 9. Shield
        vis(t, 14.92, 16.0),      // 10. Wordmark
      ];

      for (let i = 1; i <= 10; i++) {{
        const v = vWindows[i];
        const el = views[i];
        if (v.o > 0.001) {{
          el.style.opacity = v.o;
          el.style.filter = v.b > 0.05 ? `blur(${{v.b}}px)` : 'none';
          el.style.transform = `translateY(${{v.dy}}px)`;
          el.style.pointerEvents = 'auto';
        }} else {{
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }}
      }}

      // State Specific Animations
      // 2. Radar Sweep
      if (t >= 1.9 && t <= 4.0) {{
        const sweepAngle = (t - 1.9) * 540;
        radarSweep.style.transform = `rotate(${{sweepAngle}}deg)`;
      }}

      // 3. Phone screen highlights
      if (t >= 4.4 && t <= 5.92) {{
        const hlAlpha = Math.sin((t - 4.4) * 8) * 0.3 + 0.7;
        ovUrgency.style.opacity = hlAlpha;
        ovWarranty.style.opacity = hlAlpha * 0.7;
      }} else {{
        ovUrgency.style.opacity = '0';
        ovWarranty.style.opacity = '0';
      }}

      // 5. Slider Stretch & Score
      if (t >= 6.9 && t <= 8.92) {{
        const sLead = T.slideLeading.at(t);
        const sTrail = T.slideTrailing.at(t);
        const curScore = Math.round(sLead);
        sliderScore.textContent = `${{curScore}} / 100`;
        const pctLead = clamp(sLead, 0, 100);
        const pctTrail = clamp(sTrail, 0, 100);
        sliderFill.style.width = `${{pctLead}}%`;
        sliderThumb.style.left = `${{pctTrail}}%`;
      }}

      // 6. Tactics Cascade Rapid 8th Note Blur Swaps
      if (t >= 8.92 && t <= 10.92) {{
        if (t < 9.6) {{
          casIdx.textContent = '1';
          casTitle.textContent = 'False Urgency';
          casEvidence.textContent = '"Only 2 left in stock — Sale ends in 02:14:33"';
          casQuote.textContent = '"Buy right now before you realize you do not need it."';
        }} else if (t < 10.3) {{
          casIdx.textContent = '2';
          casTitle.textContent = 'Preselection';
          casEvidence.textContent = '"Add 2-Year Extended Care Warranty (+$9.95/mo)"';
          casQuote.textContent = '"Silently auto-checks an extra $9.95/mo recurring subscription."';
        }} else {{
          casIdx.textContent = '3';
          casTitle.textContent = 'Confirmshaming';
          casEvidence.textContent = '"No thanks, I will pay full price for future repairs"';
          casQuote.textContent = '"Either buy our warranty or admit you make reckless life choices."';
        }}
      }}

      // 7. Toggle Stretch & Knob position
      if (t >= 10.92 && t <= 12.42) {{
        const tL = T.tgL.at(t);
        const tR = T.tgR.at(t);
        toggleKnob.style.left = `${{tL}}px`;
        toggleKnob.style.width = `${{Math.max(48, tR - tL)}}px`;
      }}

      // 8. Odometer digits translation down from 59.94 to 29.99
      if (t >= 12.42 && t <= 13.92) {{
        const oProg = stepR(t - 12.6, {{w: 24, z: 0.88}});
        // 5 -> 2
        odoD1.style.transform = `translateY(${{-oProg * 64 * 3}}px)`;
        // 9 -> 9
        odoD2.style.transform = `translateY(${{-oProg * 64 * 3}}px)`;
        // .9 -> .9
        odoD3.style.transform = `translateY(${{-oProg * 64 * 2}}px)`;
        // 4 -> 9
        odoD4.style.transform = `translateY(${{-oProg * 64 * 2}}px)`;
      }}

      // 9. Shield Checkmark Draw
      if (t >= 13.92 && t <= 14.92) {{
        const cProg = stepR(t - 14.05, {{w: 26, z: 1.0}});
        shieldCheck.style.strokeDashoffset = `${{30 * (1 - cProg)}}`;
      }}

      // 4. Cursor Position, Lean & Click Scale
      const cX = T.curX.at(t);
      const cY = T.curY.at(t);
      // Measure speed by small delta
      const dt = 0.016;
      const vx = (T.curX.at(t + dt) - cX) / dt;
      const vy = (T.curY.at(t + dt) - cY) / dt;
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Lean angle
      const lean = clamp(-vx * 0.0045, -14, 14);

      // Clicks at specific events:
      // t = 0.80 (User clicks specimen chip)
      // t = 11.45 (Toggle click)
      // t = 15.00 (Wordmark button)
      let clickScale = 1.0;
      let ripAlpha = 0;
      let ripScale = 0;
      for (const tc of [0.80, 11.45, 15.00]) {{
        const dtC = t - tc;
        if (dtC >= -0.05 && dtC <= 0.4) {{
          clickScale = 1.0 - 0.22 * Math.exp(-Math.pow(dtC / 0.045, 2));
          if (dtC >= 0) {{
            ripScale = clamp(dtC / 0.35, 0, 1) * 2.2;
            ripAlpha = clamp(1.0 - dtC / 0.35, 0, 1);
            ripple.style.left = `${{cX}}px`;
            ripple.style.top = `${{cY}}px`;
            ripple.style.transform = `translate(-50%, -50%) scale(${{ripScale}})`;
            ripple.style.opacity = ripAlpha;
          }}
        }}
      }}
      if (ripAlpha <= 0) {{
        ripple.style.opacity = '0';
      }}

      cursor.style.left = `${{cX}}px`;
      cursor.style.top = `${{cY}}px`;
      cursor.style.transform = `translate(-4px, -4px) rotate(${{lean}}deg) scale(${{clickScale}})`;

      // Cursor Name Pill
      if (t < 2.0) {{
        cursorPill.textContent = 'You';
        cursorPill.style.background = '#121316';
      }} else if (t < 14.0) {{
        cursorPill.textContent = 'Audit AI';
        cursorPill.style.background = '#d32f2f';
      }} else {{
        cursorPill.textContent = 'Verified';
        cursorPill.style.background = '#059669';
      }}

      // Cursor Trail Rendering
      ctx.clearRect(0, 0, 1920, 1080);
      trailHistory.push({{t, x: cX, y: cY, speed}});
      while (trailHistory.length > 22) trailHistory.shift();

      if (trailHistory.length > 2 && speed > 250) {{
        ctx.beginPath();
        for (let i = 0; i < trailHistory.length; i++) {{
          const p = trailHistory[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }}
        ctx.strokeStyle = t < 2.0 ? 'rgba(18, 19, 22, 0.25)' : 'rgba(211, 47, 47, 0.3)';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }}
    }};

    // Initialize at t = 0
    seek(0);
  </script>
</body>
</html>
"""

output_path = "/Users/riddhidumre/Desktop/Brain Dump/Week chalenge/dark patterns/launch-prod/index.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated {output_path} successfully ({len(html_content)} bytes)")
