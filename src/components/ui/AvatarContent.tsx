import { SecureImage } from './SecureMedia';
import { cn } from '../../utils/cn';

interface AvatarContentProps {
  src?: string | null;
  name?: string | null;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function AvatarContent({ src, name, imageClassName, fallbackClassName }: AvatarContentProps) {
  const label = name?.trim() || 'Usuário';
  if (src?.trim()) {
    return <SecureImage src={src} alt={label} className={cn('h-full w-full object-cover', imageClassName)} />;
  }

  return (
    <span aria-label={`Foto de perfil de ${label}`} className={cn('flex h-full w-full items-center justify-center bg-white/[0.06] font-semibold uppercase text-white/75', fallbackClassName)}>
      {label.charAt(0).toLocaleUpperCase('pt-BR')}
    </span>
  );
}
