import React from 'react';
import { useIntl } from 'react-intl';
import { Box, Combobox, Spinner } from '@chakra-ui/react';
import { useListCollection } from '@ark-ui/react';
import type { Ingredient } from '../../../types';
import { messages } from '../messages';
import { parseIngredient } from '../../../utils/ingredientParser';

export interface IngredientsSelectProps {
  inputId: string;
  value: string;
  collection: ReturnType<typeof useListCollection<{ value: string; label: string }>>['collection'];
  ingredients: Ingredient[];
  loading?: boolean;
  onInputChange: (id: string, value: string) => void;
  onIngredientSelect: (id: string, ingredient: Ingredient | null) => void;
}

export const IngredientsSelect: React.FC<IngredientsSelectProps> = ({
  inputId,
  value,
  collection,
  ingredients,
  loading = false,
  onInputChange,
  onIngredientSelect,
}) => {
  const intl = useIntl();

  // The Combobox's onValueChange callback can return either a string or string[] because
  // Chakra UI's Combobox component supports both single and multiple selection modes.
  // Even though we only use single selection here, the API maintains consistency by
  // always potentially returning an array. We handle this by taking the first element
  // if it's an array, or using the string directly.
  const handleValueChange = (e: { value: string | string[] }) => {
    const selectedValue = Array.isArray(e.value) ? e.value[0] : e.value;
    const selectedIngredient = ingredients.find((ingredient) =>
      ingredient.id !== null
        ? ingredient.id.toString() === selectedValue
        : ingredient.name === selectedValue
    );
    if (selectedIngredient) {
      const parsedIngredient = parseIngredient(selectedIngredient);
      onInputChange(inputId, parsedIngredient.name);
    }
    onIngredientSelect(inputId, selectedIngredient || null);
  };

  return (
    <Box w="100%">
      <Combobox.Root
        collection={collection}
        value={[]}
        inputValue={value}
        onInputValueChange={(e) => onInputChange(inputId, e.inputValue)}
        onValueChange={handleValueChange}
      >
        <Combobox.Control w="100%">
          <Combobox.Input placeholder={intl.formatMessage(messages.searchPlaceholder)} w="100%" />
          {loading && (
            <Combobox.IndicatorGroup>
              <Spinner size="sm" />
            </Combobox.IndicatorGroup>
          )}
        </Combobox.Control>
        <Combobox.Positioner>
          <Combobox.Content>
            {ingredients.length > 0 && (
              <Combobox.ItemGroup>
                {ingredients.map((ingredient) => {
                  const itemKey =
                    ingredient.id !== null ? ingredient.id.toString() : ingredient.name;
                  return (
                    <Combobox.Item key={itemKey} item={itemKey}>
                      {ingredient.name}
                    </Combobox.Item>
                  );
                })}
              </Combobox.ItemGroup>
            )}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </Box>
  );
};
