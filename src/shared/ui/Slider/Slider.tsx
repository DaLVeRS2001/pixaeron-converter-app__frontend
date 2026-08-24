import block from 'bem-cn';
import { useId } from 'react';

import './Slider.scss';

type SliderStop<Value extends string> = {
  value: Value;
  label: string;
};

type SliderProps<Value extends string> = {
  label: string;
  stops: readonly SliderStop<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  hint?: string;
  disabled?: boolean;
};

const cn = block('slider');

const Slider = <Value extends string>({
  label,
  stops,
  value,
  onChange,
  hint,
  disabled = false,
}: SliderProps<Value>) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const current = Math.max(
    0,
    stops.findIndex((stop) => stop.value === value)
  );

  return (
    <div className={cn({ disabled })}>
      <label className={cn('label')} htmlFor={id}>
        {label}
      </label>
      <div className={cn('body')}>
        <div className={cn('control')}>
          <input
            id={id}
            className={cn('input')}
            type="range"
            min={0}
            max={stops.length - 1}
            step={1}
            value={current}
            disabled={disabled}
            aria-describedby={hint ? hintId : undefined}
            aria-valuetext={stops[current]?.label}
            onChange={(event) => onChange(stops[Number(event.target.value)].value)}
          />
          <div className={cn('stops')} aria-hidden="true">
            {stops.map((stop, index) => (
              <span key={stop.value} className={cn('stop', { active: index === current })}>
                {stop.label}
              </span>
            ))}
          </div>
        </div>
        {hint && (
          <p id={hintId} className={cn('hint')}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};

export { Slider };
