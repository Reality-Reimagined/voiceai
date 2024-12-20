import axios from 'axios';

const API_BASE_URL = 'https://f5-tts-service-157176978845.us-central1.run.app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const synthesizeText = async (text) => {
  try {
    const synthesisResponse = await apiClient.post('/synthesize/', { text });
    
    if (!synthesisResponse.data?.output_file) {
      throw new Error('No output file received');
    }

    const audioResponse = await apiClient.get(`/audio/${synthesisResponse.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
      fileName: synthesisResponse.data.output_file
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to synthesize text');
    }
    throw error;
  }
};

export const createPodcast = async (
  scriptContent,
  mainVoice,
  townVoice,
  countryVoice
) => {
  try {
    // Validate file types
    if (mainVoice.type !== 'audio/flac' || townVoice.type !== 'audio/flac' || countryVoice.type !== 'audio/flac') {
      throw new Error('Main, town, and country voices must be FLAC files');
    }
    if (typeof scriptContent !== 'string') {
      throw new Error('Script content must be a string');
    }

    const formData = new FormData();
    formData.append('script', new Blob([scriptContent], { type: 'text/plain' }), 'script.txt');
    formData.append('main', mainVoice);
    formData.append('town', townVoice);
    formData.append('country', countryVoice);

    const response = await apiClient.post('/podcast/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data?.output_file) {
      throw new Error('No output file received');
    }

    const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
      fileName: response.data.output_file
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create podcast');
    }
    throw error;
  }
};

export const cloneVoice = async (audioFile, text) => {
  try {
    // Validate file type
    if (audioFile.type !== 'audio/flac') {
      throw new Error('Audio file must be a FLAC file');
    }
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }

    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('text', text);

    const response = await apiClient.post('/voiceClone/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data?.output_file) {
      throw new Error('No output file received');
    }

    const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
      fileName: response.data.output_file
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to clone voice');
    }
    throw error;
  }
};

export const getAudioFile = async (fileName) => {
  try {
    const audioResponse = await apiClient.get(`/audio/${fileName}`, {
      responseType: 'blob'
    });

    return new Blob([audioResponse.data], { type: 'audio/wav/flac' });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to retrieve audio file');
    }
    throw error;
  }
};



// import axios from 'axios';

// const API_BASE_URL = 'https://f5-tts-service-157176978845.us-central1.run.app';

// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
// });

// export const synthesizeText = async (text: string) => {
//   try {
//     const synthesisResponse = await apiClient.post('/synthesize/', { text });
    
//     if (!synthesisResponse.data?.output_file) {
//       throw new Error('No output file received');
//     }

//     const audioResponse = await apiClient.get(`/audio/${synthesisResponse.data.output_file}`, {
//       responseType: 'blob'
//     });

//     return {
//       audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
//       fileName: synthesisResponse.data.output_file
//     };
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to synthesize text');
//     }
//     throw error;
//   }
// };

// export const createPodcast = async (
//   scriptContent: string,
//   mainVoice: File,
//   townVoice: File,
//   countryVoice: File
// ) => {
//   try {
//     const formData = new FormData();
//     formData.append('script', new Blob([scriptContent], { type: 'text/plain' }), 'script.txt');
//     formData.append('main', mainVoice);
//     formData.append('town', townVoice);
//     formData.append('country', countryVoice);

//     const response = await apiClient.post('/podcast/', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     if (!response.data?.output_file) {
//       throw new Error('No output file received');
//     }

//     const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
//       responseType: 'blob'
//     });

//     return {
//       audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
//       fileName: response.data.output_file
//     };
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to create podcast');
//     }
//     throw error;
//   }
// };

// export const cloneVoice = async (audioFile: File, text: string) => {
//   try {
//     const formData = new FormData();
//     formData.append('audio_file', audioFile);
//     formData.append('text', text);

//     const response = await apiClient.post('/voiceClone/', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     if (!response.data?.output_file) {
//       throw new Error('No output file received');
//     }

//     const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
//       responseType: 'blob'
//     });

//     return {
//       audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
//       fileName: response.data.output_file
//     };
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to clone voice');
//     }
//     throw error;
//   }
// };

// export const getAudioFile = async (fileName: string) => {
//   try {
//     const audioResponse = await apiClient.get(`/audio/${fileName}`, {
//       responseType: 'blob'
//     });

//     return new Blob([audioResponse.data], { type: 'audio/wav/flac' });
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to retrieve audio file');
//     }
//     throw error;
//   }
// };