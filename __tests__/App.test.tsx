import React from 'react';
  import {render} from '@testing-library/react-native';
  import App from '../App';

  test('renders Hello Bite Overlay', () => {
    const {getByText} = render(<App />);
    expect(getByText('Hello Bite Overlay')).toBeTruthy();
  });
  