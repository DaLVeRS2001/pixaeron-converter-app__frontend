import { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const Select = (props: SelectProps) => {
  return <select {...props} />;
};

export { Select };
