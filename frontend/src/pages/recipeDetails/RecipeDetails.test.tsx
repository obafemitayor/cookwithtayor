import { screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecipeDetails } from './RecipeDetails';
import { useRecipeDetails } from '../../hooks/useRecipeDetails';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../hooks/useRecipeDetails');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ userId: '1', recipeId: '1' }),
    useNavigate: () => mockNavigate,
  };
});

describe('RecipeDetails', () => {
  const mockGetRecipeDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an error message when the recipe details cannot be fetched', () => {
    (useRecipeDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      recipe: null,
      loading: false,
      error: 'Failed to fetch recipe',
      getRecipeDetails: mockGetRecipeDetails,
    });

    renderWithProviders(
      <BrowserRouter>
        <RecipeDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('Failed to load recipe. Please try again.')).toBeInTheDocument();
  });

  it('shows the details of a recipe', async () => {
    const mockRecipe = {
      id: 1,
      name: 'Test Recipe',
      image_url: 'https://example.com/image.jpg',
      ingredients: ['salt', 'pepper'],
      missing_ingredients: ['flour'],
    };

    (useRecipeDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      recipe: mockRecipe,
      loading: false,
      error: null,
      getRecipeDetails: mockGetRecipeDetails,
    });

    renderWithProviders(
      <BrowserRouter>
        <RecipeDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('salt')).toBeInTheDocument();
      expect(screen.getByText('pepper')).toBeInTheDocument();
      expect(screen.getByText('flour')).toBeInTheDocument();
    });
  });
});
