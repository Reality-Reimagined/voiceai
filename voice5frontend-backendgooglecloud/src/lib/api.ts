import axios from 'axios';

const API_BASE_URL = 'https://f5-tts-service-157176978845.us-central1.run.app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const synthesizeText = async (text: string) => {
  try {
    // Step 1: Send text for synthesis and get the output file name
    const synthesisResponse = await apiClient.post('/synthesize/', { text });
    
    if (!synthesisResponse.data.output_file) {
      throw new Error('No output file received');
    }

    // Step 2: Download the generated audio file
    const audioResponse = await apiClient.get(`/audio/${synthesisResponse.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: audioResponse.data,
      fileName: synthesisResponse.data.output_file
    };
  } catch (error) {
    console.error('Synthesis error:', error);
    throw error;
  }
};

export const createPodcast = async (
  scriptContent: string,
  mainVoice: File,
  townVoice: File,
  countryVoice: File
) => {
  try {
    const formData = new FormData();
    
    // Create a Blob from the script content and append it as a file
    const scriptBlob = new Blob([scriptContent], { type: 'text/plain' });
    formData.append('script', scriptBlob, 'script.txt');
    
    formData.append('main', mainVoice);
    formData.append('town', townVoice);
    formData.append('country', countryVoice);

    // Step 1: Send files and get the output file name
    const response = await apiClient.post('/podcast/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.output_file) {
      throw new Error('No output file received');
    }

    // Step 2: Download the generated podcast file
    const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: audioResponse.data,
      fileName: response.data.output_file
    };
  } catch (error) {
    console.error('Podcast creation error:', error);
    throw error;
  }
};

export const cloneVoice = async (audioFile: File, text: string) => {
  try {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('text', text);

    // Step 1: Send the voice clone request
    const response = await apiClient.post('/voiceClone/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.output_file) {
      throw new Error('No output file received');
    }

    // Step 2: Download the cloned voice file
    const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: audioResponse.data,
      fileName: response.data.output_file
    };
    
  } catch (error) {
    console.error('Voice cloning error:', error);
    throw error;
  }
};

export const getAudioFile = async (fileName: string) => {
  try {
    const audioResponse = await apiClient.get(`/audio/${fileName}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: audioResponse.data,
      fileName: fileName
    };
  } catch (error) {
    console.error('Audio file retrieval error:', error);
    throw error;
  }
};


// // Add to existing api.ts file

// export async function createPodcast(
//   script: string,
//   mainVoice: File,
//   townVoice: File,
//   countryVoice: File
// ): Promise<{ output_file: string }> {
//   const formData = new FormData();
//   formData.append('script', new Blob([script], { type: 'text/plain' }));
//   formData.append('main', mainVoice);
//   formData.append('town', townVoice);
//   formData.append('country', countryVoice);

//   const response = await fetch(`${API_BASE_URL}/podcast/`, {
//     method: 'POST',
//     body: formData,
//   });

//   if (!response.ok) {
//     throw new Error('Failed to create podcast');
//   }

//   return response.json();
// }