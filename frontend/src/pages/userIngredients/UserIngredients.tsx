import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Container, Heading, Spinner, Text, VStack, HStack, Button } from '@chakra-ui/react';
import { useUserIngredients } from '../../hooks/useUserIngredients';
import { IngredientList } from './components/IngredientList/IngredientList';
import { AddIngredient } from './components/AddIngredient/AddIngredient';
import { messages } from './messages';

export const UserIngredients: React.FC = () => {
  const intl = useIntl();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const userIdNumber = userId ? Number(userId) : undefined;
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const {
    ingredients,
    loading,
    error,
    hasMore,
    hasPrevious,
    getUserIngredients,
    loadNextPage,
    loadPreviousPage,
  } = useUserIngredients(userIdNumber);

  useEffect(() => {
    getUserIngredients();
  }, [getUserIngredients]);

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" mt={8} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent>
        <Text color="red.500" mt={8}>
          {intl.formatMessage(messages.failedToLoadIngredients)}
        </Text>
      </Container>
    );
  }

  const addNewIngredient = () => {
    setIsAddingIngredient(true);
  };

  const handleCancelAddNewIngredients = () => {
    setIsAddingIngredient(false);
  };

  const handleSaveNewIngredients = async () => {
    await getUserIngredients();
    setIsAddingIngredient(false);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <HStack justify="space-between">
          <Heading>{intl.formatMessage(messages.manageUserIngredients)}</Heading>
          <Button onClick={() => navigate(-1)} variant="solid" colorPalette="blue">
            {intl.formatMessage(messages.backToHome)}
          </Button>
        </HStack>

        {isAddingIngredient && (
          <AddIngredient
            userId={userIdNumber}
            onCancel={handleCancelAddNewIngredients}
            onSave={handleSaveNewIngredients}
          />
        )}

        {!isAddingIngredient && (
          <>
            <Button onClick={addNewIngredient} colorPalette="blue" w="fit-content">
              {intl.formatMessage(messages.addIngredient)}
            </Button>

            <IngredientList userIngredientsList={ingredients} userId={userIdNumber} />

            {(hasMore || hasPrevious) && (
              <HStack justify="center" gap={2}>
                <Button
                  onClick={loadPreviousPage}
                  disabled={!hasPrevious || loading}
                  variant="solid"
                  colorPalette="blue"
                >
                  {intl.formatMessage(messages.previous)}
                </Button>
                <Button
                  onClick={loadNextPage}
                  disabled={!hasMore || loading}
                  variant="solid"
                  colorPalette="blue"
                >
                  {intl.formatMessage(messages.next)}
                </Button>
              </HStack>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};
