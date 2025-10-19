import logoSvg from '../assets/mbreteresha_geraldine.svg';

export function HospitalLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <img
      src={logoSvg}
      alt="Hospital Logo"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
