import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Box,
  Container,
  Heading,
  Spinner,
  Text,
  VStack,
  HStack,
  Image,
  Badge,
  Button,
  List,
} from '@chakra-ui/react';
import { useRecipeDetails } from '../../hooks/useRecipeDetails';
import { messages } from './messages';

export const RecipeDetails: React.FC = () => {
  const intl = useIntl();
  const { userId, recipeId } = useParams<{ userId: string; recipeId: string }>();
  const navigate = useNavigate();
  const { recipe, loading, error, getRecipeDetails } = useRecipeDetails();

  useEffect(() => {
    if (userId && recipeId) {
      getRecipeDetails(Number(userId), Number(recipeId));
    }
  }, [userId, recipeId, getRecipeDetails]);

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
        <Text mt={8} color="red.500">
          {intl.formatMessage(messages.failedToLoadRecipe)}
        </Text>
        <Button mt={4} onClick={() => navigate(-1)}>
          {intl.formatMessage(messages.goBack)}
        </Button>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container centerContent>
        <Text mt={8} color="red.500">
          {intl.formatMessage(messages.recipeNotFound)}
        </Text>
        <Button mt={4} onClick={() => navigate(-1)}>
          {intl.formatMessage(messages.goBack)}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={6} align="stretch">
        <Button
          onClick={() => navigate(-1)}
          variant="solid"
          colorPalette="blue"
          color="white"
          alignSelf="flex-start"
        >
          {intl.formatMessage(messages.back)}
        </Button>

        {recipe.image_url && (
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            h="400px"
            w="100%"
            objectFit="cover"
            borderRadius="lg"
          />
        )}

        <Heading>{recipe.name}</Heading>

        <HStack gap={4}>
          {recipe.cook_time != null && (
            <Badge colorScheme="blue">
              {recipe.cook_time === 0
                ? intl.formatMessage(messages.noCookingRequired)
                : `${intl.formatMessage(messages.cook)}: ${recipe.cook_time} ${intl.formatMessage(messages.min)}`}
            </Badge>
          )}
          {recipe.prep_time && (
            <Badge colorScheme="purple">
              {intl.formatMessage(messages.prep)}: {recipe.prep_time}{' '}
              {intl.formatMessage(messages.min)}
            </Badge>
          )}
          {recipe.ratings && (
            <Badge colorScheme="yellow">
              {intl.formatMessage(messages.rating)}: {recipe.ratings}
            </Badge>
          )}
        </HStack>

        <Box>
          <Heading size="md" mb={4}>
            {intl.formatMessage(messages.ingredients)}
          </Heading>
          <List.Root>
            {recipe.ingredients.map((ingredient, index) => (
              <List.Item key={index}>
                <Text>{ingredient}</Text>
              </List.Item>
            ))}
          </List.Root>
        </Box>

        {recipe.missing_ingredients.length === 0 && (
          <Box>
            <Text fontSize="md" color="green.500" fontWeight="medium">
              {intl.formatMessage(messages.allIngredientsAvailable)}
            </Text>
          </Box>
        )}

        {recipe.missing_ingredients.length > 0 && (
          <Box>
            <Text
              fontSize="md"
              mb={4}
              fontWeight="medium"
              color={recipe.missing_ingredients.length <= 5 ? 'orange.500' : 'red.500'}
            >
              {recipe.missing_ingredients.length <= 5
                ? intl.formatMessage(messages.closeToCooking)
                : intl.formatMessage(messages.kitchenNotStocked)}
            </Text>
            <List.Root>
              {recipe.missing_ingredients.map((ingredient, index) => (
                <List.Item key={index}>
                  <Text>{ingredient}</Text>
                </List.Item>
              ))}
            </List.Root>
          </Box>
        )}
      </VStack>
    </Container>
  );
};
