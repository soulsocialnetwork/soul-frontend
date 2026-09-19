import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DateOfBirthPicker } from './DateOfBirthPicker';
import { useTranslation } from '../../i18n';
import { Loader2 } from 'lucide-react';

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

// ── Validações frontend ──────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;
const MIN_AGE = 13;

function calcAge(year: string, month: string, day: string): number {
  const birth = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function passwordStrength(pwd: string): { ok: boolean; message: string } {
  if (pwd.length < 6) return { ok: false, message: 'A senha precisa ter no mínimo 6 caracteres.' };
  return { ok: true, message: '' };
}

export function AuthForm({ mode, error, isSubmitting = false, onSubmit }: AuthFormProps) {
  const { t } = useTranslation('auth');

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dobDay, setDobDay]     = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear]   = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Email
    if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'E-mail inválido.';
    }

    // Senha (validação de formato apenas no cadastro)
    if (mode === 'register') {
      const pwd = passwordStrength(password);
      if (!pwd.ok) {
        errors.password = pwd.message;
      }
    } else {
      if (!password) {
        errors.password = 'Informe sua senha.';
      }
    }

    if (mode === 'register') {
      // Nome completo
      if (fullName.trim().length < 2) {
        errors.fullName = 'Digite seu nome completo.';
      }

      // Username
      if (!USERNAME_REGEX.test(username.trim())) {
        errors.username = 'Use apenas letras minúsculas, números e _ (3–30 caracteres).';
      }

      // Data de nascimento
      if (!dobDay || !dobMonth || !dobYear || dobYear.length < 4) {
        errors.dob = 'Informe uma data de nascimento válida.';
      } else {
        const age = calcAge(dobYear, dobMonth, dobDay);
        if (isNaN(age) || age < MIN_AGE) {
          errors.dob = `Você precisa ter pelo menos ${MIN_AGE} anos para criar uma conta.`;
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    if (mode === 'login') {
      onSubmit({ email: email.trim(), password });
    } else {
      onSubmit({
        email: email.trim(),
        password,
        name: fullName.trim(),
        username: username.trim().toLowerCase(),
        dateOfBirth: `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`,
      } as unknown as RegisterFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Email */}
      <div className="flex flex-col gap-1">
        <Input
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
          required
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-400/80 ml-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1">
        <Input
          label={t('password')}
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
          required
        />
        {mode === 'login' && <Link to="/reset-password" className="text-xs underline text-textSecondary">Esqueci minha senha</Link>}
        {fieldErrors.password && (
          <p className="text-xs text-red-400/80 ml-1">{fieldErrors.password}</p>
        )}
        {mode === 'register' && password.length > 0 && passwordStrength(password).ok && (
          <p className="text-xs text-emerald-400/70 ml-1">✓ Senha válida</p>
        )}
      </div>

      {mode === 'register' && (
        <>
          {/* Data de Nascimento */}
          <div className="flex flex-col gap-1">
            <DateOfBirthPicker
              day={dobDay} month={dobMonth} year={dobYear}
              onDayChange={(v) => { setDobDay(v); setFieldErrors(p => ({ ...p, dob: '' })); }}
              onMonthChange={(v) => { setDobMonth(v); setFieldErrors(p => ({ ...p, dob: '' })); }}
              onYearChange={(v) => { setDobYear(v); setFieldErrors(p => ({ ...p, dob: '' })); }}
            />
            {fieldErrors.dob && (
              <p className="text-xs text-red-400/80 ml-1">{fieldErrors.dob}</p>
            )}
          </div>

          {/* Nome completo */}
          <div className="flex flex-col gap-1">
            <Input
              label={t('fullName')}
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: '' })); }}
              required
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-400/80 ml-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <Input
              label={t('username')}
              type="text"
              value={username}
              onChange={(e) => {
                // Força lowercase e remove caracteres inválidos em tempo real
                const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setUsername(v);
                setFieldErrors(p => ({ ...p, username: '' }));
              }}
              required
            />
            {fieldErrors.username ? (
              <p className="text-xs text-red-400/80 ml-1">{fieldErrors.username}</p>
            ) : username.length > 0 ? (
              <p className="text-xs text-white/30 ml-1">@{username}</p>
            ) : null}
          </div>
        </>
      )}

      {/* Erro vindo do backend */}
      {error && (
        <p className="text-xs text-red-400/80 ml-1 animate-fade-in">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-4 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
          </span>
        ) : (
          mode === 'login' ? t('login') : t('register')
        )}
      </Button>
    </form>
  );
}
