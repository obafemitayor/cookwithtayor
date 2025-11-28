import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';
import App from './App';
import { allMessages } from './i18n/messages';
import './index.css';

const locale = 'en';
const getMessages = (messages: Record<string, MessageDescriptor>): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(messages).map(([key, descriptor]) => [
      key,
      typeof descriptor.defaultMessage === 'string' ? descriptor.defaultMessage : '',
    ])
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntlProvider locale={locale} messages={getMessages(allMessages[locale])}>
      <ChakraProvider value={defaultSystem}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </IntlProvider>
  </StrictMode>
);
