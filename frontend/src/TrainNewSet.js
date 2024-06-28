import React, { useState } from 'react';
import axios from 'axios';
import { Button, Typography, Container, Box, Card, CardContent, FormControl, InputLabel, TextField } from '@mui/material';

const TrainNewSet = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleFileChange = (e) => {
    setFile1(e.target.files[0]);
  };

  const handleFileChange2 = (e) => {
    setFile2(e.target.files[0]);
  };

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file1 || !file2 || !modelName) {
      console.error('Please select both folders and provide a model name.');
      return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);
    formData.append('modelName', modelName);

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/train', formData);
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
            <InputLabel htmlFor="model-name">Model Name</InputLabel>
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
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            webkitdirectory="true"
            directory="true"
            required
            style={{ marginTop: '16px', marginBottom: '16px' }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange2}
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
