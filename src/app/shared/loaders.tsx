import React from 'react';

type LoaderSize = 'small' | 'medium' | 'large' | 'xlarge';

interface LoaderProps {
  type?: string;
  color?: string;
  size?: LoaderSize;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  type = 'spinner', 
  color = '#edf975', 
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses: Record<LoaderSize, string> = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const getSizeValue = (): string => {
    switch(size) {
      case 'small': return '0.5rem';
      case 'large': return '1rem';
      case 'xlarge': return '1.25rem';
      default: return '0.75rem';
    }
  };

  const loaders: Record<string, React.ReactElement> = {
    // Classic Loaders
    spinner: (
      <div 
        className={`animate-spin rounded-full border-2 border-t-2 border-gray-200 ${sizeClasses[size]} ${className}`} 
        style={{ borderTopColor: color }} 
      />
    ),
    dots: (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="animate-bounce rounded-full"
            style={{ 
              backgroundColor: color,
              animationDelay: `${i * 0.1}s`,
              width: getSizeValue(),
              height: getSizeValue()
            }}
          />
        ))}
      </div>
    ),
    pulse: (
      <div 
        className={`animate-pulse rounded-full ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: color }}
      />
    ),
    bars: (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
          <div
            key={i}
            className="animate-bounce"
            style={{ 
              backgroundColor: color,
              animationDelay: `${delay}s`,
              width: size === 'small' ? '0.25rem' : 
                     size === 'medium' ? '0.375rem' : 
                     size === 'large' ? '0.5rem' : '0.625rem',
              height: size === 'small' ? '0.75rem' : 
                      size === 'medium' ? '1.5rem' : 
                      size === 'large' ? '2.25rem' : '3rem'
            }}
          />
        ))}
      </div>
    ),
    ripple: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }} />
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: color }} />
      </div>
    ),
    progress: (
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
        <div className="h-full animate-progress origin-left" style={{ 
          backgroundColor: color,
          height: size === 'small' ? '0.25rem' : 
                  size === 'medium' ? '0.5rem' : 
                  size === 'large' ? '0.75rem' : '1rem'
        }} />
      </div>
    ),
    
    // Modern Loaders
    clock: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
        <div 
          className="absolute top-1/2 left-1/2 origin-top -translate-x-1/2 h-1/2 w-0.5"
          style={{ 
            backgroundColor: color,
            animation: `clock 2s infinite linear`
          }}
        ></div>
      </div>
    ),
    orbit: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{ 
            backgroundColor: color,
            width: '25%',
            height: '25%',
            animation: `orbit 1.5s infinite linear`
          }}
        ></div>
      </div>
    ),
    infinity: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <svg 
          className="animate-spin" 
          viewBox="0 0 100 100" 
          style={{ color }}
        >
          <path 
            d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray="180"
            strokeDashoffset="0"
          ></path>
        </svg>
      </div>
    ),
    cube: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div 
          className="absolute inset-0 bg-gray-300 rounded"
          style={{ 
            animation: `cube 1.8s infinite`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div 
            className="absolute inset-0 rounded"
            style={{ 
              backgroundColor: color,
              opacity: 0.6,
              transform: 'translateZ(0.5rem)'
            }}
          ></div>
          <div 
            className="absolute inset-0 rounded"
            style={{ 
              backgroundColor: color,
              opacity: 0.8,
              transform: 'rotateY(90deg) translateZ(0.5rem)'
            }}
          ></div>
          <div 
            className="absolute inset-0 rounded"
            style={{ 
              backgroundColor: color,
              transform: 'rotateX(90deg) translateZ(0.5rem)'
            }}
          ></div>
        </div>
      </div>
    ),
    wave: (
      <div className={`flex items-end justify-center space-x-1 ${className}`} style={{ height: sizeClasses[size] }}>
        {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
          <div
            key={i}
            className="animate-bounce"
            style={{ 
              backgroundColor: color,
              animationDelay: `${delay}s`,
              width: size === 'small' ? '0.25rem' : 
                     size === 'medium' ? '0.375rem' : 
                     size === 'large' ? '0.5rem' : '0.625rem',
              height: size === 'small' ? '0.75rem' : 
                      size === 'medium' ? '1rem' : 
                      size === 'large' ? '1.25rem' : '1.5rem'
            }}
          />
        ))}
      </div>
    ),
    neon: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
            animation: `neon 2s infinite alternate`
          }}
        ></div>
      </div>
    ),
    fractal: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full border-2 border-t-2 border-b-2 absolute"
            style={{ 
              borderColor: `${color} transparent`,
              animation: `fractal 2s infinite linear`,
              width: '100%',
              height: '100%'
            }}
          ></div>
          <div 
            className="rounded-full border-2 border-t-2 border-b-2 absolute"
            style={{ 
              borderColor: `${color} transparent`,
              animation: `fractal 2s infinite linear reverse`,
              width: '70%',
              height: '70%'
            }}
          ></div>
          <div 
            className="rounded-full border-2 border-t-2 border-b-2 absolute"
            style={{ 
              borderColor: `${color} transparent`,
              animation: `fractal 2s infinite linear`,
              width: '40%',
              height: '40%'
            }}
          ></div>
        </div>
      </div>
    ),
    
    // Physics-based Loaders
    meteor: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full animate-ping"
              style={{
                backgroundColor: color,
                animationDelay: `${i * 0.3}s`,
                width: '30%',
                height: '30%'
              }}
            ></div>
          ))}
        </div>
      </div>
    ),
    atom: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-t-2 border-b-2"
              style={{
                borderColor: `${color} transparent`,
                animation: `atom ${2 + i * 0.5}s infinite linear`,
                width: `${80 - i * 20}%`,
                height: `${80 - i * 20}%`,
                transform: `rotateX(${i * 60}deg) rotateY(${i * 60}deg)`
              }}
            ></div>
          ))}
        </div>
      </div>
    ),
    zigzag: (
      <div className={`flex items-center justify-center ${className}`}>
        <svg width="40" height="20" viewBox="0 0 40 20">
          <path
            d="M0,10 L10,0 L20,10 L30,0 L40,10"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0, 100; 100, 0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    ),
    staircase: (
      <div className={`flex flex-col items-center justify-end space-y-1 ${className}`} style={{ height: '2rem' }}>
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <div
            key={i}
            className="animate-bounce"
            style={{ 
              backgroundColor: color,
              animationDelay: `${delay}s`,
              width: `${(4 - i) * 0.25}rem`,
              height: '0.25rem'
            }}
          />
        ))}
      </div>
    ),
    flip: (
      <div 
        className={`${sizeClasses[size]} ${className}`}
        style={{ 
          backgroundColor: color,
          animation: `flip 1.5s infinite`
        }}
      />
    ),
    firework: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-ping"
              style={{
                backgroundColor: color,
                animationDelay: `${i * 0.1}s`,
                transform: `rotate(${i * 60}deg) translateX(50%)`
              }}
            ></div>
          ))}
        </div>
      </div>
    ),
    
    // Shape-based Loaders
    honeycomb: (
      <div className={`${sizeClasses[size]} ${className}`} 
        style={{ 
          backgroundColor: color,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          animation: 'pulse 1.5s infinite'
        }} 
      />
    ),
    cyber: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke={color} strokeWidth="2" strokeDasharray="10 5">
            <animate attributeName="stroke-dashoffset" from="0" to="15" dur="1s" repeatCount="indefinite" />
          </rect>
          <line x1="0" y1="0" x2="100" y2="100" stroke={color} strokeWidth="2" strokeDasharray="5 5">
            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="100" y1="0" x2="0" y2="100" stroke={color} strokeWidth="2" strokeDasharray="5 5">
            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>
    ),
    snowflake: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ color }}>
          <path d="M50,10 L50,90 M30,30 L70,70 M70,30 L30,70 M10,50 L90,50 M25,15 L75,85 M75,15 L25,85" 
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    ),
    yinyang: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ color }}>
          <path d="M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0 Z M50,0 A25,25 0 1,0 50,50 A25,25 0 1,0 50,0 Z M50,50 A25,25 0 1,0 50,100 A25,25 0 1,0 50,50 Z" 
            fill="currentColor" />
        </svg>
      </div>
    ),
    spiral: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color }}>
          <path d="M50,10 A40,40 0 0,1 90,50 A40,40 0 0,1 50,90 A40,40 0 0,1 10,50 A40,40 0 0,1 50,10" 
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="250" strokeDashoffset="0">
            <animate attributeName="stroke-dashoffset" values="0;250;0" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    ),
    heartbeat: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color }}>
          <path d="M10,50 L30,30 L50,50 L70,30 L90,50 L70,70 L50,50 L30,70 Z" 
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
            <animate attributeName="d" values="M10,50 L30,30 L50,50 L70,30 L90,50 L70,70 L50,50 L30,70 Z;M10,50 L30,40 L50,50 L70,40 L90,50 L70,60 L50,50 L30,60 Z;M10,50 L30,30 L50,50 L70,30 L90,50 L70,70 L50,50 L30,70 Z" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    ),
    
    // Creative Loaders
    'dots-ring': (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div
            key={i}
            className="absolute rounded-full animate-ping"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.1}s`,
              width: '20%',
              height: '20%',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(150%)`
            }}
          ></div>
        ))}
      </div>
    ),
    jelly: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div 
          className="w-full h-full rounded-full"
          style={{ 
            backgroundColor: color,
            animation: 'jelly 1.5s infinite'
          }}
        ></div>
      </div>
    ),
    superballs: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.15}s`,
              width: '30%',
              height: '30%',
              top: '50%',
              left: `${20 + i * 30}%`,
              transform: 'translateY(-50%)'
            }}
          ></div>
        ))}
      </div>
    ),
    trinity: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.3}s`,
              width: '50%',
              height: '50%',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${1 - i * 0.3})`
            }}
          ></div>
        ))}
      </div>
    ),
    pong: (
      <div className={`relative ${sizeClasses[size]} ${className}`} style={{ backgroundColor: '#f3f4f6' }}>
        <div 
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: '20%',
            height: '20%',
            top: '50%',
            left: '0%',
            animation: 'pong 1.5s infinite alternate'
          }}
        ></div>
      </div>
    ),
    cradle: (
      <div className={`flex items-end justify-center space-x-1 ${className}`} style={{ height: sizeClasses[size] }}>
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <div
            key={i}
            className="w-1 rounded-t-full"
            style={{ 
              backgroundColor: color,
              animation: 'cradle 1.5s infinite',
              animationDelay: `${delay}s`,
              height: i % 2 === 0 ? '60%' : '40%'
            }}
          />
        ))}
      </div>
    ),
    
    // Special Loaders
    rainbow: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full rounded-full animate-spin" style={{ 
          background: `conic-gradient(from 0deg, violet, indigo, blue, green, yellow, orange, red, violet)`
        }}></div>
      </div>
    ),
    morph: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div 
          className="w-full h-full"
          style={{ 
            backgroundColor: color,
            animation: 'morph 3s infinite',
            borderRadius: '50%'
          }}
        ></div>
      </div>
    ),
    revolver: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              opacity: 0.6,
              width: '20%',
              height: '20%',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(150%)`,
              animation: `revolver 1.5s infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    ),
    wobble: (
      <div 
        className={`${sizeClasses[size]} ${className}`}
        style={{ 
          backgroundColor: color,
          animation: 'wobble 2s infinite'
        }}
      />
    ),
    grow: (
      <div 
        className={`${sizeClasses[size]} ${className}`}
        style={{ 
          backgroundColor: color,
          animation: 'grow 1.5s infinite alternate'
        }}
      />
    ),
    'circle-dots': (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: '15%',
              height: '15%',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(150%)`,
              animation: `circle-dots 1.5s infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    ),
    'square-dots': (
      <div className={`grid grid-cols-2 gap-1 ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="rounded animate-pulse"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    ),
    grid: (
      <div className={`grid grid-cols-3 gap-1 ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div
            key={i}
            className="rounded animate-pulse"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    ),
    fidget: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full border-2 border-t-2 border-b-2" style={{ 
          borderColor: `${color} transparent`,
          animation: 'fidget 1.5s infinite'
        }}></div>
      </div>
    ),
    gooey: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full" style={{ 
          backgroundColor: color,
          filter: 'blur(4px)',
          animation: 'gooey 2s infinite'
        }}></div>
        <div className="absolute inset-0 rounded-full animate-ping" style={{ 
          backgroundColor: color,
          opacity: 0.6
        }}></div>
      </div>
    ),
    blob: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div 
          className="w-full h-full"
          style={{ 
            backgroundColor: color,
            animation: 'blob 3s infinite',
            borderRadius: '50%'
          }}
        ></div>
      </div>
    ),
    
    // Tech-themed Loaders
    book: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 bg-gray-300 rounded" style={{ 
          transform: 'perspective(200px) rotateY(30deg)',
          animation: 'book 2s infinite alternate'
        }}>
          <div className="absolute inset-0 bg-gray-400 rounded-l" style={{ width: '10%' }}></div>
          <div className="absolute inset-0" style={{ backgroundColor: color, width: '90%', left: '10%' }}></div>
        </div>
      </div>
    ),
    code: (
      <div className={`flex flex-col space-y-1 ${className}`} style={{ width: sizeClasses[size] }}>
        {[0, 0.1, 0.2].map((delay, i) => (
          <div
            key={i}
            className="h-1 rounded-full animate-pulse"
            style={{ 
              backgroundColor: color,
              animationDelay: `${delay}s`,
              width: i === 0 ? '80%' : i === 1 ? '60%' : '70%'
            }}
          />
        ))}
      </div>
    ),
    database: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full border-2" style={{ 
          borderColor: color,
          borderTop: 'none',
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0'
        }}></div>
        <div className="absolute top-1/3 left-0 right-0 h-0.5" style={{ backgroundColor: color }}></div>
        <div className="absolute top-2/3 left-0 right-0 h-0.5" style={{ backgroundColor: color }}></div>
      </div>
    ),
    layers: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded border"
            style={{
              borderColor: color,
              top: `${i * 30}%`,
              left: `${i * 15}%`,
              right: `${i * 15}%`,
              bottom: `${i * 30}%`,
              animation: `layers 2s infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          ></div>
        ))}
      </div>
    ),
    cpu: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 border-2 rounded" style={{ borderColor: color }}></div>
        <div className="absolute top-0 left-1/3 w-0.5 h-2" style={{ backgroundColor: color }}></div>
        <div className="absolute top-0 left-2/3 w-0.5 h-2" style={{ backgroundColor: color }}></div>
        <div className="absolute bottom-0 left-1/3 w-0.5 h-2" style={{ backgroundColor: color }}></div>
        <div className="absolute bottom-0 left-2/3 w-0.5 h-2" style={{ backgroundColor: color }}></div>
        <div className="absolute left-0 top-1/3 w-2 h-0.5" style={{ backgroundColor: color }}></div>
        <div className="absolute left-0 top-2/3 w-2 h-0.5" style={{ backgroundColor: color }}></div>
        <div className="absolute right-0 top-1/3 w-2 h-0.5" style={{ backgroundColor: color }}></div>
        <div className="absolute right-0 top-2/3 w-2 h-0.5" style={{ backgroundColor: color }}></div>
      </div>
    ),
    server: (
      <div className={`flex flex-col ${className}`} style={{ width: sizeClasses[size] }}>
        <div className="h-1/3 border rounded-t" style={{ borderColor: color }}></div>
        <div className="h-1/3 border border-t-0" style={{ borderColor: color }}>
          <div className="h-full w-1/3" style={{ backgroundColor: color }}></div>
        </div>
        <div className="h-1/3 border border-t-0 rounded-b" style={{ borderColor: color }}>
          <div className="h-full w-2/3" style={{ backgroundColor: color }}></div>
        </div>
      </div>
    ),
    cloud: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse" style={{ color }}>
          <path d="M75,40 A25,25 0 0,1 75,90 H25 A25,25 0 0,1 25,40 A30,30 0 0,1 75,40 Z" 
            fill="currentColor" />
        </svg>
      </div>
    ),
    wifi: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color }}>
          {[0, 1, 2].map(i => (
            <path
              key={i}
              d={`M10,${50 + i * 15} A${40 - i * 10},${40 - i * 10} 0 0,1 90,${50 + i * 15}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="100"
              strokeDashoffset="0"
            >
              <animate attributeName="stroke-dashoffset" values="100;0" dur="1.5s" repeatCount="indefinite" />
            </path>
          ))}
          <circle cx="50" cy="80" r="5" fill="currentColor" />
        </svg>
      </div>
    ),
    bluetooth: (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse" style={{ color }}>
          <path d="M30,20 L70,50 L50,70 L50,30 L70,50 L30,80" 
            fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    battery: (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 border-2 rounded" style={{ borderColor: color }}></div>
        <div className="absolute right-0 top-1/2 w-2 h-4 -mt-2 -mr-3 rounded-r" style={{ backgroundColor: color }}></div>
        <div 
          className="absolute top-1 bottom-1 left-1 rounded-l" 
          style={{ 
            backgroundColor: color,
            animation: 'battery 3s infinite',
            width: '60%'
          }}
        ></div>
      </div>
    )
  };

  return loaders[type] || loaders.spinner;
};

export default Loader;