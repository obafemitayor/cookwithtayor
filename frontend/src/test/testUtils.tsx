import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import type { MessageDescriptor } from 'react-intl';
import { allMessages } from '../i18n/messages';

/**
 * Converts messages from defineMessages format to flat object for IntlProvider
 */
export const convertMessagesForIntl = (
  messages: Record<string, MessageDescriptor>
): Record<string, string> => {
  return Object.keys(messages).reduce(
    (acc, key) => {
      const message = messages[key as keyof typeof messages];
      const defaultMessage =
        typeof message.defaultMessage === 'string' ? message.defaultMessage : '';
      acc[key] = defaultMessage;
      return acc;
    },
    {} as Record<string, string>
  );
};

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  messages?: Record<string, MessageDescriptor>;
  locale?: string;
  includeChakra?: boolean;
}

/**
 * Renders a component with ChakraProvider and IntlProvider
 * @param component - The component to render
 * @param options - Optional configuration
 * @param options.messages - Messages to use (defaults to allMessages.en)
 * @param options.locale - Locale to use (defaults to 'en')
 * @param options.includeChakra - Whether to include ChakraProvider (defaults to true)
 */
export const renderWithProviders = (
  component: React.ReactElement,
  options: RenderWithProvidersOptions = {}
) => {
  const {
    messages: providedMessages,
    locale = 'en',
    includeChakra = true,
    ...renderOptions
  } = options;

  // Use provided messages or default to allMessages
  const messagesForIntl = providedMessages
    ? convertMessagesForIntl(providedMessages)
    : convertMessagesForIntl(
        allMessages[locale as keyof typeof allMessages] as Record<string, MessageDescriptor>
      );

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const content = (
      <IntlProvider locale={locale} messages={messagesForIntl}>
        {children}
      </IntlProvider>
    );

    if (includeChakra) {
      return <ChakraProvider value={defaultSystem}>{content}</ChakraProvider>;
    }

    return content;
  };

  return render(component, { wrapper: Wrapper, ...renderOptions });
};
