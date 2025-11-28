import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, Table, HStack, IconButton, Text } from '@chakra-ui/react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useUserIngredients } from '../../../../hooks/useUserIngredients';
import type { UserIngredient } from '../../../../types';
import { messages } from './messages';
import { EditIngredientModal } from '../EditIngredientModal/EditIngredientModal';

interface IngredientListProps {
  userId: number | undefined;
  userIngredientsList: UserIngredient[];
}

export const IngredientList: React.FC<IngredientListProps> = ({ userId, userIngredientsList }) => {
  const intl = useIntl();
  const { deleteIngredient, loading } = useUserIngredients(userId);
  const [editingIngredient, setEditingIngredient] = useState<UserIngredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingIngredientId, setDeletingIngredientId] = useState<number | null>(null);

  const handleEdit = (ingredient: UserIngredient) => {
    setEditingIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
  };

  const handleDelete = async (ingredientId: number) => {
    if (!window.confirm(intl.formatMessage(messages.confirmDelete))) {
      return;
    }
    setDeletingIngredientId(ingredientId);
    try {
      await deleteIngredient(ingredientId);
      window.location.reload();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      alert(error.message || intl.formatMessage(messages.failedToDelete));
      setDeletingIngredientId(null);
    }
  };

  if (userIngredientsList.length === 0) {
    return <Text>{intl.formatMessage(messages.noIngredients)}</Text>;
  }

  return (
    <>
      <Box overflowX="auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{intl.formatMessage(messages.ingredientName)}</Table.ColumnHeader>
              <Table.ColumnHeader>{intl.formatMessage(messages.actions)}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {userIngredientsList.map((userIngredient) => (
              <Table.Row key={userIngredient.id}>
                <Table.Cell>{userIngredient.ingredient?.name || ''}</Table.Cell>
                <Table.Cell>
                  <HStack>
                    <IconButton
                      aria-label={intl.formatMessage(messages.editIngredient)}
                      onClick={() => handleEdit(userIngredient)}
                      size="sm"
                    >
                      <MdEdit aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      aria-label={intl.formatMessage(messages.deleteIngredient)}
                      onClick={() => handleDelete(userIngredient.id)}
                      size="sm"
                      colorPalette="red"
                      loading={loading && deletingIngredientId === userIngredient.id}
                      disabled={loading && deletingIngredientId === userIngredient.id}
                    >
                      <MdDelete aria-hidden="true" />
                    </IconButton>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <EditIngredientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ingredient={editingIngredient}
        userId={userId}
      />
    </>
  );
};
