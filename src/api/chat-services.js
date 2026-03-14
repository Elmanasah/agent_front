import api from "./axios";

const ChatService = {
  chat: async (data) => {
    // data: { message, attachments, sessionId }
    const response = await api.post("/chat", data);
    return response.data;
  },
  reset: async () => {
    const response = await api.post("/chat/reset");
    return response.data;
  },
};

export default ChatService;
