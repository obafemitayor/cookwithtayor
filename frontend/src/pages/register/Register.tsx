import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Button, VStack, Text, Box, Heading } from '@chakra-ui/react';
import { AddEmailStep } from './components/AddEmailStep';
import { UserIngredientPicker } from '../../components/userIngredientPicker/UserIngredientPicker';
import type { UserIngredientPickerInput } from '../../types';
import { useUser } from '../../hooks/useUser';
import { buildUserIngredientsPayload } from '../../utils/userIngredientPayload';
import { localStorageUtils } from '../../utils/localStorage';
import { messages } from './messages';

export const Register: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'ingredients'>('email');
  const [email, setEmail] = useState('');
  const [userIngredients, setUserIngredients] = useState<UserIngredientPickerInput[]>([
    {
      id: '1',
      selectedIngredient: null,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const { loading, createUser } = useUser();

  const handleEmailSubmitted = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep('ingredients');
  };

  const registerUser = async () => {
    setError(null);
    const { ingredientsInDB, ingredientsNotInDB } = buildUserIngredientsPayload(userIngredients);
    if (ingredientsInDB.length === 0 && ingredientsNotInDB.length === 0) {
      setError(intl.formatMessage(messages.atLeastOneIngredientRequired));
      return;
    }

    try {
      const user = await createUser(email, {
        ingredientsInDB,
        ingredientsNotInDB,
      });
      localStorageUtils.setUserEmail(email);
      navigate(`/users/${user.id}/recipes`);
    } catch (err: unknown) {
      console.error(err);
      alert(intl.formatMessage(messages.registrationFailed));
    }
  };

  return (
    <Box
      minH="100vh"
      bg="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      w="100%"
    >
      <Box maxW="lg" w="100%">
        {step === 'email' && (
          <VStack gap={6} w="100%" textAlign="center">
            <Heading size="lg">{intl.formatMessage(messages.welcome)}</Heading>
            <Text color="gray.600" fontSize="md" lineHeight="tall">
              {intl.formatMessage(messages.personalIntroduction)}
            </Text>
            <AddEmailStep onEmailSubmitted={handleEmailSubmitted} />
          </VStack>
        )}
        {step === 'ingredients' && (
          <VStack gap={4} w="100%">
            <Text color="gray.600" fontSize="md" lineHeight="tall">
              {intl.formatMessage(messages.addIngredientsMessage)}
            </Text>
            <UserIngredientPicker
              userIngredients={userIngredients}
              setUserIngredients={setUserIngredients}
            />
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}
            <Button colorPalette="blue" size="lg" onClick={registerUser} loading={loading} w="100%">
              {intl.formatMessage(messages.completeRegistration)}
            </Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
};
