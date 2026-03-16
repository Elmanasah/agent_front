

const PROXY_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';

export class GeminiLiveAPI {
  constructor({ projectId, location, model, apiHost }) {
    this.projectId = projectId;
    this.location = location;
    this.model = model ?? "gemini-live-2.5-flash-native-audio";
    this.apiHost = apiHost ?? "us-central1-aiplatform.googleapis.com";

    // For Vertex AI LlmBidiService
    this.serviceUrl = `wss://${this.apiHost}/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;

    this.ws = null;
    this.systemInstructions = "";

    this.onReceiveResponse = () => { };
    this.onConnectionStarted = () => { };
    this.onToolResult = () => { };
    this.onError = (msg) => console.error("[GeminiLiveAPI]", msg);
    this.onDisconnected = () => { };
  }

  connect(accessToken, customServiceUrl) {
    console.log("[GeminiLiveAPI] Connecting to proxy…");
    this.ws = new WebSocket(PROXY_URL);

    this.ws.onopen = () => {
      console.log("[GeminiLiveAPI] Socket open → sending auth");
      this._send({
        bearer_token: accessToken,
        service_url: customServiceUrl || this.serviceUrl,
      });
    };

    this.ws.onmessage = (evt) => this._handleMessage(evt);

    this.ws.onclose = (evt) => {
      console.log("[GeminiLiveAPI] Closed", evt.code, evt.reason);
      this.onDisconnected();
      if (evt.code !== 1000) {
        this.onError(
          `Connection closed (${evt.code}): ${evt.reason || "unknown"}`,
        );
      }
    };

    this.ws.onerror = () => {
      this.onError("WebSocket error — is the proxy server running?");
    };
  }

  disconnect() {
    this.ws?.close(1000, "User disconnect");
    this.ws = null;
  }

  _send(payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  _sendSetup() {
    // Vertex AI requires projects/{project}/locations/{location}/publishers/google/models/{model}
    const modelUri = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;
    console.log("[GeminiLiveAPI] Sending setup for model:", modelUri);

    this._send({
      setup: {
        model: modelUri,
        generation_config: {
          response_modalities: ["AUDIO"],
        },
        output_audio_transcription: {},
        system_instruction: {
          parts: [{ text: this.systemInstructions }],
        },
      },
    });
  }

  _handleMessage(evt) {
    try {
      const data = JSON.parse(evt.data);

      if (data.proxy_ready) {
        console.log("[GeminiLiveAPI] proxy_ready received → sending setup");
        this._sendSetup();
        return;
      }

      if (data.setupComplete) {
        console.log(
          "[GeminiLiveAPI] setupComplete → calling onConnectionStarted",
        );
        this.onConnectionStarted();
        return;
      }

      // Handle rich tool_result payloads from the server (canvas, diagram, math, image)
      if (data.tool_result) {
        console.log("[GeminiLiveAPI] tool_result received:", data.tool_result.name);
        this.onToolResult(data.tool_result);
        return;
      }

      // Handle standard model turns (AI Studio uses snake_case in responses too)
      const parts = data?.serverContent?.modelTurn?.parts ?? [];
      for (const part of parts) {
        if (part.text)
          this.onReceiveResponse({ type: "TEXT", data: part.text });
        if (part.inlineData?.data)
          this.onReceiveResponse({ type: "AUDIO", data: part.inlineData.data });
      }

      // Handle transcriptions
      const transcript = data?.serverContent?.outputTranscription?.text;
      if (transcript)
        this.onReceiveResponse({ type: "TEXT", data: transcript });
    } catch (err) {
      console.error("[GeminiLiveAPI] Parse error:", err);
    }
  }

  sendText(text) {
    this._send({
      client_content: {
        turns: [{ role: "user", parts: [{ text }] }],
        turn_complete: true,
      },
    });
  }

  sendAudio(base64PCM) {
    if (!this.ws || this.ws.bufferedAmount > 200_000) return;
    this._send({
      realtime_input: {
        media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64PCM }],
      },
    });
  }

  sendImage(base64JPEG) {
    this._send({
      realtime_input: {
        media_chunks: [{ mime_type: "image/jpeg", data: base64JPEG }],
      },
    });
  }
}
