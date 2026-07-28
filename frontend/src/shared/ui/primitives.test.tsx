import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { SelectField } from './primitives';


beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
});


test('SelectField allows choosing an option and returns its value', () => {
  const onValueChange = jest.fn();
  let legacyChangeValue = '';
  const onChange = jest.fn((event: React.ChangeEvent<HTMLSelectElement>) => {
    legacyChangeValue = event.target.value;
  });

  render(
    <SelectField
      label="Должность"
      value=""
      onValueChange={onValueChange}
      onChange={onChange}
      options={[
        { value: '', label: '— не выбрано —' },
        { value: 12, label: 'Главный специалист' },
      ]}
    />,
  );

  fireEvent.change(screen.getByRole('combobox'), { target: { value: '12' } });

  expect(onValueChange).toHaveBeenCalledWith('12');
  expect(legacyChangeValue).toBe('12');
});
