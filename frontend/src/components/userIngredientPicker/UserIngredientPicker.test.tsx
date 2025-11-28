import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useState, useEffect } from 'react';
import { UserIngredientPicker } from './UserIngredientPicker';
import { messages } from './messages';
import type { Ingredient, UserIngredientPickerInput } from '../../types';
import { renderWithProviders } from '../../test/testUtils';
import { ingredientService, type IngredientsParams } from '../../services/ingredientService';

vi.mock('../../services/ingredientService', () => ({
  ingredientService: {
    getIngredients: vi.fn(),
  },
}));

const mockGetIngredients = ingredientService.getIngredients as ReturnType<typeof vi.fn>;
const user = userEvent.setup();

describe('UserIngredientPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIngredients.mockResolvedValue({
      ingredients: [],
      total: 0,
      offset: 0,
      limit: 200,
      has_more: false,
    });
  });

  it('renders the component with empty userIngredients list', () => {
    const setUserIngredients = vi.fn();
    renderWithProviders(
      <UserIngredientPicker userIngredients={[]} setUserIngredients={setUserIngredients} />
    );
    expect(screen.getByText(messages.title.defaultMessage)).toBeInTheDocument();
  });

  it('displays search results when user types a query', async () => {
    const setUserIngredients = vi.fn();
    mockGetIngredients.mockImplementation(async (params?: IngredientsParams) => {
      const query = params?.query?.toLowerCase() || '';
      if (query === 'yam') {
        return {
          ingredients: [],
          total: 0,
          offset: 0,
          limit: 200,
          has_more: false,
        };
      }
      return {
        ingredients: [
          { id: 1, name: 'Tomato' },
          { id: 2, name: 'Onion' },
        ],
        total: 2,
        offset: 0,
        limit: 200,
        has_more: false,
      };
    });

    renderWithProviders(
      <UserIngredientPicker
        userIngredients={[{ id: '1', selectedIngredient: null }]}
        setUserIngredients={setUserIngredients}
      />
    );
    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await user.type(input, 'yam');
    await waitFor(
      () => {
        expect(mockGetIngredients).toHaveBeenCalled();
        expect(screen.getByText(`Add "yam" as an ingredient`)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('displays a new ingredient in the input field when selected"', async () => {
    const initialUserIngredients: UserIngredientPickerInput[] = [
      { id: '1', selectedIngredient: null },
    ];
    const userIngredientsRef = { current: initialUserIngredients };
    const TestWrapper = () => {
      const [userIngredients, setUserIngredients] =
        useState<UserIngredientPickerInput[]>(initialUserIngredients);

      useEffect(() => {
        userIngredientsRef.current = userIngredients;
      }, [userIngredients]);

      return (
        <UserIngredientPicker
          userIngredients={userIngredients}
          setUserIngredients={setUserIngredients}
        />
      );
    };
    mockGetIngredients.mockResolvedValue({
      ingredients: [],
      total: 0,
      offset: 0,
      limit: 200,
      has_more: false,
    });

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await user.click(input);
    await user.clear(input);
    await user.paste('newingredient');

    await waitFor(
      () => {
        expect(input).toHaveValue('newingredient');
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(screen.getByText('Add "newingredient" as an ingredient')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    const addAsIngredientOption = screen.getByText('Add "newingredient" as an ingredient');
    await user.click(addAsIngredientOption);
    await waitFor(() => {
      const hasIngredient = userIngredientsRef.current.some(
        (item) => item.selectedIngredient?.name === 'newingredient'
      );
      expect(hasIngredient).toBe(true);
    });
  });

  it('displays an existing ingredient in the input field when selected', async () => {
    const initialUserIngredients: UserIngredientPickerInput[] = [
      { id: '1', selectedIngredient: null },
    ];
    const userIngredientsRef = { current: initialUserIngredients };
    const TestWrapper = () => {
      const [userIngredients, setUserIngredients] =
        useState<UserIngredientPickerInput[]>(initialUserIngredients);

      useEffect(() => {
        userIngredientsRef.current = userIngredients;
      }, [userIngredients]);

      return (
        <UserIngredientPicker
          userIngredients={userIngredients}
          setUserIngredients={setUserIngredients}
        />
      );
    };

    const existingIngredient: Ingredient = {
      id: 1,
      name: 'Tomato',
    };

    mockGetIngredients.mockResolvedValue({
      ingredients: [existingIngredient],
      total: 1,
      offset: 0,
      limit: 200,
      has_more: false,
    });

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
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
      const hasIngredient = userIngredientsRef.current.some(
        (item) => item.selectedIngredient?.name === 'Tomato' && item.selectedIngredient?.id === 1
      );
      expect(hasIngredient).toBe(true);
    });
  });

  it('allows user to add multiple ingredients when allowMultiple is set to true', async () => {
    const initialUserIngredients: UserIngredientPickerInput[] = [
      { id: '1', selectedIngredient: null },
    ];
    const userIngredientsRef = { current: initialUserIngredients };
    const TestWrapper = () => {
      const [userIngredients, setUserIngredients] =
        useState<UserIngredientPickerInput[]>(initialUserIngredients);

      useEffect(() => {
        userIngredientsRef.current = userIngredients;
      }, [userIngredients]);

      return (
        <UserIngredientPicker
          userIngredients={userIngredients}
          setUserIngredients={setUserIngredients}
          allowMultiple={true}
        />
      );
    };
    mockGetIngredients.mockResolvedValue({
      ingredients: [
        { id: 1, name: 'Tomato' },
        { id: 2, name: 'Onion' },
      ],
      total: 2,
      offset: 0,
      limit: 200,
      has_more: false,
    });

    renderWithProviders(<TestWrapper />);

    const addButton = screen.getByText(messages.addAnotherIngredient.defaultMessage);
    expect(addButton).toBeInTheDocument();
    const firstInput = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await user.type(firstInput, 'tomato');
    await waitFor(
      () => {
        expect(screen.getByText('Tomato')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    await user.click(screen.getByText('Tomato'));
    await waitFor(() => {
      expect(userIngredientsRef.current.length).toBe(1);
      expect(userIngredientsRef.current[0].selectedIngredient?.name).toBe('Tomato');
      expect(userIngredientsRef.current[0].selectedIngredient?.id).toBe(1);
    });

    await user.click(addButton);
    await waitFor(() => {
      expect(userIngredientsRef.current.length).toBe(2);
    });
    const inputs = screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(inputs.length).toBe(2);
    expect(inputs[0]).toHaveValue('Tomato');
    expect(inputs[1]).toHaveValue('');
    await user.type(inputs[1], 'onio');
    await waitFor(async () => {
      await user.click(inputs[1]);
      const onionOptionsAfterClick = screen.getAllByText('Onion');
      await user.click(onionOptionsAfterClick[onionOptionsAfterClick.length - 1]);
      expect(userIngredientsRef.current.length).toBe(2);
      expect(userIngredientsRef.current[0].selectedIngredient?.name).toBe('Tomato');
      expect(userIngredientsRef.current[0].selectedIngredient?.id).toBe(1);
      expect(userIngredientsRef.current[1].selectedIngredient?.name).toBe('Onion');
      expect(userIngredientsRef.current[1].selectedIngredient?.id).toBe(2);

      expect(screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage).length).toBe(
        2
      );
      expect(
        screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage)[0]
      ).toHaveValue('Tomato');
      expect(
        screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage)[1]
      ).toHaveValue('Onion');
      expect(screen.getAllByLabelText(messages.removeIngredient.defaultMessage).length).toBe(2);
    });
  });

  it('allows user to select existing ingredient in first input and new ingredient in second input when allowMultiple is set to true', async () => {
    const initialUserIngredients: UserIngredientPickerInput[] = [
      { id: '1', selectedIngredient: null },
    ];
    const userIngredientsRef = { current: initialUserIngredients };
    const TestWrapper = () => {
      const [userIngredients, setUserIngredients] =
        useState<UserIngredientPickerInput[]>(initialUserIngredients);

      useEffect(() => {
        userIngredientsRef.current = userIngredients;
      }, [userIngredients]);

      return (
        <UserIngredientPicker
          userIngredients={userIngredients}
          setUserIngredients={setUserIngredients}
          allowMultiple={true}
        />
      );
    };
    mockGetIngredients.mockImplementation(async (params?: IngredientsParams) => {
      const query = params?.query?.toLowerCase() || '';
      if (query === 'newingredient') {
        return {
          ingredients: [],
          total: 0,
          offset: 0,
          limit: 200,
          has_more: false,
        };
      }
      return {
        ingredients: [{ id: 1, name: 'Tomato' }],
        total: 1,
        offset: 0,
        limit: 200,
        has_more: false,
      };
    });

    renderWithProviders(<TestWrapper />);

    const addButton = screen.getByText(messages.addAnotherIngredient.defaultMessage);
    expect(addButton).toBeInTheDocument();
    const firstInput = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await user.type(firstInput, 'tomato');
    await waitFor(
      () => {
        expect(screen.getByText('Tomato')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    await user.click(screen.getByText('Tomato'));
    await waitFor(() => {
      expect(userIngredientsRef.current.length).toBe(1);
      expect(userIngredientsRef.current[0].selectedIngredient?.name).toBe('Tomato');
      expect(userIngredientsRef.current[0].selectedIngredient?.id).toBe(1);
    });

    await user.click(addButton);
    await waitFor(() => {
      expect(userIngredientsRef.current.length).toBe(2);
    });
    const inputs = screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(inputs.length).toBe(2);
    expect(inputs[0]).toHaveValue('Tomato');
    expect(inputs[1]).toHaveValue('');
    await user.click(inputs[1]);
    await user.clear(inputs[1]);
    await user.paste('newingredient');

    await waitFor(
      () => {
        expect(inputs[1]).toHaveValue('newingredient');
      },
      { timeout: 3000 }
    );

    await waitFor(async () => {
      await user.click(inputs[1]);
      const options = screen.getAllByText('Add "newingredient" as an ingredient');
      await user.click(options[options.length - 1]);
      expect(userIngredientsRef.current.length).toBe(2);
      expect(userIngredientsRef.current[0].selectedIngredient?.name).toBe('Tomato');
      expect(userIngredientsRef.current[0].selectedIngredient?.id).toBe(1);
      expect(userIngredientsRef.current[1].selectedIngredient?.name).toBe('newingredient');
      expect(userIngredientsRef.current[1].selectedIngredient?.id).toBeNull();
      expect(screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage).length).toBe(
        2
      );
      expect(
        screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage)[0]
      ).toHaveValue('Tomato');
      expect(
        screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage)[1]
      ).toHaveValue('newingredient');
      expect(screen.getAllByLabelText(messages.removeIngredient.defaultMessage).length).toBe(2);
    });
  });

  it('prevents user from adding multiple ingredients when allowMultiple is set to false', () => {
    const setUserIngredients = vi.fn();

    renderWithProviders(
      <UserIngredientPicker
        userIngredients={[{ id: '1', selectedIngredient: null }]}
        setUserIngredients={setUserIngredients}
        allowMultiple={false}
      />
    );
    expect(
      screen.queryByText(messages.addAnotherIngredient.defaultMessage)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(messages.removeIngredient.defaultMessage)
    ).not.toBeInTheDocument();
    const inputs = screen.getAllByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(inputs.length).toBe(1);
  });
});
