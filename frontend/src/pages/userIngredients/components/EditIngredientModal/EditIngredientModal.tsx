import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Button, Dialog, VStack, HStack } from '@chakra-ui/react';
import { UserIngredientPicker } from '../../../../components/userIngredientPicker/UserIngredientPicker';
import { useUserIngredients } from '../../../../hooks/useUserIngredients';
import type { UserIngredient, UserIngredientPickerInput } from '../../../../types';
import { messages } from './messages';

interface EditIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: UserIngredient | null;
  userId: number | undefined;
}

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  isOpen,
  onClose,
  ingredient,
  userId,
}) => {
  const intl = useIntl();
  const { updateIngredient, loading } = useUserIngredients(userId);
  const [userIngredients, setUserIngredients] = useState<UserIngredientPickerInput[]>([]);

  useEffect(() => {
    if (!ingredient) {
      setUserIngredients([]);
      return;
    }
    // UserIngredientPicker expects an array, but in edit mode we only ever have one ingredient
    setUserIngredients([
      {
        id: ingredient.id.toString(),
        selectedIngredient: {
          id: ingredient.ingredient_id,
          name: ingredient.ingredient?.name || '',
        },
      },
    ]);
  }, [ingredient]);

  const handleSave = async () => {
    const currentIngredient = ingredient;
    // userIngredients array will always have one element
    // (which is the new value of the ingredient that is being edited) because this is an edit.
    const updatedIngredient = userIngredients[0];
    if (!currentIngredient || !updatedIngredient?.selectedIngredient) {
      return;
    }
    const updatedIngredientPayload = {
      id: updatedIngredient.selectedIngredient.id,
      name: updatedIngredient.selectedIngredient.name,
    };

    try {
      await updateIngredient(currentIngredient.id, updatedIngredientPayload);
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      alert(error.message || intl.formatMessage(messages.failedToUpdate));
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{intl.formatMessage(messages.editIngredient)}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap={4}>
              <UserIngredientPicker
                userIngredients={userIngredients}
                setUserIngredients={setUserIngredients}
                allowMultiple={false}
              />
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack gap={2}>
              <Button
                onClick={handleSave}
                variant="solid"
                bg="black"
                color="white"
                _hover={{ bg: 'gray.800' }}
                loading={loading}
                disabled={loading}
              >
                {intl.formatMessage(messages.saveChanges)}
              </Button>
              <Button
                onClick={onClose}
                variant="solid"
                bg="red.500"
                color="white"
                _hover={{ bg: 'red.600' }}
                disabled={loading}
              >
                {intl.formatMessage(messages.cancel)}
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
