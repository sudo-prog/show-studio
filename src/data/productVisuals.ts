/**
 * High-fidelity multi-view product graphic generator.
 * Produces crisp studio-cutout SVG data URIs for all 4 categories:
 * - Garments on wooden hangers with chrome hooks (Front, Side, Back)
 * - Shoes (Outer side toe right, Inner side toe left, Front toe, Back heel)
 * - Crossbody bags hanging from strap apex & standing bags/cubbies (Front, Side, Back)
 * - Caps & bucket hats angled naturally for pegboard hooks (Front, Side, Back)
 */

function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim().replace(/\s+/g, ' '))}`;
}

// -------------------------------------------------------------
// 1. GARMENTS (Hanging on wooden hanger with chrome hook)
// -------------------------------------------------------------
export function createGarmentSvg(
  type: 'puffer' | 'hoodie' | 'crewneck' | 'coach' | 'windbreaker' | 'halfzip' | 'rugby' | 'vest' | 'overshirt' | 'running',
  view: 'front' | 'side' | 'back',
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): string {
  const width = view === 'side' ? 240 : 640;
  const height = 800;

  if (view === 'side') {
    // Ultra-thin flat store hanger profile as required by PDF page 7 & 11
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 800" width="240" height="800">
        <defs>
          <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#9ca3af"/>
            <stop offset="40%" stop-color="#f3f4f6"/>
            <stop offset="70%" stop-color="#d1d5db"/>
            <stop offset="100%" stop-color="#6b7280"/>
          </linearGradient>
          <linearGradient id="hangerWood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#d4b996"/>
            <stop offset="100%" stop-color="#9c784f"/>
          </linearGradient>
          <linearGradient id="fabricSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${primaryColor}"/>
            <stop offset="100%" stop-color="${secondaryColor}"/>
          </linearGradient>
        </defs>
        <!-- Chrome hook -->
        <path d="M 120 18 C 105 18 96 32 98 48 C 100 62 112 70 120 86 L 120 108" fill="none" stroke="url(#chrome)" stroke-width="6" stroke-linecap="round"/>
        <!-- Wooden hanger end profile -->
        <ellipse cx="120" cy="115" rx="14" ry="8" fill="url(#hangerWood)"/>
        <!-- Sleek flat draped fabric body -->
        <path d="M 112 115 C 104 180 100 400 98 760 C 108 765 132 765 142 760 C 140 400 136 180 128 115 Z" fill="url(#fabricSide)"/>
        <!-- Side sleeve drape fold -->
        <path d="M 110 160 C 92 280 88 450 86 640 C 94 646 112 646 122 642 C 124 450 128 280 124 160 Z" fill="${primaryColor}" opacity="0.85"/>
        <path d="M 104 170 L 104 635" stroke="rgba(0,0,0,0.18)" stroke-width="3" stroke-linecap="round"/>
        <!-- Hem seam -->
        <path d="M 98 750 Q 120 758 142 750" stroke="rgba(0,0,0,0.22)" stroke-width="2" fill="none"/>
      </svg>
    `);
  }

  // Front and Back views
  const isBack = view === 'back';
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800" width="640" height="800">
      <defs>
        <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#9ca3af"/>
          <stop offset="40%" stop-color="#ffffff"/>
          <stop offset="70%" stop-color="#d1d5db"/>
          <stop offset="100%" stop-color="#6b7280"/>
        </linearGradient>
        <linearGradient id="hangerWood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#b58c5c"/>
          <stop offset="50%" stop-color="#e8cfac"/>
          <stop offset="100%" stop-color="#a67746"/>
        </linearGradient>
        <linearGradient id="garmentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${primaryColor}"/>
          <stop offset="85%" stop-color="${primaryColor}"/>
          <stop offset="100%" stop-color="${secondaryColor}"/>
        </linearGradient>
        <filter id="subtleShade" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Chrome Hanger Hook -->
      <path d="M 320 20 C 298 20 284 38 286 58 C 288 76 306 88 320 106 L 320 128" fill="none" stroke="url(#chrome)" stroke-width="7" stroke-linecap="round"/>
      
      <!-- Wooden Hanger Bar -->
      <path d="M 120 170 Q 320 122 520 170 Q 528 178 518 184 Q 320 138 122 184 Q 112 178 120 170 Z" fill="url(#hangerWood)" filter="url(#subtleShade)"/>
      <circle cx="320" cy="132" r="6" fill="#78532c"/>

      <!-- Garment Body Silhouette -->
      <g filter="url(#subtleShade)">
        <!-- Sleeves -->
        <path d="M 175 165 C 130 220 70 380 50 610 C 65 625 105 628 122 615 C 145 420 190 270 215 220 Z" fill="${secondaryColor}"/>
        <path d="M 465 165 C 510 220 570 380 590 610 C 575 625 535 628 518 615 C 495 420 450 270 425 220 Z" fill="${secondaryColor}"/>
        
        <!-- Main Torso -->
        <path d="M 215 168 Q 320 178 425 168 C 455 240 450 440 446 750 C 370 758 270 758 194 750 C 190 440 185 240 215 168 Z" fill="url(#garmentGrad)"/>

        <!-- Neckline / Collar -->
        ${
          isBack
            ? `<path d="M 260 172 Q 320 184 380 172 Q 320 162 260 172 Z" fill="${secondaryColor}" stroke="rgba(0,0,0,0.15)"/>`
            : `<path d="M 255 170 Q 320 228 385 170 Q 320 180 255 170 Z" fill="#222" opacity="0.75"/>
               <path d="M 255 170 Q 320 230 385 170" fill="none" stroke="${secondaryColor}" stroke-width="12" stroke-linecap="round"/>`
        }

        <!-- Type-specific styling details -->
        ${
          type === 'puffer'
            ? `<!-- Baffle quilting lines -->
               <line x1="198" y1="280" x2="442" y2="280" stroke="rgba(0,0,0,0.2)" stroke-width="4"/>
               <line x1="195" y1="390" x2="445" y2="390" stroke="rgba(0,0,0,0.2)" stroke-width="4"/>
               <line x1="194" y1="500" x2="446" y2="500" stroke="rgba(0,0,0,0.2)" stroke-width="4"/>
               <line x1="194" y1="610" x2="446" y2="610" stroke="rgba(0,0,0,0.2)" stroke-width="4"/>
               <line x1="194" y1="710" x2="446" y2="710" stroke="rgba(0,0,0,0.2)" stroke-width="3"/>
               ${!isBack ? '<line x1="320" y1="215" x2="320" y2="750" stroke="rgba(0,0,0,0.3)" stroke-width="4"/>' : ''}
              `
            : type === 'hoodie'
            ? `<!-- Hoodie pocket and drawcords -->
               ${!isBack ? `
                 <path d="M 230 520 L 410 520 L 430 690 L 210 690 Z" fill="${secondaryColor}" opacity="0.6"/>
                 <line x1="290" y1="220" x2="285" y2="340" stroke="#f3f4f6" stroke-width="4" stroke-linecap="round"/>
                 <line x1="350" y1="220" x2="355" y2="340" stroke="#f3f4f6" stroke-width="4" stroke-linecap="round"/>
               ` : ''}
              `
            : type === 'coach' || type === 'overshirt'
            ? `<!-- Snap buttons / zipper -->
               ${!isBack ? `
                 <line x1="320" y1="200" x2="320" y2="745" stroke="rgba(0,0,0,0.18)" stroke-width="3"/>
                 <circle cx="320" cy="270" r="5" fill="#e5e7eb" stroke="#374151" stroke-width="1.5"/>
                 <circle cx="320" cy="360" r="5" fill="#e5e7eb" stroke="#374151" stroke-width="1.5"/>
                 <circle cx="320" cy="450" r="5" fill="#e5e7eb" stroke="#374151" stroke-width="1.5"/>
                 <circle cx="320" cy="540" r="5" fill="#e5e7eb" stroke="#374151" stroke-width="1.5"/>
                 <circle cx="320" cy="630" r="5" fill="#e5e7eb" stroke="#374151" stroke-width="1.5"/>
                 <!-- Chest pocket -->
                 <rect x="235" y="270" width="70" height="85" rx="3" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
               ` : ''}
              `
            : `<!-- Subtle fabric creases & seams -->
               <path d="M 270 250 Q 300 360 260 520" stroke="rgba(255,255,255,0.08)" stroke-width="3" fill="none"/>
               <path d="M 370 250 Q 340 360 380 520" stroke="rgba(0,0,0,0.12)" stroke-width="3" fill="none"/>
               ${!isBack ? `<circle cx="265" cy="275" r="4" fill="${accentColor}"/>` : ''}
              `
        }

        <!-- Bottom Rib / Hem -->
        <path d="M 194 720 Q 320 732 446 720 L 446 750 Q 320 762 194 750 Z" fill="${secondaryColor}"/>
        <!-- Cuff Ribs -->
        <path d="M 50 595 L 122 600 L 120 622 L 48 617 Z" fill="${secondaryColor}"/>
        <path d="M 590 595 L 518 600 L 520 622 L 592 617 Z" fill="${secondaryColor}"/>
      </g>
    </svg>
  `);
}

// -------------------------------------------------------------
// 2. SHOES (Outer, Inner, Toe, Heel)
// -------------------------------------------------------------
export function createShoeSvg(
  view: 'outer' | 'inner' | 'toe' | 'heel',
  upperColor: string,
  soleColor: string,
  accentColor: string,
  detailType: 'classic' | 'high' | 'runner' | 'trail'
): string {
  if (view === 'toe') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 400" width="340" height="400">
        <defs>
          <linearGradient id="soleG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="${soleColor}"/>
          </linearGradient>
        </defs>
        <!-- Outsole base -->
        <ellipse cx="170" cy="360" rx="110" ry="24" fill="${soleColor}"/>
        <path d="M 65 350 Q 170 335 275 350 L 270 375 Q 170 388 70 375 Z" fill="url(#soleG)"/>
        <!-- Upper front toe box -->
        <path d="M 85 348 C 80 250 110 180 170 180 C 230 180 260 250 255 348 Z" fill="${upperColor}"/>
        <!-- Toe cap overlay -->
        <path d="M 95 345 C 100 290 130 260 170 260 C 210 260 240 290 245 345 Z" fill="${accentColor}" opacity="0.9"/>
        <!-- Eyestay & Laces -->
        <path d="M 145 180 L 195 180 L 190 270 L 150 270 Z" fill="#2d3748" opacity="0.3"/>
        <line x1="152" y1="195" x2="188" y2="195" stroke="#f3f4f6" stroke-width="4" stroke-linecap="round"/>
        <line x1="150" y1="215" x2="190" y2="215" stroke="#f3f4f6" stroke-width="4" stroke-linecap="round"/>
        <line x1="148" y1="235" x2="192" y2="235" stroke="#f3f4f6" stroke-width="4" stroke-linecap="round"/>
        <line x1="150" y1="255" x2="190" y2="255" stroke="#f3f4f6" stroke-width="4" stroke-linecap="round"/>
        <!-- Tongue top -->
        <path d="M 152 180 Q 170 160 188 180 Z" fill="${upperColor}"/>
      </svg>
    `);
  }

  if (view === 'heel') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 400" width="340" height="400">
        <!-- Outsole rear -->
        <ellipse cx="170" cy="360" rx="95" ry="22" fill="${soleColor}"/>
        <path d="M 75 345 Q 170 338 265 345 L 260 375 Q 170 385 80 375 Z" fill="${soleColor}"/>
        <!-- Heel cup -->
        <path d="M 95 345 C 90 230 115 160 170 160 C 225 160 250 230 245 345 Z" fill="${upperColor}"/>
        <!-- Heel tab strip -->
        <rect x="160" y="145" width="20" height="150" rx="5" fill="${accentColor}"/>
        <!-- Collar opening -->
        <ellipse cx="170" cy="165" rx="42" ry="16" fill="#1f2937"/>
      </svg>
    `);
  }

  // Side view (Outer: toe right; Inner: toe left)
  const isOuter = view === 'outer';
  const flip = isOuter ? 1 : -1;
  const cx = 350;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 420" width="700" height="420">
      <defs>
        <linearGradient id="soleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="${soleColor}"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
        <filter id="shoeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" flood-opacity="0.15"/>
        </filter>
      </defs>

      <g transform="${!isOuter ? 'translate(700, 0) scale(-1, 1)' : ''}" filter="url(#shoeShadow)">
        <!-- Chunky / Sculpted Midsole & Outsole -->
        <path d="M 130 330 C 240 335 340 338 430 315 C 510 295 620 310 635 340 C 620 370 560 375 420 375 C 260 375 140 370 120 345 Z" fill="url(#soleGrad)"/>
        <!-- Tread accents -->
        <path d="M 140 365 L 610 365" stroke="rgba(0,0,0,0.4)" stroke-width="4" stroke-dasharray="14 8"/>

        <!-- Main Upper -->
        <path d="M 135 330 C 130 260 150 170 230 160 C 275 155 310 200 370 210 C 440 220 530 255 615 310 C 625 325 610 335 590 335 C 500 325 430 312 360 318 C 260 325 180 335 135 330 Z" fill="${upperColor}"/>

        <!-- Overlay panels / swoosh-like dynamic wave -->
        <path d="M 230 165 C 290 195 380 230 490 245 C 440 270 330 280 260 245 Z" fill="${accentColor}" opacity="0.95"/>

        <!-- Laces & Eyestay -->
        <path d="M 330 205 L 440 235 L 430 250 L 320 220 Z" fill="#374151" opacity="0.4"/>
        <line x1="340" y1="210" x2="355" y2="225" stroke="#f9fafb" stroke-width="4" stroke-linecap="round"/>
        <line x1="365" y1="215" x2="380" y2="230" stroke="#f9fafb" stroke-width="4" stroke-linecap="round"/>
        <line x1="390" y1="220" x2="405" y2="235" stroke="#f9fafb" stroke-width="4" stroke-linecap="round"/>
        <line x1="415" y1="228" x2="430" y2="242" stroke="#f9fafb" stroke-width="4" stroke-linecap="round"/>

        <!-- Padded Collar -->
        <path d="M 185 180 C 210 165 240 165 255 195 C 235 205 200 205 185 180 Z" fill="#1f2937"/>
        <!-- Mudguard contour -->
        <path d="M 450 310 Q 560 280 610 315" stroke="rgba(0,0,0,0.2)" stroke-width="3" fill="none"/>
      </g>
    </svg>
  `);
}

