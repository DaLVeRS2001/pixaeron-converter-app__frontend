import block from 'bem-cn';
import { useId } from 'react';

import './Switcher.scss';

type SwitcherOption<Value extends string> = {
  value: Value;
  label: string;
};

type SwitcherProps<Value extends string> = {
  label: string;
  options: readonly SwitcherOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  hint?: string;
  disabled?: boolean;
};

const cn = block('switcher');

const Switcher = <Value extends string>({
  label,
  options,
  value,
  onChange,
  hint,
  disabled = false,
}: SwitcherProps<Value>) => {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <fieldset
      className={cn()}
      disabled={disabled}
      aria-describedby={hint ? hintId : undefined}
    >
      <legend className={cn('label')}>{label}</legend>
      <div className={cn('body')}>
        <div className={cn('track')}>
          {options.map((option) => (
            <label
              key={option.value}
              className={cn('option', { active: option.value === value })}
            >
              <input
                className={cn('input')}
                type="radio"
                name={id}
                value={option.value}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
              />
              <span className={cn('text')}>{option.label}</span>
            </label>
          ))}
        </div>
        {hint && (
          <p id={hintId} className={cn('hint')}>
            {hint}
          </p>
        )}
      </div>
    </fieldset>
  );
};

export { Switcher };
