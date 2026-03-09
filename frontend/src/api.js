import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const createJob = async (youtubeUrl) => {
    const response = await api.post('/jobs', { youtube_url: youtubeUrl });
    return response.data;
};

export const getAllJobs = async () => {
    const response = await api.get('/jobs');
    return response.data;
};

export const getJob = async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
};

export const processJob = async (id, numShorts = 5) => {
    const response = await api.post(`/jobs/${id}/process?num_shorts=${numShorts}`);
    return response.data;
};

export const getDownloadUrl = (filename) => {
    return `${API_URL}/download/${filename}`;
};

export const getZipDownloadUrl = (jobId) => {
    return `${API_URL}/jobs/${jobId}/download-zip`;
};

export default api;
