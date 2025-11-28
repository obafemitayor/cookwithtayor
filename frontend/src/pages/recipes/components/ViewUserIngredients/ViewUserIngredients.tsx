import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Button } from '@chakra-ui/react';
import { messages } from './messages';

interface ViewUserIngredientsProps {
  userId: number;
}

export const ViewUserIngredients: React.FC<ViewUserIngredientsProps> = ({ userId }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate(`/users/${userId}/user-ingredients`)}
      variant="solid"
      colorPalette="gray"
      color="white"
    >
      {intl.formatMessage(messages.manageUserIngredients)}
    </Button>
  );
};
