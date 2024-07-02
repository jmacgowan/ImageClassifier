import React, { useState } from 'react';
import axios from 'axios';
import { Button, Typography, Container, Box, Card, CardContent, FormControl, TextField } from '@mui/material';

const TrainNewSet = () => {
  const [files1, setFiles1] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [folder1Name, setFolder1Name] = useState('');
  const [folder2Name, setFolder2Name] = useState('');
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleFilesChange1 = (e) => {
    setFiles1(e.target.files);
  };

  const handleFilesChange2 = (e) => {
    setFiles2(e.target.files);
  };

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
  };

  const handleFolder1NameChange = (e) => {
    setFolder1Name(e.target.value);
  };

  const handleFolder2NameChange = (e) => {
    setFolder2Name(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files1.length || !files2.length || !modelName) {
      console.error('Please select both folders and provide a model name.');
      return;
    }

    const formData = new FormData();
    Array.from(files1).forEach((file, idx) => {
      formData.append(`file1_${idx}`, file);
    });
    Array.from(files2).forEach((file, idx) => {
      formData.append(`file2_${idx}`, file);
    });
    formData.append('folder1Name', folder1Name);
    formData.append('folder2Name', folder2Name);
    formData.append('modelName', modelName);

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/train', formData);
      setResult(response.data.success);
    } catch (error) {
      console.error('Error training model:', error);
      setResult('Error training model');
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
              id="folder1-name"
              label="Folder 1 Name"
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
            onChange={handleFilesChange1}
            webkitdirectory="true"
            directory="true"
            multiple
            required
            style={{ marginTop: '16px', marginBottom: '16px' }}
          />
          <FormControl variant="outlined" fullWidth margin="normal">
            <TextField
              id="folder2-name"
              label="Folder 2 Name"
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
            onChange={handleFilesChange2}
            webkitdirectory="true"
            directory="true"
            multiple
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
