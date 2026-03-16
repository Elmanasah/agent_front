# Horus: The All-Seeing AI Mentor

**Elevator Pitch**
Horus is an intelligent, multiagent AI tutor that meets you exactly where you are. Moving beyond traditional text chats and static file uploads, Horus interacts with you through a real-time video and audio connection—seeing what you see and hearing what you hear. Whether you're sharing your screen to dissect a digital PDF or pointing your camera at a physical notebook, Horus bridges the gap with a true mentor-like approach. By combining natural dialogue with a live canvas for mathematical graphing, dynamic diagrams, and collaborative problem-solving, Horus transforms any subject into an interactive, personalized classroom.

## Inspiration: Bridging the Divide

The spark for **Horus** came from a simple observation: learning is rarely just a text-based conversation. When we study, our hands are working in physical notebooks, our eyes are scanning complex documents, and our minds are trying to visualize abstract concepts. Most AI interfaces are trapped in a "chat box"—disconnected from the physical world and the highly visual nature of education.

Inspired by the ancient Egyptian deity Horus, whose eye represents protection, clarity, and profound insight, we built a platform that "sees" as much as it "thinks." We wanted to create a mentor that could look at a student's handwritten math proof via a live camera feed or analyze a research paper via screen share, and then immediately translate those thoughts into a dynamic, interactive workspace.

## What It Does

Horus operates just like a real-life tutor sitting across the desk from you, utilizing advanced multimodal capabilities to deliver a seamless learning experience:

- **Real-Time Video & Audio Calls:** Say goodbye to typing prompts and uploading photos. You simply jump into a live call with Horus. He processes your live video feed and microphone audio, allowing you to ask questions naturally while pointing at your screen or notebook.
- **Dynamic Visualizations & Graphing:** Learning is a visual process. Whenever a concept gets complicated, Horus can instantly draw mathematical graphs, map out complex data, or generate custom images to make abstract ideas concrete and easy to grasp.
- **Interactive Learning Canvas:** Horus doesn't just tell you the answer; he shows you the work. Using a shared digital canvas, Horus can visually summarize entire topics with custom diagrams, break down equations step-by-step, and collaborate with you to solve complex problems in real-time.
- **Context-Aware Mentorship:** Because Horus can see your physical workspace and hear your tone, he adapts his teaching style to your specific context, guiding your curiosity rather than just spitting out robotic facts.

## Horus Tech Stack: Detailed Architecture

Horus is built on a modern, multimodal "AI-Native" stack designed for high-performance tutoring and real-time visual collaboration.

### 🏗️ Core Architecture

- **Frontend**: React (v19) + Vite (v7)
- **Backend**: Node.js + Express (v5.x)
- **Database**: CockroachDB (Serverless / PostgreSQL-compatible)
- **ORM**: Sequelize

### 🤖 AI & Machine Learning (Vertex AI)

The project leverages the **Google Cloud Vertex AI** ecosystem for its "All-Seeing" capabilities:

- **Primary Model**: `gemini-2.0-flash-exp` (Implied by current state-of-the-art multimodal usage)
- **Multimodal Integration**: Native support for live video streams and camera feeds via Vertex AI's multimodal live API.
- **RAG (Retrieval-Augmented Generation)**:
  - **Embeddings**: `text-multilingual-embedding-002` (standard for RAG).
  - **Vector Storage**: **Vertex AI Vector Search** for ultra-low latency semantic retrieval.
- **Storage**: **Google Cloud Storage (GCS)** for persistent storage of indexed document chunks.

### 🎨 Frontend & Visualization Workspace

The "Canvas" workspace uses specialized libraries to render complex data:

- **Math Visualization**: **Mafs** (`mafs`) – used for rendering interactive SVG-based coordinate geometry and plots.
- **Diagramming**: **Mermaid.js** (`mermaid`) – used for architecture diagrams, flowcharts, and sequence diagrams.
- **Styling**: **Tailwind CSS** (v4.0) – modern utility-first CSS.
- **State Management**: React Hooks (native) + Context API for session and theme management.

### 🔌 Integrations & Infrastructure

- **Authentication**: **Google OAuth 2.0** for seamless student login.
- **Email Service**: **Nodemailer** – configured via SMTP for notifications and verification.
- **Real-time Communication**: **WebSockets** (`ws`) – used for the proxy layer that handles live tutor sessions.
- **Environment**: **Docker** for consistent development and deployment environments.
- **Cloud Hosting**: **Google Cloud Platform (GCP)** (us-central1) for AI, Storage, and Vector services.
- **CI/CD Pipeline**: **GitHub Actions** – automated testing, linting, and deployment to GCP using Docker images.

### 🔐 Infrastructure Notes

- **Region**: us-central1 (AI) and europe-west3 (Database).
- **Database Engine**: PostgreSQL wire protocol over CockroachDB.

## 🛠️ Challenges Faced: The "Sync" Problem

One of our greatest hurdles was **Asynchronous Synchronization**. When an AI is "thinking" and streaming a live response, how do you make sure a complex visualization (like a graph) appears at the _exact_ moment the tutor mentions it?
We solved this by developing a custom **Markdown-Lite Parser** that identifies "Artifact Trigger Tags" in the stream and hydrates the Canvas component without breaking the flow of the conversation.

Another challenge was **Multimodal Context Switching**. Teaching a student to solve a derivative:
$$\frac{d}{dx}(x^n) = nx^{n-1}$$
Requires the AI to "look" at the student's starting point (camera/PDF) while simultaneously generating a visual proof on the canvas. Fine-tuning the prompt instructions to handle this multi-step visual reasoning was a game of extreme precision.

## 📚 What We Learned

This project taught us that **Context is King**. An AI tutor is only as good as the world it can perceive. By enabling Horus to share the student's screen and see their camera, we moved from "AI as a tool" to "AI as a partner."

We learned that the future of education isn't just about faster answers—it's about richer visualizations and more empathetic companionship.

## What's Next for Horus

We have built a strong multimodal foundation, but our roadmap for scaling Horus into a global educational platform includes:

- **React Native Mobile App:** We plan to take Horus on the go by building a native mobile client. This will allow students to seamlessly use their phone cameras to capture physical whiteboards, textbooks, or study groups in real-time, completely untethering the AI tutor from the desktop.
- **Multiplayer AI Classrooms:** Learning shouldn't happen in isolation. We are developing a feature where you and your friends can open a shared, live meeting with Horus. The AI will act as the ultimate co-host, listening to the group's discussion, answering questions for everyone, and updating a shared visual canvas that the whole group can interact with.
- **Global CDN & Live Streaming Architecture:** To support high-quality multiplayer sessions, we will upgrade our infrastructure to include a robust Content Delivery Network (CDN) and advanced live video streaming protocols. This ensures ultra-low latency audio and visual syncing, giving study groups a smooth, buffer-free real-time experience no matter where they are located.
- **Dynamic 3D Textures and Diagrams:** Using Three.js, we will also enable students to create interactive 3D diagrams and textures that can be shared and discussed in real-time. This will allow students to visualize complex concepts in a more engaging and interactive way, further enhancing their understanding and retention of the material.
