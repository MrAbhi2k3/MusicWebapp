export function SpiderWeb({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Radial web lines */}
      <line x1="100" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="150" y2="13.4" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="186.6" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="186.6" y2="150" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="150" y2="186.6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="100" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="50" y2="186.6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="13.4" y2="150" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="0" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="13.4" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="50" y2="13.4" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      
      {/* Concentric circles */}
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
      <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
      
      {/* Spider at center */}
      <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function SpiderIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Spider body */}
      <ellipse cx="12" cy="12" rx="3" ry="4" fill="currentColor" />
      <circle cx="12" cy="8" r="2.5" fill="currentColor" />
      
      {/* Spider legs */}
      <path d="M 9 10 Q 5 8, 3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 9 12 Q 5 12, 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 9 14 Q 5 16, 3 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      
      <path d="M 15 10 Q 19 8, 21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 15 12 Q 19 12, 22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 15 14 Q 19 16, 21 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
