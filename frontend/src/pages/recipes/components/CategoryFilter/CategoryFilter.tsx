import React, { useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box, Combobox, Spinner } from '@chakra-ui/react';
import { useListCollection } from '@ark-ui/react';
import { messages } from './messages';

interface CategoryFilterProps {
  categoryId: number | undefined;
  onCategoryChange: (categoryId: number | undefined) => void;
  categories: Array<{ id: number; name: string }>;
  onInputChange: (value: string) => void;
  loading?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categoryId,
  onCategoryChange,
  categories,
  onInputChange,
  loading,
}) => {
  const intl = useIntl();
  const [inputValue, setInputValue] = useState<string>('');
  const prevCategoryIdRef = useRef<number | undefined>(categoryId);
  const { collection, set: setCollection } = useListCollection<{ value: string; label: string }>({
    initialItems: [],
  });

  useEffect(() => {
    setCollection([
      { value: '', label: intl.formatMessage(messages.categoriesFilter) },
      ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
    ]);
  }, [categories, intl, setCollection]);

  useEffect(() => {
    if (prevCategoryIdRef.current === categoryId) {
      return;
    }
    prevCategoryIdRef.current = categoryId;

    if (!categoryId) {
      setInputValue('');
      return;
    }
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (selectedCategory) {
      setInputValue(selectedCategory.name);
    }
  }, [categoryId, categories]);

  const handleInputValueChange = (e: { inputValue: string }) => {
    setInputValue(e.inputValue);
    onInputChange(e.inputValue);
  };

  const handleValueChange = (e: { value: string | string[] }) => {
    const selectedValue = Array.isArray(e.value) ? e.value[0] : e.value;
    if (selectedValue === '') {
      onCategoryChange(undefined);
      setInputValue('');
      return;
    }
    onCategoryChange(selectedValue ? Number(selectedValue) : undefined);
  };

  return (
    <Box maxW="200px">
      <Combobox.Root
        collection={collection}
        value={categoryId ? [categoryId.toString()] : []}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
      >
        <Combobox.Control bg="white">
          <Combobox.Input
            placeholder={intl.formatMessage(messages.categoriesFilter)}
            value={inputValue}
            color="gray.900"
            bg="white"
          />
          {loading && (
            <Combobox.IndicatorGroup>
              <Spinner size="sm" />
            </Combobox.IndicatorGroup>
          )}
        </Combobox.Control>
        <Combobox.Positioner>
          <Combobox.Content>
            {categories.length === 0 && !loading && (
              <Combobox.Empty>{intl.formatMessage(messages.noCategories)}</Combobox.Empty>
            )}
            {categories.length > 0 && (
              <Combobox.ItemGroup>
                <Combobox.Item key="all" item="">
                  {intl.formatMessage(messages.categoriesFilter)}
                </Combobox.Item>
                {categories.map((category) => (
                  <Combobox.Item key={category.id} item={category.id.toString()}>
                    {category.name}
                  </Combobox.Item>
                ))}
              </Combobox.ItemGroup>
            )}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>
    </Box>
  );
};
