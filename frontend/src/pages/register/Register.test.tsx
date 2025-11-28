import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Register } from './Register';
import { userService } from '../../services/userService';
import { ingredientService } from '../../services/ingredientService';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../services/userService');
vi.mock('../../services/ingredientService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const user = userEvent.setup();

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (userService.createUser as ReturnType<typeof vi.fn>) = vi
      .fn()
      .mockResolvedValue({ id: 1, email: 'test@example.com' });
    (ingredientService.getIngredients as ReturnType<typeof vi.fn>) = vi.fn().mockResolvedValue({
      ingredients: [
        { id: 1, name: 'Tomato' },
        { id: 2, name: 'Onion' },
      ],
    });
    window.alert = vi.fn();
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('validates when a user does not supply an email address', async () => {
    renderWithProviders(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(/unfortunately, i will need your email to proceed/i)
      ).toBeInTheDocument();
    });
  });

  it('validates when a user enters an invalid email address', async () => {
    renderWithProviders(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'test@');
    await user.type(emailInput, 'invalid');

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(
      () => {
        expect(
          screen.getByText(/oops, looks like your email address is not valid/i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('validates when a user tries to submit the registration and did not select at least one ingredient', async () => {
    renderWithProviders(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    await user.type(emailInput, 'test@example.com');

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/show me what i can cook!/i)).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /show me what i can cook!/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /you need at least one ingredient before i can show you what you can cook/i
        )
      ).toBeInTheDocument();
    });

    expect(userService.createUser).not.toHaveBeenCalled();
  });

  it('shows an error alert when registration fails', async () => {
    const errorMessage = 'Registration failed';
    (userService.createUser as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    renderWithProviders(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    await user.type(emailInput, 'test@example.com');

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/show me what i can cook!/i)).toBeInTheDocument();
    });

    const firstInput = screen.getByPlaceholderText(/search for an ingredient/i);
    await user.type(firstInput, 'tomato');

    await waitFor(
      () => {
        expect(screen.getByText('Tomato')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const tomatoOption = screen.getByText('Tomato');
    await user.click(tomatoOption);

    await waitFor(() => {
      expect(firstInput).toHaveValue('Tomato');
    });

    const completeButton = screen.getByRole('button', { name: /show me what i can cook!/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Unfortunately, I was unable to create your account. Please try again.'
      );
    });
  });

  it('confirms that the user can register once a valid email and at least one ingredient is provided', async () => {
    (ingredientService.getIngredients as ReturnType<typeof vi.fn>).mockImplementation(
      async (params: {
        query?: string;
        pageSize?: number;
        nextCursor?: number;
        previousCursor?: number;
      }) => {
        const query = params.query?.toLowerCase() || '';
        if (
          query.includes('tomato') ||
          query === 't' ||
          query === 'to' ||
          query === 'tom' ||
          query === 'toma'
        ) {
          return {
            ingredients: [{ id: 1, name: 'Tomato' }],
          };
        }
        return { ingredients: [] };
      }
    );

    renderWithProviders(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    await user.type(emailInput, 'test@example.com');

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/show me what i can cook!/i)).toBeInTheDocument();
    });

    const firstInput = screen.getByPlaceholderText(/search for an ingredient/i);
    await user.click(firstInput);
    await user.clear(firstInput);
    await user.paste('tomato');

    await waitFor(
      () => {
        expect(firstInput).toHaveValue('tomato');
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(screen.getByText('Tomato')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const tomatoOption = screen.getByText('Tomato');
    await user.click(tomatoOption);

    await waitFor(() => {
      expect(firstInput).toHaveValue('Tomato');
    });

    const addButton = screen.getByRole('button', { name: /add more/i });
    await user.click(addButton);

    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText(/search for an ingredient/i);
      expect(inputs.length).toBe(2);
    });

    const inputs = screen.getAllByPlaceholderText(/search for an ingredient/i);
    const secondInput = inputs[1];
    await user.click(secondInput);
    await user.clear(secondInput);
    await user.paste('newingredient1');

    await waitFor(
      () => {
        expect(secondInput).toHaveValue('newingredient1');
      },
      { timeout: 3000 }
    );

    await waitFor(
      async () => {
        await user.click(secondInput);
        const options = screen.getAllByText(/add "newingredient1" as an ingredient/i);
        await user.click(options[options.length - 1]);
        expect(secondInput).toHaveValue('newingredient1');
      },
      { timeout: 3000 }
    );

    const addButton2 = screen.getByRole('button', { name: /add more/i });
    await user.click(addButton2);

    await waitFor(() => {
      const allInputs = screen.getAllByPlaceholderText(/search for an ingredient/i);
      expect(allInputs.length).toBe(3);
    });

    const allInputs = screen.getAllByPlaceholderText(/search for an ingredient/i);
    const thirdInput = allInputs[2];
    await user.click(thirdInput);
    await user.clear(thirdInput);
    await user.paste('newingredient2');

    await waitFor(
      () => {
        expect(thirdInput).toHaveValue('newingredient2');
      },
      { timeout: 3000 }
    );

    await waitFor(
      async () => {
        await user.click(thirdInput);
        const options = screen.getAllByText(/add "newingredient2" as an ingredient/i);
        await user.click(options[options.length - 1]);
        expect(thirdInput).toHaveValue('newingredient2');
      },
      { timeout: 3000 }
    );

    const completeButton = screen.getByRole('button', { name: /show me what i can cook!/i });
    await user.click(completeButton);

    await waitFor(
      () => {
        expect(userService.createUser).toHaveBeenCalledWith('test@example.com', {
          ingredientsInDB: [1],
          ingredientsNotInDB: ['newingredient1', 'newingredient2'],
        });
      },
      { timeout: 5000 }
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/users/1/recipes');
    });
  });
});
