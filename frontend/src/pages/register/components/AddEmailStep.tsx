import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { localStorageUtils } from '../../../utils/localStorage';
import { messages } from './messages';
import { useUser } from '../../../hooks/useUser';

interface AddEmailStepProps {
  onEmailSubmitted: (email: string) => void;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const AddEmailStep = ({ onEmailSubmitted }: AddEmailStepProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { loading: userLoading, fetchUserByEmail } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError(intl.formatMessage(messages.emailRequired));
      return;
    }
    if (!validateEmail(email)) {
      setError(intl.formatMessage(messages.emailInvalid));
      return;
    }

    const fetchedUser = await fetchUserByEmail(email);
    if (!fetchedUser) {
      onEmailSubmitted(email);
      return;
    }
    localStorageUtils.setUserEmail(email);
    navigate(`/users/${fetchedUser.id}/recipes`);
  };

  return (
    <VStack gap={4} w="100%">
      <Box as="form" onSubmit={handleSubmit} w="100%">
        <VStack gap={4}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={intl.formatMessage(messages.emailPlaceholder)}
            size="lg"
          />
          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            w="100%"
            loading={userLoading}
            disabled={userLoading}
          >
            {intl.formatMessage(messages.continue)}
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
};
