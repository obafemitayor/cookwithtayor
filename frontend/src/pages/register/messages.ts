import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  welcome: {
    id: 'register.emailStep.welcome',
    defaultMessage: 'Let me help you cook up dinner, partner! 😉',
  },
  personalIntroduction: {
    id: 'register.emailStep.personalIntroduction',
    defaultMessage: `Hi, I'm Tayo, your go-to kitchen buddy 💪. I can show you the tastiest recipes you can make with whatever ingredients you already have in your kitchen. 
    
If you're ready to get cooking, you can start by telling me your email. That way, I can remember you and always have the perfect recipes waiting whenever you return. 
And if I've helped you before find something to cook 😉, just enter the same email and I'll show you what you can make right away.`,
  },
  addIngredientsMessage: {
    id: 'register.addIngredientsMessage',
    defaultMessage:
      "Great! Now tell me what you have in your kitchen and let's see what we can whip up. 👨‍🍳",
  },
  completeRegistration: {
    id: 'register.completeRegistration',
    defaultMessage: 'Show Me What I Can Cook!',
  },
  registrationFailed: {
    id: 'register.registrationFailed',
    defaultMessage: 'Unfortunately, I was unable to create your account. Please try again.',
  },
  atLeastOneIngredientRequired: {
    id: 'register.atLeastOneIngredientRequired',
    defaultMessage: 'You need at least one ingredient before I can show you what you can cook 😢',
  },
});