// -------------------------------------------------------------
// 3. BAGS (Crossbody hanging by strap vs standing cubby bags)
// -------------------------------------------------------------
export function createBagSvg(
  type: 'crossbody' | 'backpack' | 'duffel' | 'waistpack',
  view: 'front' | 'side' | 'back',
  primaryColor: string,
  secondaryColor: string,
  strapColor: string
): string {
  if (type === 'crossbody') {
    // Crossbody hangs from wall hook: strap rises to top apex (V shape)
    const isSide = view === 'side';
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 700" width="400" height="700">
        <defs>
          <linearGradient id="bagG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${primaryColor}"/>
            <stop offset="100%" stop-color="${secondaryColor}"/>
          </linearGradient>
        </defs>
        <!-- Strap V meeting at apex (200, 20) -->
        ${
          isSide
            ? `<path d="M 200 20 L 195 460 L 210 460 L 205 20 Z" fill="${strapColor}"/>`
            : `<path d="M 200 20 L 120 460 L 136 460 L 200 35 L 264 460 L 280 460 Z" fill="${strapColor}"/>
               <circle cx="200" cy="20" r="5" fill="#9ca3af"/>`
        }
        <!-- Bag Pouch at bottom -->
        ${
          isSide
            ? `<rect x="160" y="450" width="85" height="190" rx="16" fill="url(#bagG)"/>
               <line x1="165" y1="520" x2="240" y2="520" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
              `
            : `<rect x="100" y="440" width="200" height="210" rx="24" fill="url(#bagG)"/>
               <!-- Front zipper pocket -->
               <rect x="120" y="480" width="160" height="110" rx="12" fill="${secondaryColor}" stroke="rgba(0,0,0,0.15)"/>
               <line x1="130" y1="500" x2="270" y2="500" stroke="#1f2937" stroke-width="3"/>
               <circle cx="140" cy="500" r="4" fill="#d1d5db"/>
               <!-- Logo badge -->
               <rect x="180" y="540" width="40" height="16" rx="3" fill="#111827"/>
              `
        }
      </svg>
    `);
  }

  // Standing Bags (Backpack, Duffel, Waistpack)
  const isDuffel = type === 'duffel';
  const isBackpack = type === 'backpack';
  const width = isDuffel ? 640 : 440;
  const height = isDuffel ? 380 : 560;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="standG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${primaryColor}"/>
          <stop offset="100%" stop-color="${secondaryColor}"/>
        </linearGradient>
      </defs>
      ${
        isDuffel
          ? `<!-- Cylindrical duffel shape -->
             <rect x="60" y="100" width="520" height="240" rx="70" fill="url(#standG)"/>
             <!-- Webbing handles -->
             <path d="M 210 100 C 210 30 430 30 430 100" fill="none" stroke="${strapColor}" stroke-width="22" stroke-linecap="round"/>
             <line x1="210" y1="100" x2="210" y2="340" stroke="${strapColor}" stroke-width="22"/>
             <line x1="430" y1="100" x2="430" y2="340" stroke="${strapColor}" stroke-width="22"/>
             <line x1="120" y1="160" x2="520" y2="160" stroke="#111827" stroke-width="4"/>
            `
          : isBackpack
          ? `<!-- Upright backpack silhouette -->
             <path d="M 120 180 C 120 70 320 70 320 180 L 350 490 C 350 515 325 525 300 525 L 140 525 C 115 525 90 515 90 490 Z" fill="url(#standG)"/>
             <!-- Top carry handle -->
             <path d="M 180 80 Q 220 30 260 80" fill="none" stroke="${strapColor}" stroke-width="12" stroke-linecap="round"/>
             <!-- Front stash compartment -->
             <rect x="130" y="270" width="180" height="190" rx="18" fill="${secondaryColor}" stroke="rgba(0,0,0,0.15)"/>
             <line x1="145" y1="310" x2="295" y2="310" stroke="#111827" stroke-width="3"/>
            `
          : `<!-- Waistpack / Sling -->
             <rect x="80" y="140" width="280" height="160" rx="35" fill="url(#standG)"/>
             <line x1="110" y1="190" x2="330" y2="190" stroke="#111" stroke-width="4"/>
             <circle cx="130" cy="190" r="5" fill="#e5e7eb"/>
            `
      }
    </svg>
  `);
}

