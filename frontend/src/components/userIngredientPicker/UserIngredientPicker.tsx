import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Field,
} from '@chakra-ui/react';
import { MdDelete } from 'react-icons/md';
import { useListCollection } from '@ark-ui/react';
import type { Ingredient, UserIngredientPickerInput } from '../../types';
import { useIngredients } from '../../hooks/useIngredients';
import { messages } from './messages';
import { IngredientsSelect } from './IngredientsSelect/IngredientsSelect';
import { parseValue, parseIngredient } from '../../utils/ingredientParser';

interface UserIngredientPickerProps {
  userIngredients: UserIngredientPickerInput[];
  setUserIngredients: React.Dispatch<React.SetStateAction<UserIngredientPickerInput[]>>;
  allowMultiple?: boolean;
}

export const UserIngredientPicker: React.FC<UserIngredientPickerProps> = ({
  userIngredients,
  setUserIngredients,
  allowMultiple = true,
}) => {
  const intl = useIntl();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const { ingredients, loading, searchIngredients, reset } = useIngredients();
  const { collection, set: setCollection } = useListCollection<{ value: string; label: string }>({
    initialItems: [],
  });

  useEffect(() => {
    setCollection(
      ingredients.map((ing) => ({
        value: ing.id !== null ? ing.id.toString() : ing.name,
        label: ing.name,
      }))
    );
  }, [ingredients, setCollection]);

  const handleInputChange = (id: string, value: string) => {
    const parsedValue = parseValue(value.trim()) || value;
    setInputValues((prev) => ({ ...prev, [id]: parsedValue }));
    const searchQuery = parsedValue.trim();
    if (!searchQuery) {
      reset();
      setCollection([]);
      setActiveInputId(null);
      setUserIngredients((prev) =>
        prev.map((input) => (input.id === id ? { ...input, selectedIngredient: null } : input))
      );
      return;
    }
    reset();
    setCollection([]);
    setActiveInputId(id);
    searchIngredients(searchQuery);
  };

  const handleIngredientSelect = (id: string, selectedIngredient: Ingredient | null) => {
    if (!selectedIngredient) {
      return;
    }
    const parsedIngredient = parseIngredient(selectedIngredient);
    setUserIngredients((prev) =>
      prev.map((input) =>
        input.id === id ? { ...input, selectedIngredient: parsedIngredient } : input
      )
    );
    setActiveInputId(null);
    reset();
  };

  const addUserIngredient = () => {
    const newId = Date.now().toString();
    setInputValues((prev) => ({ ...prev, [newId]: '' }));
    setUserIngredients((prev) => [...prev, { id: newId, selectedIngredient: null }]);
  };

  const removeUserIngredient = (id: string) => {
    setUserIngredients((prev) => prev.filter((input) => input.id !== id));
    setInputValues((prev) => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  return (
    <Container maxW="lg" centerContent>
      <Box w="100%" mt={8}>
        <VStack gap={6}>
          <Heading size="lg">{intl.formatMessage(messages.title)}</Heading>
          <Text fontSize="sm" color="gray.600" textAlign="left" whiteSpace="pre-line">
            {intl.formatMessage(messages.guideText)}
          </Text>

          <VStack gap={4} w="100%">
            {userIngredients.map((input) => (
              <Field.Root key={input.id} w="100%">
                <HStack gap={2}>
                  <Box flex={1} w="100%">
                    <IngredientsSelect
                      inputId={input.id}
                      value={
                        inputValues[input.id] !== undefined
                          ? inputValues[input.id]
                          : input.selectedIngredient?.name || ''
                      }
                      collection={collection}
                      ingredients={ingredients}
                      loading={loading && activeInputId === input.id}
                      onInputChange={handleInputChange}
                      onIngredientSelect={handleIngredientSelect}
                    />
                  </Box>
                  {allowMultiple && (
                    <IconButton
                      aria-label={intl.formatMessage(messages.removeIngredient)}
                      onClick={() => removeUserIngredient(input.id)}
                      bg="white"
                      color="red.500"
                      variant="ghost"
                      _hover={{ bg: 'gray.50', color: 'red.600' }}
                    >
                      <MdDelete aria-hidden="true" />
                    </IconButton>
                  )}
                </HStack>
              </Field.Root>
            ))}

            {allowMultiple && (
              <HStack w="100%" justify="flex-end" mt={2}>
                <Button
                  onClick={addUserIngredient}
                  variant="solid"
                  bg="green.500"
                  color="white"
                  _hover={{ bg: 'green.600' }}
                  size="sm"
                >
                  {intl.formatMessage(messages.addAnotherIngredient)}
                </Button>
              </HStack>
            )}
          </VStack>
        </VStack>
      </Box>
    </Container>
  );
};
