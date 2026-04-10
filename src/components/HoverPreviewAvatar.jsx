import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Avatar,
  Box,
  Image,
} from '@chakra-ui/react';

/**
 * Hover / fokusda böyük önizləmə; mobil üçün yüngül scale (touch cihazlarda popover zəif ola bilər).
 */
const HoverPreviewAvatar = ({
  src,
  name,
  size = 'lg',
  onError,
}) => {
  const hasSrc = Boolean(src);

  return (
    <Popover trigger="hover" openDelay={120} closeDelay={180} placement="bottom-start" gutter={10}>
      <PopoverTrigger>
        <Box
          display="inline-block"
          borderRadius="full"
          cursor="pointer"
          transition="transform 0.2s ease-out"
          _hover={{ transform: { base: 'scale(1.06)', md: 'scale(1.12)' } }}
          sx={{
            '@media (hover: none)': {
              _hover: { transform: 'none' },
            },
          }}
        >
          <Avatar size={size} src={src || undefined} name={name} onError={onError} />
        </Box>
      </PopoverTrigger>
      <PopoverContent
        width="auto"
        maxW={{ base: 'min(92vw, 240px)', sm: 'min(90vw, 320px)' }}
        borderWidth="1px"
        boxShadow="2xl"
        _focus={{ boxShadow: '2xl' }}
      >
        <PopoverBody p={3}>
          {hasSrc ? (
            <Image
              src={src}
              alt={name || 'Profil şəkli'}
              maxW={{ base: '200px', sm: '280px' }}
              maxH={{ base: '200px', sm: '280px' }}
              width="auto"
              height="auto"
              objectFit="contain"
              borderRadius="md"
              mx="auto"
              display="block"
              onError={onError}
            />
          ) : (
            <Avatar size="2xl" name={name} mx="auto" display="block" />
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default HoverPreviewAvatar;
