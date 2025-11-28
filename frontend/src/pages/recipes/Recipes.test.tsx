import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Recipes } from './Recipes';
import { useRecipes } from '../../hooks/useRecipes';
import { useCategories } from '../../hooks/useCategories';
import { useCuisines } from '../../hooks/useCuisines';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../hooks/useRecipes');
vi.mock('../../hooks/useCategories');
vi.mock('../../hooks/useCuisines');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ userId: '1' }),
    useNavigate: () => mockNavigate,
  };
});

const user = userEvent.setup();

describe('Recipes', () => {
  const mockGetMostRelevantRecipes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      recipes: [],
      loading: false,
      error: null,
      getMostRelevantRecipes: mockGetMostRelevantRecipes,
    });
    (useCategories as ReturnType<typeof vi.fn>).mockReturnValue({
      categories: [],
      loading: false,
      error: null,
    });
    (useCuisines as ReturnType<typeof vi.fn>).mockReturnValue({
      cuisines: [],
      loading: false,
      error: null,
    });
  });

  it('displays an error message when recipes fail to load', () => {
    (useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      recipes: [],
      loading: false,
      error: 'Failed to fetch recipes',
      getMostRelevantRecipes: mockGetMostRelevantRecipes,
    });

    renderWithProviders(
      <BrowserRouter>
        <Recipes />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/oops! something went wrong while loading your recipes/i)
    ).toBeInTheDocument();
  });

  it('displays an error message when categories fail to load', () => {
    (useCategories as ReturnType<typeof vi.fn>).mockReturnValue({
      categories: [],
      loading: false,
      error: 'Failed to fetch categories',
      searchCategories: vi.fn(),
    });

    renderWithProviders(
      <BrowserRouter>
        <Recipes />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/oops! something went wrong while loading your recipes/i)
    ).toBeInTheDocument();
  });

  it('displays an error message when cuisines fail to load', () => {
    (useCuisines as ReturnType<typeof vi.fn>).mockReturnValue({
      cuisines: [],
      loading: false,
      error: 'Failed to fetch cuisines',
    });

    renderWithProviders(
      <BrowserRouter>
        <Recipes />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/oops! something went wrong while loading your recipes/i)
    ).toBeInTheDocument();
  });

  it('validates that the page displays with data', async () => {
    const mockRecipes = [
      {
        id: 1,
        name: 'Test Recipe',
        image_url: 'https://example.com/image.jpg',
        total_ingredients_user_has_for_recipe: 5,
        total_ingredients_missing_for_recipe: 2,
      },
    ];

    (useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      recipes: mockRecipes,
      loading: false,
      error: null,
      getMostRelevantRecipes: mockGetMostRelevantRecipes,
    });

    renderWithProviders(
      <BrowserRouter>
        <Recipes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    const recipeCard =
      screen.getByText('Test Recipe').closest('div[role]') ||
      screen.getByText('Test Recipe').parentElement?.parentElement;
    if (recipeCard) {
      await user.click(recipeCard as HTMLElement);
    }

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/users/1/recipes/1');
    });
  });

  it('tests pagination', async () => {
    const mockRecipes = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Recipe ${i + 1}`,
      image_url: 'https://example.com/image.jpg',
      total_ingredients_user_has_for_recipe: 5,
      total_ingredients_missing_for_recipe: 2,
    }));

    (useRecipes as ReturnType<typeof vi.fn>).mockReturnValue({
      recipes: mockRecipes,
      loading: false,
      error: null,
      getMostRelevantRecipes: mockGetMostRelevantRecipes,
    });

    renderWithProviders(
      <BrowserRouter>
        <Recipes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 10')).toBeInTheDocument();
      expect(screen.queryByText('Recipe 11')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 11')).toBeInTheDocument();
      expect(screen.getByText('Recipe 20')).toBeInTheDocument();
      expect(screen.queryByText('Recipe 1')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();

    const previousButton = screen.getByRole('button', { name: /previous/i });
    await user.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.queryByText('Recipe 11')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
  });
});
