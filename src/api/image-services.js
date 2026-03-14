import api from "./axios";

const ImageService = {
  generate: async (data) => {
    // data: { prompt }
    const response = await api.post("/image/generate", data);
    return response.data;
  },
};

export default ImageService;
