import { useTranslation } from '../../i18n';
import { CustomSelect } from '../ui/CustomSelect';

interface DateOfBirthPickerProps {
  day?: string;
  month?: string;
  year?: string;
  onDayChange?: (v: string) => void;
  onMonthChange?: (v: string) => void;
  onYearChange?: (v: string) => void;
}

export function DateOfBirthPicker({ day, month, year, onDayChange, onMonthChange, onYearChange }: DateOfBirthPickerProps) {
  const { t } = useTranslation('auth');

  const days = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: i + 1 }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: i + 1 }));
  const years = Array.from({ length: 120 }, (_, i) => ({ value: 2026 - i, label: 2026 - i }));

  return (
    <div>
      <label className="text-sm font-bold text-textPrimary ml-1 mb-1 block">
        {t('dateOfBirth')}
      </label>
      <div className="flex gap-2">
        <CustomSelect
          value={day}
          placeholder={t('day')}
          options={days}
          onChange={onDayChange}
        />
        <CustomSelect
          value={month}
          placeholder={t('month')}
          options={months}
          onChange={onMonthChange}
        />
        <CustomSelect
          value={year}
          placeholder={t('year')}
          options={years}
          onChange={onYearChange}
        />
      </div>
    </div>
  );
}
