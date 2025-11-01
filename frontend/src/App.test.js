// Mock axios before importing the app to avoid ESM/transform issues
jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (typeof url === 'string' && url.includes('/requests')) {
      return Promise.resolve({ data: [
        { id: 1, title: 'Food Drive', description: 'Collect food donations', status: 'active' },
        { id: 2, title: 'Beach Cleanup', description: 'Community beach cleanup', status: 'completed' }
      ] });
    }
    if (typeof url === 'string' && url.includes('/users')) {
      return Promise.resolve({ data: [
        { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob', email: 'bob@example.com', role: 'volunteer' }
      ] });
    }
    return Promise.resolve({ data: [] });
  }),
}));

// Stub the Navbar component so the test doesn't need to render full navigation
jest.mock('./components/Navbar', () => {
  const React = require('react');
  return () => React.createElement('div', null, 'Navbar');
});

import { render, screen } from '@testing-library/react';

// Increase Jest timeout for slower CI environments
jest.setTimeout(20000);

test('App renders dashboard heading without crashing', async () => {
  // Dynamically import App after mocks are in place
  const { default: App } = await import('./App');
  render(<App />);
  const heading = await screen.findByText(/dashboard overview/i);
  expect(heading).toBeInTheDocument();
});
