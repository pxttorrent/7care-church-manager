import React from 'react';

interface MountIconProps {
  iconType: string;
  className?: string;
}

export function MountIcon({ iconType, className = "w-6 h-6" }: MountIconProps) {
  const baseClasses = `${className} text-gray-700`;
  
  switch (iconType) {
    case 'valley':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Vale do Jordão - 0+ pts - Batismo Detalhado */}
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#87ceeb', stopOpacity: 0.8}}/>
              <stop offset="50%" style={{stopColor: '#4682b4', stopOpacity: 0.6}}/>
              <stop offset="100%" style={{stopColor: '#1e90ff', stopOpacity: 0.4}}/>
            </linearGradient>
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f4a460', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#daa520', stopOpacity: 0.7}}/>
            </linearGradient>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#87ceeb', stopOpacity: 0.6}}/>
              <stop offset="100%" style={{stopColor: '#b0e0e6', stopOpacity: 0.4}}/>
            </linearGradient>
            <filter id="gentleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.15"/>
            </filter>
          </defs>
          
          {/* Céu sutil */}
          <rect x="0" y="0" width="24" height="24" fill="url(#skyGradient)"/>
          
          {/* Margem do rio com vegetação */}
          <path d="M2 20 Q6 18 12 19 Q18 18 22 20 L22 24 L2 24 Z" fill="url(#sandGradient)"/>
          <path d="M3 19.5 Q7 17.5 12 18.5 Q17 17.5 21 19.5" fill="#90ee90" opacity="0.6"/>
          <path d="M4 19.8 Q8 17.8 12 18.8 Q16 17.8 20 19.8" fill="#32cd32" opacity="0.4"/>
          
          {/* Águas do Jordão com ondulações detalhadas */}
          <path d="M4 20 Q8 18 12 19 Q16 18 20 20" 
                stroke="url(#waterGradient)" 
                strokeWidth="2" 
                fill="none" 
                className="river-main"/>
          
          <path d="M5 19.5 Q9 17.5 12 18.5 Q15 17.5 19 19.5" 
                stroke="url(#waterGradient)" 
                strokeWidth="1.5" 
                fill="none" 
                className="river-secondary"
                opacity="0.7"/>
          
          <path d="M6 19 Q10 17 12 18 Q14 17 18 19" 
                stroke="url(#waterGradient)" 
                strokeWidth="1" 
                fill="none" 
                className="river-tertiary"
                opacity="0.5"/>
          
          {/* João Batista - Detalhado */}
          {/* Cabeça de João */}
          <circle cx="15" cy="10" r="1.3" fill="#8b4513" className="joao-head"/>
          
          {/* Cabelo de João */}
          <path d="M13.5 8.5 Q15 8 16.5 8.5" stroke="#654321" strokeWidth="0.8" fill="none" className="joao-hair"/>
          <path d="M13.7 8.7 Q15 8.2 16.3 8.7" stroke="#8b4513" strokeWidth="0.6" fill="none" className="joao-hair"/>
          
          {/* Rosto de João */}
          <circle cx="14.7" cy="9.8" r="0.25" fill="#ffffff" className="joao-eye"/>
          <circle cx="15.3" cy="9.8" r="0.25" fill="#ffffff" className="joao-eye"/>
          <circle cx="14.7" cy="9.8" r="0.12" fill="#000000" className="joao-pupil"/>
          <circle cx="15.3" cy="9.8" r="0.12" fill="#000000" className="joao-pupil"/>
          
          {/* Barba de João */}
          <path d="M14.2 10.2 Q15 11.2 15.8 10.2" stroke="#654321" strokeWidth="0.6" fill="none" className="joao-beard"/>
          <path d="M14.3 10.4 Q15 11.4 15.7 10.4" stroke="#8b4513" strokeWidth="0.4" fill="none" className="joao-beard"/>
          
          {/* Corpo de João com vestes detalhadas */}
          <path d="M14.5 11.2 L15.5 11.2 L15.5 17 L14.5 17 Z" fill="#daa520" className="joao-body"/>
          <path d="M14.3 11 L15.7 11 L15.7 11.4 L14.3 11.4 Z" fill="#b8860b" className="joao-collar"/>
          <path d="M14.2 11.2 L15.8 11.2 L15.8 12 L14.2 12 Z" fill="#cd853f" className="joao-vest"/>
          <path d="M14.1 12 L15.9 12 L15.9 17.2 L14.1 17.2 Z" fill="#daa520" className="joao-robe"/>
          
          {/* Cinto de João */}
          <path d="M14 13 L16 13 L16 13.5 L14 13.5 Z" fill="#8b4513" className="joao-belt"/>
          
          {/* Braços de João */}
          <path d="M13.5 11.5 L16.5 11.5 L16.5 12.5 L13.5 12.5 Z" fill="#daa520" className="joao-arms"/>
          <path d="M13.3 11.3 L16.7 11.3 L16.7 11.7 L13.3 11.7 Z" fill="#cd853f" className="joao-sleeves"/>
          
          {/* Mãos de João - Gestual do batismo */}
          <ellipse cx="13.2" cy="12" rx="0.5" ry="0.4" fill="#f4a460" className="joao-hand-left"/>
          <ellipse cx="16.8" cy="12" rx="0.5" ry="0.4" fill="#f4a460" className="joao-hand-right"/>
          
          {/* Jesus - Detalhado */}
          {/* Cabeça de Jesus */}
          <circle cx="9" cy="10" r="1.3" fill="#f4a460" className="jesus-head"/>
          
          {/* Cabelo de Jesus */}
          <path d="M7.5 8.5 Q9 8 10.5 8.5" stroke="#d2691e" strokeWidth="0.8" fill="none" className="jesus-hair"/>
          <path d="M7.7 8.7 Q9 8.2 10.3 8.7" stroke="#cd853f" strokeWidth="0.6" fill="none" className="jesus-hair"/>
          
          {/* Rosto de Jesus */}
          <circle cx="8.7" cy="9.8" r="0.25" fill="#ffffff" className="jesus-eye"/>
          <circle cx="9.3" cy="9.8" r="0.25" fill="#ffffff" className="jesus-eye"/>
          <circle cx="8.7" cy="9.8" r="0.12" fill="#000000" className="jesus-pupil"/>
          <circle cx="9.3" cy="9.8" r="0.12" fill="#000000" className="jesus-pupil"/>
          
          {/* Barba de Jesus */}
          <path d="M8.2 10.2 Q9 11.2 9.8 10.2" stroke="#d2691e" strokeWidth="0.6" fill="none" className="jesus-beard"/>
          <path d="M8.3 10.4 Q9 11.4 9.7 10.4" stroke="#cd853f" strokeWidth="0.4" fill="none" className="jesus-beard"/>
          
          {/* Corpo de Jesus com vestes brancas detalhadas */}
          <path d="M8.5 11.2 L9.5 11.2 L9.5 17 L8.5 17 Z" fill="#ffffff" className="jesus-body"/>
          <path d="M8.3 11 L9.7 11 L9.7 11.4 L8.3 11.4 Z" fill="#f5f5dc" className="jesus-collar"/>
          <path d="M8.2 11.2 L9.8 11.2 L9.8 12 L8.2 12 Z" fill="#faf0e6" className="jesus-vest"/>
          <path d="M8.1 12 L9.9 12 L9.9 17.2 L8.1 17.2 Z" fill="#ffffff" className="jesus-robe"/>
          
          {/* Braços de Jesus */}
          <path d="M7.5 11.5 L10.5 11.5 L10.5 12.5 L7.5 12.5 Z" fill="#ffffff" className="jesus-arms"/>
          <path d="M7.3 11.3 L10.7 11.3 L10.7 11.7 L7.3 11.7 Z" fill="#faf0e6" className="jesus-sleeves"/>
          
          {/* Mãos de Jesus */}
          <ellipse cx="7.2" cy="12" rx="0.5" ry="0.4" fill="#f4a460" className="jesus-hands"/>
          <ellipse cx="10.8" cy="12" rx="0.5" ry="0.4" fill="#f4a460" className="jesus-hands"/>
          
          {/* Águas do batismo com ondulações detalhadas */}
          <path d="M11 15 Q12 15.8 13 15" 
                stroke="#3b82f6" 
                strokeWidth="1.2" 
                fill="none" 
                className="baptism-waves-main"
                opacity="0.8"/>
          
          <path d="M10.5 15.5 Q12 16.3 13.5 15.5" 
                stroke="#1d4ed8" 
                strokeWidth="1" 
                fill="none" 
                className="baptism-waves-secondary"
                opacity="0.6"/>
          
          <path d="M10 16 Q12 16.8 14 16" 
                stroke="#1e40af" 
                strokeWidth="0.8" 
                fill="none" 
                className="baptism-waves-tertiary"
                opacity="0.4"/>
          
          {/* Ondulações ao redor das pernas */}
          <path d="M8 16.5 Q8.5 17 9 16.5" stroke="#3b82f6" strokeWidth="0.6" fill="none" className="leg-ripples" opacity="0.5"/>
          <path d="M15 16.5 Q15.5 17 16 16.5" stroke="#3b82f6" strokeWidth="0.6" fill="none" className="leg-ripples" opacity="0.5"/>
          <path d="M8.2 16.8 Q8.7 17.3 9.2 16.8" stroke="#1d4ed8" strokeWidth="0.4" fill="none" className="leg-ripples" opacity="0.3"/>
          <path d="M15.2 16.8 Q15.7 17.3 16.2 16.8" stroke="#1d4ed8" strokeWidth="0.4" fill="none" className="leg-ripples" opacity="0.3"/>
          
          {/* Pomba do Espírito Santo detalhada */}
          <ellipse cx="12" cy="6" rx="1.4" ry="0.8" fill="#ffffff" className="holy-spirit-dove"/>
          <ellipse cx="12" cy="6" rx="1.1" ry="0.6" fill="#f0f8ff" className="dove-body"/>
          
          {/* Asas da pomba */}
          <path d="M10.5 6 Q12 5.2 13.5 6" stroke="#ffffff" strokeWidth="1" fill="none" className="dove-wings"/>
          <path d="M10.7 6.2 Q12 5.6 13.3 6.2" stroke="#e6e6fa" strokeWidth="0.8" fill="none" className="dove-wings"/>
          
          {/* Bico da pomba */}
          <path d="M11.5 6.5 Q12 7.2 12.5 6.5" stroke="#ffd700" strokeWidth="0.4" fill="none" className="dove-beak"/>
          
          {/* Estilo CSS para animações detalhadas */}
          <style>
            {`
              .river-main {
                animation: water-flow-main 4s ease-in-out infinite;
              }
              
              .river-secondary {
                animation: water-flow-secondary 4s ease-in-out infinite 0.5s;
              }
              
              .river-tertiary {
                animation: water-flow-tertiary 4s ease-in-out infinite 1s;
              }
              
              .joao-head, .jesus-head {
                animation: gentle-bob 4s ease-in-out infinite;
              }
              
              .joao-hair, .jesus-hair {
                animation: hair-flow 6s ease-in-out infinite;
              }
              
              .joao-body, .jesus-body {
                animation: gentle-bob 4s ease-in-out infinite 0.2s;
              }
              
              .joao-arms, .jesus-arms {
                animation: gentle-bob 4s ease-in-out infinite 0.4s;
              }
              
              .joao-hands, .jesus-hands {
                animation: gentle-bob 4s ease-in-out infinite 0.6s;
              }
              
              .baptism-waves-main {
                animation: wave-pulse 2s ease-in-out infinite;
              }
              
              .baptism-waves-secondary {
                animation: wave-pulse 2s ease-in-out infinite 0.3s;
              }
              
              .baptism-waves-tertiary {
                animation: wave-pulse 2s ease-in-out infinite 0.6s;
              }
              
              .leg-ripples {
                animation: ripple-expand 3s ease-in-out infinite;
              }
              
              .holy-spirit-dove {
                animation: dove-float 6s ease-in-out infinite;
              }
              
              .dove-wings {
                animation: wing-movement 3s ease-in-out infinite;
              }
              
              @keyframes water-flow-main {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-0.8px) scale(1.02); }
              }
              
              @keyframes water-flow-secondary {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-0.6px) scale(1.01); }
              }
              
              @keyframes water-flow-tertiary {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-0.4px) scale(1.005); }
              }
              
              @keyframes gentle-bob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-1px); }
              }
              
              @keyframes hair-flow {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(1deg); }
              }
              
              @keyframes wave-pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
              }
              
              @keyframes ripple-expand {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 0.3; }
              }
              
              @keyframes dove-float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-1px) rotate(1deg); }
                50% { transform: translateY(-2px) rotate(0deg); }
                75% { transform: translateY(-1px) rotate(-1deg); }
              }
              
              @keyframes wing-movement {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
            `}
          </style>
        </svg>
      );
    
    case 'mountain-1':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte Sinai - 300+ pts - Lei de Deus */}
          <defs>
            <linearGradient id="sinaiBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="sinaiPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#a78bfa', stopOpacity: 0.8}}/>
              <stop offset="100%" style={{stopColor: '#7c3aed', stopOpacity: 0.9}}/>
            </linearGradient>
            <linearGradient id="tabletsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fde68a', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#fbbf24', stopOpacity: 0.9}}/>
            </linearGradient>
            <filter id="sinaiShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular do Sinai */}
          <path d="M2 18 L12 6 L22 18 Z" fill="url(#sinaiPurpleGradient)" filter="url(#sinaiShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#sinaiBaseGradient)"/>
          
          {/* Tábuas dos Dez Mandamentos no topo */}
          <rect x="9" y="7" width="6" height="5" fill="url(#tabletsGradient)" stroke="#92400e" strokeWidth="0.4" filter="url(#sinaiShadow)"/>
          <rect x="9.2" y="7.2" width="5.6" height="4.6" fill="#fef3c7"/>
          
          {/* Linhas dos mandamentos */}
          <line x1="10" y1="9" x2="14" y2="9" stroke="#92400e" strokeWidth="0.3"/>
          <line x1="10" y1="10" x2="14" y2="10" stroke="#92400e" strokeWidth="0.3"/>
          <line x1="10" y1="11" x2="14" y2="11" stroke="#92400e" strokeWidth="0.3"/>
          
          {/* Brilho nas tábuas */}
          <path d="M9.5 7.2 L10 7.2 L10 11.8 L9.5 11.8 Z" fill="#ffffff" opacity="0.3"/>
        </svg>
      );
    
    case 'mountain-2':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte Nebo - 400+ pts - Visão da promessa */}
          <defs>
            <linearGradient id="neboBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="neboBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 0.8}}/>
              <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 0.9}}/>
            </linearGradient>
            <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}}/>
              <stop offset="70%" style={{stopColor: '#1e40af', stopOpacity: 0.8}}/>
              <stop offset="100%" style={{stopColor: '#1e3a8a', stopOpacity: 0.6}}/>
            </radialGradient>
            <filter id="neboShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular do Nebo */}
          <path d="M2 18 L12 5 L22 18 Z" fill="url(#neboBlueGradient)" filter="url(#neboShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#neboBaseGradient)"/>
          
          {/* Olho estilizado no topo - visão da promessa */}
          <ellipse cx="12" cy="7" rx="2.5" ry="1.8" fill="#1e40af" stroke="#1e3a8a" strokeWidth="0.4" filter="url(#neboShadow)"/>
          <ellipse cx="12" cy="7" rx="2" ry="1.5" fill="url(#eyeGradient)"/>
          <circle cx="12" cy="7" r="1.2" fill="#3b82f6"/>
          <circle cx="12" cy="7" r="0.6" fill="#1e40af"/>
          <circle cx="12" cy="7" r="0.2" fill="#ffffff"/>
          
          {/* Sobrancelha elegante */}
          <path d="M9.5 5.5 Q12 4.8 14.5 5.5" stroke="#1e40af" strokeWidth="0.6" fill="none" opacity="0.8"/>
          
          {/* Brilho no olho */}
          <circle cx="11.5" cy="6.5" r="0.15" fill="#ffffff" opacity="0.9"/>
        </svg>
      );
    
    case 'mountain-3':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte Moriá - 500+ pts - Altar da entrega */}
          <defs>
            <linearGradient id="moriaBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="moriaPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#a78bfa', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#7c3aed', stopOpacity: 1}}/>
            </linearGradient>
            <linearGradient id="altarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#a16207', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#92400e', stopOpacity: 0.9}}/>
            </linearGradient>
            <radialGradient id="flameGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}}/>
              <stop offset="50%" style={{stopColor: '#f59e0b', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#d97706', stopOpacity: 0.7}}/>
            </radialGradient>
            <filter id="moriaShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular do Moriá */}
          <path d="M2 18 L12 4 L22 18 Z" fill="url(#moriaPurpleGradient)" filter="url(#moriaShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#moriaBaseGradient)"/>
          
          {/* Altar elegante no topo */}
          <rect x="10" y="5" width="4" height="3" fill="url(#altarGradient)" stroke="#78350f" strokeWidth="0.3" filter="url(#moriaShadow)"/>
          <rect x="10.2" y="5.2" width="3.6" height="2.6" fill="#a16207"/>
          
          {/* Chama da fé com gradiente radial */}
          <path d="M12 4 Q12.5 3 13 4 Q13.5 5 14 6 Q13 7 12 6 Q11 7 10 6 Q9 5 10 4 Q12 4" fill="url(#flameGradient)"/>
          <path d="M12 4 Q12.5 3.5 13 4 Q13.5 4.5 12 4.5 Q11.5 4.5 11 4 Q12 4" fill="#fbbf24"/>
          
          {/* Brilho da chama */}
          <circle cx="12" cy="4.5" r="0.3" fill="#ffffff" opacity="0.8"/>
        </svg>
      );
    
    case 'mountain-4':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte Carmelo - 600+ pts - Vitória espiritual */}
          <defs>
            <linearGradient id="carmeloBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="carmeloGreenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#4ade80', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#16a34a', stopOpacity: 1}}/>
            </linearGradient>
            <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}}/>
              <stop offset="30%" style={{stopColor: '#f59e0b', stopOpacity: 0.9}}/>
              <stop offset="60%" style={{stopColor: '#ef4444', stopOpacity: 0.8}}/>
              <stop offset="100%" style={{stopColor: '#dc2626', stopOpacity: 0.7}}/>
            </radialGradient>
            <filter id="carmeloShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular do Carmelo */}
          <path d="M2 18 L12 3 L22 18 Z" fill="url(#carmeloGreenGradient)" filter="url(#carmeloShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#carmeloBaseGradient)"/>
          
          {/* Grande chama do fogo do Senhor no topo */}
          <path d="M12 3 Q13 1 14 3 Q15 5 14 6 Q13 7 12 6 Q11 7 10 6 Q9 5 10 3 Q12 3" fill="url(#fireGradient)" filter="url(#carmeloShadow)"/>
          <path d="M12 3 Q13 1.5 14 3 Q13 4.5 12 4.5 Q11.5 4.5 11 4 Q12 4" fill="#ef4444"/>
          <path d="M12 3 Q12.5 2 13 3 Q12.5 4 12 4 Q11.5 4 11 3 Q12 3" fill="#fbbf24"/>
          
          {/* Brilho da chama */}
          <circle cx="12" cy="3.5" r="0.4" fill="#ffffff" opacity="0.9"/>
          <circle cx="12.5" cy="3" r="0.2" fill="#ffffff" opacity="0.7"/>
        </svg>
      );
    
    case 'mountain-5':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte Hermon - 700+ pts - Transfiguração */}
          <defs>
            <linearGradient id="hermonBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="hermonIndigoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#818cf8', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#6366f1', stopOpacity: 0.9}}/>
            </linearGradient>
            <radialGradient id="lightGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}}/>
              <stop offset="50%" style={{stopColor: '#f59e0b', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#eab308', stopOpacity: 0.7}}/>
            </radialGradient>
            <filter id="hermonShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular do Hermon */}
          <path d="M2 18 L12 2 L22 18 Z" fill="url(#hermonIndigoGradient)" filter="url(#hermonShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#hermonBaseGradient)"/>
          
          {/* Raios de luz divina no topo */}
          <path d="M12 2 L14 0 L12 1 L10 0 Z" fill="url(#lightGradient)" filter="url(#hermonShadow)"/>
          <path d="M12 1 L13 0 L12 0.5 L11 0 Z" fill="#f59e0b" opacity="0.8"/>
          
          {/* Luz brilhante no topo */}
          <circle cx="12" cy="0" r="1.2" fill="url(#lightGradient)" filter="url(#hermonShadow)"/>
          <circle cx="12" cy="0" r="0.8" fill="#fbbf24" opacity="0.9"/>
          
          {/* Raios de luz adicionais */}
          <path d="M12 1.5 L13 0.5 L12 1 L11 0.5 Z" fill="#fbbf24" opacity="0.6"/>
        </svg>
      );
    
    case 'mountain-6':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte Sião - 800+ pts - Cidade de Deus */}
          <defs>
            <linearGradient id="sionBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="sionRedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f87171', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#dc2626', stopOpacity: 0.9}}/>
            </linearGradient>
            <linearGradient id="towerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fde68a', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#fbbf24', stopOpacity: 0.9}}/>
            </linearGradient>
            <filter id="sionShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular do Sião */}
          <path d="M2 18 L12 1 L22 18 Z" fill="url(#sionRedGradient)" filter="url(#sionShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#sionBaseGradient)"/>
          
          {/* Torres estilizadas da cidade de Deus em 3D */}
          <rect x="9" y="2" width="2" height="3" fill="url(#towerGradient)" stroke="#92400e" strokeWidth="0.3" filter="url(#sionShadow)"/>
          <rect x="13" y="2" width="2" height="3" fill="url(#towerGradient)" stroke="#92400e" strokeWidth="0.3" filter="url(#sionShadow)"/>
          <rect x="11" y="1" width="2" height="4" fill="url(#towerGradient)" stroke="#92400e" strokeWidth="0.3" filter="url(#sionShadow)"/>
          
          {/* Coroa no topo da torre central */}
          <path d="M11 0.5 L12 0 L13 0.5 L12.5 1 L11.5 1 Z" fill="url(#towerGradient)" filter="url(#sionShadow)"/>
          <circle cx="12" cy="0.5" r="0.3" fill="#92400e"/>
          
          {/* Brilho nas torres */}
          <path d="M9.2 2 L9.2 5 L9.8 5 L9.8 2 Z" fill="#ffffff" opacity="0.3"/>
          <path d="M13.2 2 L13.2 5 L13.8 5 L13.8 2 Z" fill="#ffffff" opacity="0.3"/>
          <path d="M11.2 1 L11.2 5 L11.8 5 L11.8 1 Z" fill="#ffffff" opacity="0.3"/>
        </svg>
      );
    
    case 'mountain-7':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Monte das Oliveiras - 900+ pts - Oração e esperança */}
          <defs>
            <linearGradient id="olivesBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <linearGradient id="olivesGoldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fde047', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#eab308', stopOpacity: 0.9}}/>
            </linearGradient>
            <radialGradient id="oliveTreeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#4ade80', stopOpacity: 1}}/>
              <stop offset="50%" style={{stopColor: '#22c55e', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#16a34a', stopOpacity: 0.8}}/>
            </radialGradient>
            <filter id="olivesShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular das Oliveiras */}
          <path d="M2 18 L12 1 L22 18 Z" fill="url(#olivesGoldGradient)" filter="url(#olivesShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#olivesBaseGradient)"/>
          
          {/* Oliveira estilizada elegante em 3D */}
          <ellipse cx="12" cy="4" rx="4" ry="2" fill="#16a34a" opacity="0.9" filter="url(#olivesShadow)"/>
          <ellipse cx="12" cy="3" rx="3.2" ry="1.6" fill="url(#oliveTreeGradient)"/>
          <ellipse cx="12" cy="2" rx="2.3" ry="1.2" fill="#4ade80" opacity="1"/>
          
          {/* Tronco da oliveira com gradiente */}
          <rect x="11.5" y="4" width="1" height="2" fill="#92400e" filter="url(#olivesShadow)"/>
          <rect x="11.6" y="4.2" width="0.8" height="1.6" fill="#a16207"/>
          
          {/* Azeitonas douradas com brilho */}
          <circle cx="10" cy="3" r="0.4" fill="#fbbf24" filter="url(#olivesShadow)"/>
          <circle cx="14" cy="3" r="0.4" fill="#fbbf24" filter="url(#olivesShadow)"/>
          <circle cx="12" cy="1.5" r="0.4" fill="#fbbf24" filter="url(#olivesShadow)"/>
          
          {/* Brilho nas azeitonas */}
          <circle cx="9.8" cy="2.8" r="0.1" fill="#ffffff" opacity="0.8"/>
          <circle cx="13.8" cy="2.8" r="0.1" fill="#ffffff" opacity="0.8"/>
          <circle cx="11.8" cy="1.3" r="0.1" fill="#ffffff" opacity="0.8"/>
        </svg>
      );
    
    case 'mountain-8':
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          {/* Canaã - 1000+ pts 🌟 - A terra prometida */}
          <defs>
            <linearGradient id="canaanBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 0.4}}/>
              <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}}/>
            </linearGradient>
            <radialGradient id="canaanGoldGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#fde047', stopOpacity: 1}}/>
              <stop offset="50%" style={{stopColor: '#fbbf24', stopOpacity: 0.9}}/>
              <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 0.8}}/>
            </radialGradient>
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}}/>
              <stop offset="30%" style={{stopColor: '#fde047', stopOpacity: 0.9}}/>
              <stop offset="70%" style={{stopColor: '#fbbf24', stopOpacity: 0.8}}/>
              <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 0.7}}/>
            </radialGradient>
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 1}}/>
              <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 0.8}}/>
            </linearGradient>
            <filter id="canaanShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Monte triangular de Canaã */}
          <path d="M2 18 L12 0 L22 18 Z" fill="url(#canaanGoldGradient)" filter="url(#canaanShadow)"/>
          
          {/* Base do monte */}
          <path d="M2 18h20v2H2z" fill="url(#canaanBaseGradient)"/>
          
          {/* Sol brilhante - vitória eterna com gradiente */}
          <circle cx="12" cy="1" r="2.2" fill="url(#sunGradient)" filter="url(#canaanShadow)"/>
          <circle cx="12" cy="1" r="1.8" fill="#fbbf24" opacity="0.95"/>
          <circle cx="12" cy="1" r="1.2" fill="#f59e0b" opacity="0.8"/>
          <circle cx="12" cy="1" r="0.6" fill="#eab308" opacity="0.6"/>
          
          {/* Raios de sol gloriosos com gradiente */}
          <path d="M12 0 L12 -1" stroke="url(#sunGradient)" strokeWidth="0.5" opacity="0.9"/>
          <path d="M12 3 L12 3.5" stroke="url(#sunGradient)" strokeWidth="0.5" opacity="0.9"/>
          <path d="M9.5 1 L9 1" stroke="url(#sunGradient)" strokeWidth="0.5" opacity="0.9"/>
          <path d="M15 1 L15.5 1" stroke="url(#sunGradient)" strokeWidth="0.5" opacity="0.9"/>
          
          {/* Raios diagonais */}
          <path d="M10.5 0.5 L9.5 -0.5" stroke="url(#sunGradient)" strokeWidth="0.4" opacity="0.8"/>
          <path d="M13.5 0.5 L14.5 -0.5" stroke="url(#sunGradient)" strokeWidth="0.4" opacity="0.8"/>
          
          {/* Rio da vida com gradiente */}
          <path d="M2 20 L22 20" stroke="url(#riverGradient)" strokeWidth="1.5" opacity="0.9"/>
          <path d="M2 19.5 L22 19.5" stroke="url(#riverGradient)" strokeWidth="0.8" opacity="0.7"/>
          
          {/* Terra prometida - colinas verdes com sombra */}
          <ellipse cx="8" cy="19" rx="2.5" ry="1.4" fill="#16a34a" opacity="0.9" filter="url(#canaanShadow)"/>
          <ellipse cx="16" cy="19" rx="2.5" ry="1.4" fill="#16a34a" opacity="0.9" filter="url(#canaanShadow)"/>
          
          {/* Estrela da vitória 🌟 com brilho */}
          <path d="M12 0.5 L12.8 0 L12 0.5 L11.2 0 Z" fill="#ffffff" opacity="1"/>
          <path d="M12 0.5 L12.8 0.5 L12 0 L11.2 0.5 Z" fill="#ffffff" opacity="1"/>
          
          {/* Brilho adicional da estrela */}
          <circle cx="12" cy="0.5" r="0.2" fill="#fbbf24" opacity="0.8"/>
        </svg>
      );
    
    default:
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" fill="currentColor"/>
        </svg>
      );
  }
}
