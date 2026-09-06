import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DateOfBirthPicker } from './DateOfBirthPicker';
import { useTranslation } from '../../i18n';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  fullName: string;
  username: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
}

interface AuthFormProps {
  mode: 'login' | 'register';
  error?: string;
  isSubmitting?: boolean;
  onSubmit: (data: LoginFormData | RegisterFormData) => void | Promise<void>;
}

export function AuthForm({ mode, error, isSubmitting = false, onSubmit }: AuthFormProps) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (mode === 'login') {
      onSubmit({ email, password });
    } else {
      onSubmit({ 
        email, 
        password, 
        name: fullName, 
        username, 
        dateOfBirth: `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`
      } as unknown as RegisterFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

      <Input label={t('password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      {mode === 'register' && (
        <>
          <DateOfBirthPicker
              day={dobDay} month={dobMonth} year={dobYear}
              onDayChange={setDobDay} onMonthChange={setDobMonth} onYearChange={setDobYear}
            />
          <Input label={t('fullName')} type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label={t('username')} type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </>
      )}

      {error && (
        <p className="text-xs text-red-400/80 ml-1 animate-fade-in">{error}</p>
      )}

      <Button type="submit" variant="primary" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
        {mode === 'login' ? t('login') : t('register')}
      </Button>
    </form>
  );
}
