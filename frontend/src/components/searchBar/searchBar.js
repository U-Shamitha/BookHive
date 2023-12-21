import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ sendSearchTerm }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    sendSearchTerm(searchTerm);
  };

  const handleKeyDown = (e) => {
    if(e.key=="Enter"){
      sendSearchTerm(searchTerm)
    }
  }

  return (
    <Container
      style={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '400px',
        height:'30px'
      }}
    >
      <TextField
        label="Search"
        // variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        size='small'
        style={{
            background: 'rgba(255, 255, 255, 0.9)', // Inner background color (white)
            borderRadius: '5px',
            borderColor: '#1976D2'
          }}
        InputProps={{
          endAdornment: (
            <IconButton
              style={{
                // background: '#1976D2',
                color: '#1976D2',
              }}
              onClick={handleSearch}
            >
              <SearchIcon />
            </IconButton>
          ),
        }}
      />
    </Container>
  );
};

export default SearchBar;
