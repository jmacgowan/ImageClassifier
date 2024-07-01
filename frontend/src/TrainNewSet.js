import React, { useState } from 'react';
import axios from 'axios';
import { Button, Typography, Container, Box, Card, CardContent, FormControl, TextField } from '@mui/material';

const TrainNewSet = () => {
  const [folder1Files, setFolder1Files] = useState(null);
  const [folder2Files, setFolder2Files] = useState(null);
  const [folder1Name, setFolder1Name] = useState('');
  const [folder2Name, setFolder2Name] = useState('');
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
  };

  const handleFolder1Change = (e) => {
    setFolder1Files(e.target.files);
  };

  const handleFolder2Change = (e) => {
    setFolder2Files(e.target.files);
  };

  const handleFolder1NameChange = (e) => {
    setFolder1Name(e.target.value);
  };

  const handleFolder2NameChange = (e) => {
    setFolder2Name(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folder1Files || !folder2Files || !modelName || !folder1Name || !folder2Name) {
      console.error('Please select and name both folders and provide a model name.');
      return;
    }

    const formData = new FormData();
    formData.append('modelName', modelName);

    for (let i = 0; i < folder1Files.length; i++) {
      formData.append('folder1Files', folder1Files[i]);
    }

    for (let i = 0; i < folder2Files.length; i++) {
      formData.append('folder2Files', folder2Files[i]);
    }

    formData.append('folder1Name', folder1Name);
    formData.append('folder2Name', folder2Name);

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data.success);
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Model Creation
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl variant="outlined" fullWidth margin="normal">
            <TextField
              id="model-name"
              label="Model Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={modelName}
              onChange={handleModelNameChange}
              required
            />
          </FormControl>
          <FormControl variant="outlined" fullWidth margin="normal">
          <TextField
              id="model-name"
              label="Folder Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={folder1Name}
              onChange={handleFolder1NameChange}
              required
            />
          </FormControl>
         
          <input
            type="file"
            accept="image/*"
            onChange={handleFolder1Change}
            webkitdirectory="true"
            directory="true"
            required
            style={{ marginTop: '16px', marginBottom: '16px' }}
          />
          <FormControl variant="outlined" fullWidth margin="normal">
          <TextField
              id="model-name"
              label="Folder Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={folder2Name}
              onChange={handleFolder2NameChange}
              required
            />
          </FormControl>
          <input
            type="file"
            accept="image/*"
            onChange={handleFolder2Change}
            webkitdirectory="true"
            directory="true"
            required
            style={{ marginTop: '16px', marginBottom: '16px' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Training...' : 'Train Model'}
          </Button>
        </form>
        {result && (
          <Card style={{ marginTop: '16px' }}>
            <CardContent>
              <Typography variant="h6" component="h2">
                Training Result
              </Typography>
              <Typography variant="body1">
                {result}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default TrainNewSet;
