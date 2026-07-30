import { useNavigate } from 'react-router-dom';
import logoSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';

interface AuthHeaderProps {
  align?: 'left' | 'center';
}

export function AuthHeader({ align = 'center' }: AuthHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className={`flex ${align === 'left' ? 'justify-start' : 'justify-center'} mb-6 pt-4`}>
      <img
        src={logoSvg}
        alt="Soul Logo"
        className="h-14 cursor-pointer object-contain drop-shadow-lg"
        onClick={() => navigate('/')}
      />
    </header>
  );
}

