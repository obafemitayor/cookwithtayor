import React, { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, Select } from '@chakra-ui/react';
import { useListCollection } from '@ark-ui/react';
import { messages } from './messages';

interface CuisineFilterProps {
  cuisineId: number | undefined;
  onCuisineChange: (cuisineId: number | undefined) => void;
  cuisines: Array<{ id: number; name: string }>;
}

export const CuisineFilter: React.FC<CuisineFilterProps> = ({
  cuisineId,
  onCuisineChange,
  cuisines,
}) => {
  const intl = useIntl();

  const selectItems = useMemo(
    () => [
      { value: '', label: intl.formatMessage(messages.cuisinesFilter) },
      ...cuisines.map((cuisine) => ({ value: cuisine.id.toString(), label: cuisine.name })),
    ],
    [cuisines, intl]
  );

  const { collection, set: setCollection } = useListCollection({
    initialItems: selectItems,
  });

  useEffect(() => {
    setCollection(selectItems);
  }, [selectItems, setCollection]);

  const selectedCuisine = cuisines.find((cuisine) => cuisine.id === cuisineId);
  const selectedValue = selectedCuisine ? selectedCuisine.id.toString() : '';

  return (
    <Box minW="200px" maxW="250px">
      <Select.Root
        collection={collection}
        value={selectedValue ? [selectedValue] : []}
        onValueChange={(e) => {
          const selectedValue = Array.isArray(e.value) ? e.value[0] : e.value;
          if (selectedValue === '') {
            onCuisineChange(undefined);
          } else {
            onCuisineChange(selectedValue ? Number(selectedValue) : undefined);
          }
        }}
      >
        <Select.HiddenSelect />
        <Select.Control bg="white" color="gray.900">
          <Select.Trigger bg="white" color="gray.900">
            <Select.ValueText
              placeholder={intl.formatMessage(messages.cuisinesFilter)}
              color="gray.900"
            />
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {selectItems.map((item) => (
              <Select.Item key={item.value || 'all'} item={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </Box>
  );
};
