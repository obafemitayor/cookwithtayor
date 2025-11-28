import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserIngredients } from './UserIngredients';
import { userIngredientService } from '../../services/userIngredientService';
import { ingredientService } from '../../services/ingredientService';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../services/userIngredientService');
vi.mock('../../services/ingredientService');

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

describe('UserIngredients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (userIngredientService.getUserIngredients as ReturnType<typeof vi.fn>).mockResolvedValue({
      ingredients: [
        { id: 1, ingredient_id: 1, ingredient: { id: 1, name: 'salt' } },
        { id: 2, ingredient_id: 2, ingredient: { id: 2, name: 'pepper' } },
      ],
      has_more: false,
      total: 2,
      offset: 0,
      limit: 10,
    });
    (userIngredientService.addIngredients as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (userIngredientService.updateIngredient as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );
    (userIngredientService.removeIngredients as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );
    (ingredientService.getIngredients as ReturnType<typeof vi.fn>).mockResolvedValue({
      ingredients: [],
    });
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
  });

  it('displays an error message when fetching user ingredients fails', async () => {
    const errorMessage = 'Failed to fetch user ingredients';
    (userIngredientService.getUserIngredients as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load ingredients. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays a list of user ingredients', async () => {
    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('salt')).toBeInTheDocument();
      expect(screen.getByText('pepper')).toBeInTheDocument();
    });
  });

  it('pagination works as expected', async () => {
    (userIngredientService.getUserIngredients as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ingredients: [
          { id: 1, ingredient_id: 1, ingredient: { id: 1, name: 'salt' } },
          { id: 2, ingredient_id: 2, ingredient: { id: 2, name: 'pepper' } },
        ],
        has_more: true,
        total: 12,
        offset: 0,
        limit: 10,
      })
      .mockResolvedValueOnce({
        ingredients: [
          { id: 11, ingredient_id: 11, ingredient: { id: 11, name: 'onion' } },
          { id: 12, ingredient_id: 12, ingredient: { id: 12, name: 'garlic' } },
        ],
        has_more: false,
        total: 12,
        offset: 10,
        limit: 10,
      })
      .mockResolvedValueOnce({
        ingredients: [
          { id: 1, ingredient_id: 1, ingredient: { id: 1, name: 'salt' } },
          { id: 2, ingredient_id: 2, ingredient: { id: 2, name: 'pepper' } },
        ],
        has_more: true,
        total: 12,
        offset: 0,
        limit: 10,
      });

    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('salt')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(userIngredientService.getUserIngredients).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          offset: 10,
        })
      );
    });

    const previousButton = screen.getByRole('button', { name: /previous/i });
    await user.click(previousButton);

    await waitFor(() => {
      expect(userIngredientService.getUserIngredients).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          offset: 0,
        })
      );
    });
  });

  it('throws an error when a user tries to add new ingredients without selecting at least one ingredient', async () => {
    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('salt')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add more ingredients/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search for an ingredient/i)).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole('button');
    const saveButton = allButtons.find((btn) => btn.textContent === 'Save Changes');
    if (saveButton) {
      await user.click(saveButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/Please add at least one ingredient/i)).toBeInTheDocument();
    });
  });

  it('shows the ingredient to be edidted as well as the save changes and cancel buttons when user clicks on edit ingredient', async () => {
    (ingredientService.getIngredients as ReturnType<typeof vi.fn>).mockResolvedValue({
      ingredients: [{ id: 3, name: 'Tomato' }],
    });

    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('salt')).toBeInTheDocument();
    });

    expect(screen.getByText('pepper')).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /add more ingredients/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.queryByText('salt')).not.toBeInTheDocument();
      expect(screen.queryByText('pepper')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/search for an ingredient/i);
    await user.type(input, 'tomato');

    await waitFor(
      () => {
        expect(screen.getByText('Tomato')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const tomatoOption = screen.getByText('Tomato');
    await user.click(tomatoOption);

    await waitFor(() => {
      expect(input).toHaveValue('Tomato');
    });

    const allButtons = screen.getAllByRole('button');
    const saveButton = allButtons.find((btn) => btn.textContent === 'Save Changes');
    if (saveButton) {
      await user.click(saveButton);
    }

    await waitFor(() => {
      expect(userIngredientService.addIngredients).toHaveBeenCalled();
    });
  });

  it('dismisses the edit ingredient form when user clicks on cancel', async () => {
    const ingredientToEdit = 'salt';
    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(ingredientToEdit)).toBeInTheDocument();
    });
    const editButtons = screen.getAllByLabelText(/edit ingredient/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      // Verify modal is open - check for modal title
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/edit ingredient/i)).toBeInTheDocument();
      // Verify ingredient list is still visible in background
      expect(screen.getByText(ingredientToEdit)).toBeInTheDocument();
      // Verify form elements are in modal
      const input = screen.getByPlaceholderText(/search for an ingredient/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(ingredientToEdit);
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      // Verify modal is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/search for an ingredient/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
      // Verify ingredient list is still visible
      expect(screen.getByText(ingredientToEdit)).toBeInTheDocument();
    });
  });

  it('successfully edits an ingredient when user clicks on save changes', async () => {
    const ingredientToEdit = 'salt';
    (ingredientService.getIngredients as ReturnType<typeof vi.fn>).mockResolvedValue({
      ingredients: [{ id: 4, name: 'Onion' }],
    });

    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(ingredientToEdit)).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText(/edit ingredient/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      // Verify modal is open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/edit ingredient/i)).toBeInTheDocument();
      // Verify ingredient list is still visible in background
      expect(screen.getByText(ingredientToEdit)).toBeInTheDocument();
      // Verify form is in modal
      const input = screen.getByPlaceholderText(/search for an ingredient/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(ingredientToEdit);
    });

    const input = screen.getByPlaceholderText(/search for an ingredient/i);
    await user.clear(input);
    await user.type(input, 'onion');

    await waitFor(
      () => {
        expect(screen.getByText('Onion')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const onionOption = screen.getByText('Onion');
    await user.click(onionOption);

    await waitFor(() => {
      expect(input).toHaveValue('Onion');
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(userIngredientService.updateIngredient).toHaveBeenCalledWith(1, 1, {
        id: 4,
        name: 'Onion',
      });
    });
  });

  it('deletes an ingredient when user clicks on delete ingredient', async () => {
    renderWithProviders(
      <BrowserRouter>
        <UserIngredients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('salt')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/delete ingredient/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(userIngredientService.removeIngredients).toHaveBeenCalledWith(1, [1]);
    });
  });
});
