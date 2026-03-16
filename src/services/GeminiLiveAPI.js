/**
 * GeminiLiveAPI
 */

// Auto-normalise the URL protocol: http(s) → ws(s) for the WebSocket constructor
const PROXY_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export class GeminiLiveAPI {
  constructor({ projectId, location, model, apiHost }) {
    this.projectId = projectId;
    this.location = location;
    // this.model = model ?? "gemini-live-2.5-flash-native-audio";
    this.model = model ?? "gemini-2.0-flash-live-001";
    this.apiHost = apiHost ?? "us-central1-aiplatform.googleapis.com";

    // For Vertex AI LlmBidiService
    this.serviceUrl = `wss://${this.apiHost}/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;

    // For AI Studio (fallback/alternative)
    // this.serviceUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    this.ws = null;
    this.responseModalities = ["AUDIO"];
    this.systemInstructions = "";

    this.onReceiveResponse = () => { };
    this.onConnectionStarted = () => { };
    this.onToolResult = () => {};
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

  // _sendSetup() {
  //   // Vertex AI requires projects/{project}/locations/{location}/publishers/google/models/{model}
  //   const modelUri = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;
  //   console.log("[GeminiLiveAPI] Sending setup for model:", modelUri);
  //
  //   this._send({
  //     setup: {
  //       model: modelUri,
  //       generation_config: {
  //         response_modalities: ["AUDIO"],
  //       },
  //       output_audio_transcription: {},
  //       system_instruction: {
  //         parts: [{ text: this.systemInstructions }],
  //       },
  //     },
  //   });
  // }

  // NEW _sendSetup() in GeminiLiveAPI.js
_sendSetup() {
  const modelUri = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;

  const TOOL_DECLARATIONS = [
    {
      name: "search_knowledge_base",
      description:
        "Search the user's uploaded documents using semantic similarity. " +
        "Use this whenever the user asks a question that might be answered by their files.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query." },
        },
        required: ["query"],
      },
    },
    {
      name: "search_sessions",
      description:
        "Search the user's past conversation history for relevant information.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keywords or phrase to search." },
        },
        required: ["query"],
      },
    },
    {
      name: "generate_image",
      description:
        "Generate an image from a text prompt using Imagen 3. " +
        "Use this when the user explicitly asks for an image, illustration, or visual.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Detailed text prompt for image generation." },
        },
        required: ["prompt"],
      },
    },
    {
      name: "render_canvas",
      description:
        "Send a rich markdown document to the user's Canvas workspace panel. " +
        "Use this for all detailed explanations, code, step-by-step guides, and long content.",
      parameters: {
        type: "object",
        properties: {
          markdown: { type: "string", description: "Full markdown content to display." },
          title: { type: "string", description: "A short title for this canvas block." },
        },
        required: ["markdown"],
      },
    },
    {
      name: "render_diagram",
      description:
        "Render a Mermaid diagram in the user's Canvas workspace. " +
        "Use for flowcharts, sequence diagrams, architecture diagrams.",
      parameters: {
        type: "object",
        properties: {
          mermaid_syntax: { type: "string", description: "Valid Mermaid syntax starting with graph TD or LR." },
          title: { type: "string", description: "Short label for this diagram." },
        },
        required: ["mermaid_syntax"],
      },
    },
    {
      name: "render_math",
      description:
        "Render an interactive mathematical plot in the user's Canvas workspace.",
      parameters: {
        type: "object",
        properties: {
          json: {
            type: "string",
            description:
              'JSON string: {"elements":[{"type":"plot-of-x","fn":"Math.sin(x)","color":"blue"}]}',
          },
          title: { type: "string", description: "Short label for this plot." },
        },
        required: ["json"],
      },
    },
  ];

  this._send({
    setup: {
      model: modelUri,
      // generation_config: { response_modalities: ["AUDIO"] },
      // output_audio_transcription: {},
      // system_instruction: {
      //   parts: [{ text: this.systemInstructions }],
      // },

      generation_config: {
  response_modalities: ["AUDIO"],
  speech_config: {
    voice_config: {
      prebuilt_voice_config: { voice_name: "Aoede" }
    }
  }
},
      tools: [{ function_declarations: TOOL_DECLARATIONS }], // ✅ ADD THIS
      tool_config: {                          // ✅ ADD THIS
      function_calling_config: {
        mode: "AUTO",                       // forces the model to actually call tools
      },
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

      if (data.tool_result) {
        console.log("[GeminiLiveAPI] tool_result received:", data.tool_result); // debug
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