// -------------------------------------------------------------
// 4. CAPS & HATS (Camera looking slightly down at 20 deg)
// -------------------------------------------------------------
export function createCapSvg(
  type: 'cap' | 'buckethat',
  view: 'front' | 'side' | 'back',
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): string {
  if (type === 'buckethat') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 340" width="460" height="340">
        <defs>
          <linearGradient id="bucketG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${primaryColor}"/>
            <stop offset="100%" stop-color="${secondaryColor}"/>
          </linearGradient>
        </defs>
        <!-- Sloping flared brim -->
        <path d="M 40 250 C 90 285 370 285 420 250 L 360 170 C 310 160 150 160 100 170 Z" fill="${secondaryColor}"/>
        <!-- Top Crown -->
        <path d="M 120 170 C 130 90 330 90 340 170 Z" fill="url(#bucketG)"/>
        <!-- Flat top crown ellipse -->
        <ellipse cx="230" cy="100" rx="95" ry="32" fill="${primaryColor}"/>
        <!-- Seam ring -->
        <path d="M 100 170 Q 230 195 360 170" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="3"/>
      </svg>
    `);
  }

  // Baseball Cap (Front, Side with brim to left, Back with strap)
  if (view === 'side') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 300" width="460" height="300">
        <defs>
          <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${primaryColor}"/>
            <stop offset="100%" stop-color="${secondaryColor}"/>
          </linearGradient>
        </defs>
        <!-- Curved Visor / Brim pointing to left -->
        <path d="M 30 220 C 100 200 180 200 220 205 C 190 225 100 235 30 220 Z" fill="${secondaryColor}"/>
        <!-- 6-panel crown profile -->
        <path d="M 170 205 C 175 90 360 90 375 205 C 310 215 220 215 170 205 Z" fill="url(#capGrad)"/>
        <!-- Top Squatchee button -->
        <circle cx="270" cy="98" r="8" fill="${accentColor}"/>
        <!-- Eyelet stitch -->
        <circle cx="245" cy="140" r="4" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
        <circle cx="310" cy="140" r="4" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
      </svg>
    `);
  }

  if (view === 'back') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 300" width="380" height="300">
        <!-- Back dome -->
        <path d="M 60 200 C 65 80 315 80 320 200 C 270 205 110 205 60 200 Z" fill="${primaryColor}"/>
        <!-- Top button -->
        <circle cx="190" cy="95" r="8" fill="${accentColor}"/>
        <!-- Keyhole cutout & adjustable strap -->
        <path d="M 140 200 C 145 160 235 160 240 200 Z" fill="#2d3748" opacity="0.3"/>
        <rect x="135" y="195" width="110" height="16" rx="4" fill="${secondaryColor}" stroke="#1f2937" stroke-width="2"/>
        <!-- Metal buckle closure -->
        <rect x="220" y="193" width="14" height="20" rx="2" fill="#d1d5db"/>
      </svg>
    `);
  }

  // Front View
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 300" width="380" height="300">
      <!-- Curved Brim facing viewer -->
      <path d="M 45 225 C 100 200 280 200 335 225 C 270 250 110 250 45 225 Z" fill="${secondaryColor}"/>
      <!-- Structured Crown -->
      <path d="M 70 210 C 75 80 305 80 310 210 C 240 218 140 218 70 210 Z" fill="${primaryColor}"/>
      <!-- Centre panel seam -->
      <line x1="190" y1="95" x2="190" y2="212" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
      <!-- Top squatchee button -->
      <circle cx="190" cy="95" r="8" fill="${accentColor}"/>
      <!-- Front brand badge or embroidered crest -->
      <rect x="160" y="145" width="60" height="32" rx="6" fill="${accentColor}" opacity="0.95"/>
      <circle cx="190" cy="161" r="7" fill="${primaryColor}"/>
    </svg>
  `);
}
