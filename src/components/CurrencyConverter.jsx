import React, { useState, useEffect } from 'react';
import {
  HStack,
  Select,
  Input,
  Text,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  VStack,
  Icon
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';

const CurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState('AZN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState('');
  const [rates, setRates] = useState({
    USD: 1.7,  // 1 USD = 1.7 AZN
    EUR: 1.85, // 1 EUR = 1.85 AZN
    RUB: 0.018, // 1 RUB = 0.018 AZN
    AZN: 1
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Real-time valyuta kurslarını yükləmək üçün API çağırışı
    // Bu nümunədə sabit kurslar istifadə olunur, amma real API ilə əvəz edilə bilər
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      // Real API üçün: https://api.exchangerate-api.com/v4/latest/AZN
      // Bu nümunədə sabit kurslar istifadə olunur
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/AZN');
      // const data = await response.json();
      // setRates(data.rates);
    } catch (error) {
      console.error('Valyuta kursları yüklənərkən xəta:', error);
    }
  };

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        let convertedAmount = 0;

        if (fromCurrency === 'AZN') {
          convertedAmount = amountNum / rates[toCurrency];
        } else if (toCurrency === 'AZN') {
          convertedAmount = amountNum * rates[fromCurrency];
        } else {
          const aznAmount = amountNum * rates[fromCurrency];
          convertedAmount = aznAmount / rates[toCurrency];
        }

        setResult(convertedAmount.toFixed(4));
      } else {
        setResult('');
      }
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'RUB':
        return '₽';
      case 'AZN':
        return '₼';
      default:
        return '';
    }
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          colorScheme="blue"
          leftIcon={<Icon as={FaExchangeAlt} />}
          onClick={() => setIsOpen(!isOpen)}
        >
          <HStack spacing={1}>
            <Text fontSize="sm" fontWeight="medium">
              {getCurrencySymbol(fromCurrency)}/{getCurrencySymbol(toCurrency)}
            </Text>
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent width="320px">
        <PopoverBody p={4}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="md" fontWeight="bold" color="gray.700">
              Valyuta Konvertasiyası
            </Text>
            
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                From (Kimdən)
              </Text>
              <HStack spacing={2}>
                <Select
                  size="sm"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  width="100px"
                >
                  <option value="AZN">AZN (₼)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </Select>
                <Input
                  size="sm"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Məbləğ"
                  min="0"
                  step="0.01"
                />
              </HStack>
            </Box>

            <Box textAlign="center">
              <Icon as={FaExchangeAlt} color="blue.500" />
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                To (Kimə)
              </Text>
              <HStack spacing={2}>
                <Select
                  size="sm"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  width="100px"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="AZN">AZN (₼)</option>
                </Select>
                <Input
                  size="sm"
                  value={result || '0.0000'}
                  readOnly
                  bg="gray.50"
                  fontWeight="bold"
                  color="blue.600"
                />
              </HStack>
            </Box>

            {result && (
              <Box
                p={2}
                bg="blue.50"
                borderRadius="md"
                border="1px"
                borderColor="blue.200"
              >
                <Text fontSize="sm" color="gray.700" textAlign="center">
                  <Text as="span" fontWeight="bold" color="blue.600">
                    {amount} {fromCurrency}
                  </Text>
                  {' = '}
                  <Text as="span" fontWeight="bold" color="blue.600">
                    {result} {toCurrency}
                  </Text>
                </Text>
              </Box>
            )}

            <HStack spacing={2} fontSize="xs" color="gray.500" justify="center">
              <Text>Kurs: 1 USD = {rates.USD} AZN</Text>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencyConverter;

