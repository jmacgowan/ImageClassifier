import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Container, Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [modelName, setModelName] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);

  useEffect(() => {
    // Fetch list of models from the backend
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/models');
        setModels(response.data.models);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelName', modelName); 
  
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/predict', formData);
      setResult(response.data.prediction);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Image Classification
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl variant="outlined" fullWidth margin="normal">
            <InputLabel id="model-name-label">Model Name</InputLabel>
            <Select
              labelId="model-name-label"
              id="model-name-select"
              value={modelName}
              onChange={handleModelNameChange}
              label="Model Name"
            >
              {models.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
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
            {isLoading ? 'Predicting...' : 'Upload and Predict'}
          </Button>
        </form>
        {result && (
          <Card style={{ marginTop: '16px' }}>
            <CardContent>
              <Typography variant="h6" component="h2">
                Prediction Result
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

export default FileUpload;
