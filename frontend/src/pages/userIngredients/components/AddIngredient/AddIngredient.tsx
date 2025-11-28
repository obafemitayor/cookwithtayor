import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, VStack, HStack, Text } from '@chakra-ui/react';
import { UserIngredientPicker } from '../../../../components/userIngredientPicker/UserIngredientPicker';
import { useUserIngredients } from '../../../../hooks/useUserIngredients';
import { buildUserIngredientsPayload } from '../../../../utils/userIngredientPayload';
import type { UserIngredientPickerInput } from '../../../../types';
import { messages } from './messages';

interface AddIngredientProps {
  userId: number | undefined;
  onSave: () => void;
  onCancel: () => void;
}

export const AddIngredient: React.FC<AddIngredientProps> = ({ userId, onSave, onCancel }) => {
  const intl = useIntl();
  const [userIngredients, setUserIngredients] = useState<UserIngredientPickerInput[]>([
    {
      id: '1',
      selectedIngredient: null,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const { loading, addIngredients } = useUserIngredients(userId);

  const handleSave = async () => {
    if (!userId) {
      return;
    }
    setError(null);
    const { ingredientsInDB, ingredientsNotInDB } = buildUserIngredientsPayload(userIngredients);
    if (ingredientsInDB.length === 0 && ingredientsNotInDB.length === 0) {
      setError(intl.formatMessage(messages.atLeastOneIngredientRequired));
      return;
    }
    try {
      await addIngredients({
        ingredientsInDB,
        ingredientsNotInDB,
      });
      onSave();
    } catch (err: unknown) {
      console.error(err);
      alert(intl.formatMessage(messages.failedToAdd));
    }
  };

  return (
    <VStack gap={4}>
      <UserIngredientPicker
        userIngredients={userIngredients}
        setUserIngredients={setUserIngredients}
      />
      {error && (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      )}
      <HStack gap={2}>
        <Button
          colorPalette="blue"
          size="lg"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
        >
          {intl.formatMessage(messages.add)}
        </Button>
        <Button
          onClick={onCancel}
          variant="solid"
          bg="red.500"
          color="white"
          _hover={{ bg: 'red.600' }}
          size="lg"
        >
          {intl.formatMessage(messages.cancel)}
        </Button>
      </HStack>
    </VStack>
  );
};
