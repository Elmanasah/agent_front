import api from "./axios";

const DocumentService = {
  ingest: async (data) => {
    // data: { fileName, mimeType, data (base64) }
    const response = await api.post("/documents/ingest", data);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/documents");
    return response.data;
  },
  remove: async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },
};

export default DocumentService;
