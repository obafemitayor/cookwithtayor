import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Box,
  Card,
  Avatar,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  HStack,
  Button,
} from '@chakra-ui/react';
import { useRecipes } from '../../hooks/useRecipes';
import { useCategories } from '../../hooks/useCategories';
import { useCuisines } from '../../hooks/useCuisines';
import type { Recipe } from '../../types';
import { messages } from './messages';
import { CategoryFilter } from './components/CategoryFilter/CategoryFilter';
import { CuisineFilter } from './components/CuisineFilter/CuisineFilter';
import { ViewUserIngredients } from './components/ViewUserIngredients/ViewUserIngredients';

const getRecipeBadgeInfo = (
  missingCount: number | undefined | null,
  intl: ReturnType<typeof useIntl>
): { bgColor: string; message: string } => {
  const count = missingCount || 0;
  const category = count === 0 ? 'none' : count <= 5 ? 'few' : 'many';
  switch (category) {
    case 'none':
      return {
        bgColor: 'green.500',
        message: intl.formatMessage(messages.canFullyCook),
      };
    case 'few':
      return {
        bgColor: 'orange.500',
        message: intl.formatMessage(messages.needFewIngredients, { count }),
      };
    case 'many':
      return {
        bgColor: 'red.500',
        message: intl.formatMessage(messages.needManyIngredients),
      };
  }
};

const paginateRecipes = (recipes: Recipe[], currentPage: number, itemsPerPage: number) => {
  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = recipes.slice(startIndex, endIndex);

  return {
    currentRecipes,
    totalPages,
  };
};

export const Recipes: React.FC = () => {
  const intl = useIntl();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const {
    recipes,
    loading: recipesLoading,
    getMostRelevantRecipes,
    error: recipesError,
  } = useRecipes();
  const {
    categories,
    loading: categoriesLoading,
    searchCategories,
    error: categoriesError,
  } = useCategories();
  const { cuisines, loading: cuisinesLoading, error: cuisinesError } = useCuisines();
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [cuisineId, setCuisineId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Doing Client-Side Pagination because the API returns a maximum of 100 recipes.
  const { currentRecipes, totalPages } = paginateRecipes(recipes, currentPage, itemsPerPage);
  const parsedUserId = userId ? Number(userId) : undefined;

  useEffect(() => {
    if (parsedUserId) {
      getMostRelevantRecipes(parsedUserId, {
        categoryId,
        cuisineId,
      });
      setCurrentPage(1);
    }
  }, [parsedUserId, categoryId, cuisineId, getMostRelevantRecipes]);

  const handleRecipeClick = (recipeId: number) => {
    if (parsedUserId) {
      navigate(`/users/${parsedUserId}/recipes/${recipeId}`);
    }
  };

  if (recipesLoading || cuisinesLoading) {
    return (
      <Container centerContent>
        <Spinner size="xl" mt={8} />
      </Container>
    );
  }

  if (recipesError || categoriesError || cuisinesError) {
    return (
      <Container centerContent>
        <Text mt={8} color="red.500">
          {intl.formatMessage(messages.errorLoadingData)}
        </Text>
      </Container>
    );
  }

  if (!parsedUserId) {
    return (
      <Container centerContent>
        <Text mt={8}>{intl.formatMessage(messages.userNotFound)}</Text>
      </Container>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <Container centerContent>
        <Text mt={8}>{intl.formatMessage(messages.recipesNotFound)}</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Heading>{intl.formatMessage(messages.recommendedRecipes)}</Heading>

        <HStack gap={4} justify="space-between">
          <HStack gap={4}>
            <CategoryFilter
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
              categories={categories}
              onInputChange={searchCategories}
              loading={categoriesLoading}
            />
            <CuisineFilter
              cuisineId={cuisineId}
              onCuisineChange={setCuisineId}
              cuisines={cuisines}
            />
          </HStack>
          <ViewUserIngredients userId={parsedUserId} />
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {currentRecipes.map((recipe) => {
            const { bgColor: badgeBgColor, message: badgeMessage } = getRecipeBadgeInfo(
              recipe.total_ingredients_missing_for_recipe,
              intl
            );
            return (
              <Card.Root
                key={recipe.id}
                cursor="pointer"
                onClick={() => handleRecipeClick(recipe.id)}
                _hover={{ shadow: 'md' }}
                transition="all 0.2s"
              >
                <Card.Body gap={2}>
                  <Avatar.Root size="lg" shape="rounded">
                    {recipe.image_url && <Avatar.Image src={recipe.image_url} alt={recipe.name} />}
                    <Avatar.Fallback name={recipe.name} />
                  </Avatar.Root>
                  <Card.Title mt={2}>{recipe.name}</Card.Title>
                  <Box mt={2}>
                    <VStack align="start" gap={1}>
                      {recipe.cook_time != null && (
                        <Text fontSize="sm">
                          {recipe.cook_time === 0
                            ? intl.formatMessage(messages.noCookingRequired)
                            : `${intl.formatMessage(messages.cook)}: ${recipe.cook_time} ${intl.formatMessage(messages.min)}`}
                        </Text>
                      )}
                      {recipe.prep_time && (
                        <Text fontSize="sm">
                          {intl.formatMessage(messages.prep)}: {recipe.prep_time}{' '}
                          {intl.formatMessage(messages.min)}
                        </Text>
                      )}
                      {recipe.ratings && (
                        <Text fontSize="sm">
                          {intl.formatMessage(messages.rating)}: {recipe.ratings}
                        </Text>
                      )}
                      <Box
                        bg={badgeBgColor}
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="md"
                        mt={2}
                        w="fit-content"
                        fontSize="sm"
                      >
                        {badgeMessage}
                      </Box>
                    </VStack>
                  </Box>
                </Card.Body>
              </Card.Root>
            );
          })}
        </SimpleGrid>

        {totalPages > 1 && (
          <HStack justify="center" gap={2} mt={4}>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="solid"
              colorPalette="blue"
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="solid"
              colorPalette="blue"
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>
    </Container>
  );
};
