class pcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.port.onmessage = (e) => {
      this.buffer.push(...e.data);
    };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const channel = output[0];

    if (this.buffer.length > channel.length) {
      const processBuffer = this.buffer.splice(0, channel.length);
      for (let i = 0; i < channel.length; i++) {
        channel[i] = processBuffer[i];
      }
    }

    return true;
  }
}

registerProcessor("pcm-processor", pcmProcessor);
