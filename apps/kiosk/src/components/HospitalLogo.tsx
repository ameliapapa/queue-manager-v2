import logoSvg from '../assets/mbreteresha_geraldine.svg';

interface HospitalLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function HospitalLogo({ className = "w-full h-full", style }: HospitalLogoProps) {
  return (
    <img
      src={logoSvg}
      alt="Hospital Logo"
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  );
}
