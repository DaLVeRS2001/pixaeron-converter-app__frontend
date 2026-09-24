import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import block from 'bem-cn';

import CheckIcon from 'shared/assets/icons/check.svg';
import ChevronIcon from 'shared/assets/icons/chevron-down.svg';
import { SVG } from 'shared/ui/SVG';

import './Select.scss';

type SelectOption<Value extends string> = {
  value: Value;
  label: string;
};

type SelectProps<Value extends string> = {
  label: string;
  options: readonly SelectOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  labelHidden?: boolean;
};

const cn = block('select');

const Select = <Value extends string>({
  label,
  options,
  value,
  onChange,
  className,
  labelHidden = false,
}: SelectProps<Value>) => {
  const selected = options.find((option) => option.value === value);

  return (
    <Field className={cn.mix(className).toString()}>
      <Label className={cn('label', { hidden: labelHidden }).toString()}>{label}</Label>
      <Listbox value={value} onChange={onChange}>
        <ListboxButton className={cn('button').toString()}>
          <span className={cn('value')}>{selected?.label ?? value}</span>
          <SVG Svg={ChevronIcon} className={cn('chevron').toString()} />
        </ListboxButton>
        <ListboxOptions
          anchor={{ to: 'bottom start', gap: 6 }}
          modal={false}
          className={cn('options').toString()}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={cn('option').toString()}
            >
              <span>{option.label}</span>
              <SVG Svg={CheckIcon} className={cn('check').toString()} />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </Field>
  );
};

export { Select };
export type { SelectOption, SelectProps };
