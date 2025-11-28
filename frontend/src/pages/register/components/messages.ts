import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  emailPlaceholder: {
    id: 'register.emailStep.emailPlaceholder',
    defaultMessage: 'Enter your email',
  },
  continue: {
    id: 'register.emailStep.continue',
    defaultMessage: 'Continue',
  },
  emailRequired: {
    id: 'register.emailStep.emailRequired',
    defaultMessage: 'Unfortunately, I will need your email to proceed. 😢',
  },
  emailInvalid: {
    id: 'register.emailStep.emailInvalid',
    defaultMessage: 'Oops, looks like your email address is not valid. Please try again.',
  },
});
