import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

test('renders home content with search', () => {
  renderAt('/catalog');
  const searchPlaceholder = screen.getByPlaceholderText(/Search Catalog/i);
  expect(searchPlaceholder).toBeInTheDocument();
});
