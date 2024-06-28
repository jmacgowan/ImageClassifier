import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box, Card, CardContent } from '@mui/material';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [modelName, setModelName] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Model Name:', modelName);
console.log('File:', file);
console.log('Response:', response.data);

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
          <TextField
            label="Model Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={modelName}
            onChange={handleModelNameChange}
          />
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
        
        <p>oi</p>
      </Box>
    </Container>
  );
};

export default FileUpload;
