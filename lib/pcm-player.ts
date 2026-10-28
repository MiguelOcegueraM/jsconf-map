/**
 * Reproduce el audio del runner: PCM con signo de 16 bits little-endian,
 * mono, sin contenedor. El byte 0 de cada paquete dice de qué stream es
 * (0 original, 1 traducido) y se descarta antes de decodificar.
 *
 * El trabajo pesado (convertir, remuestrear, colchón contra el jitter) vive
 * en un AudioWorklet (`public/pcm-worklet.js`), fuera del hilo principal:
 * aquí sólo se filtra el stream y se le pasa el paquete sin copiarlo dos veces.
 */

const WORKLET_URL = "/pcm-worklet.js";

export const STREAM_BYTE = { original: 0, translation: 1 } as const;

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;

  constructor(private sampleRate = 16000) {}

  /** Debe llamarse desde un gesto del usuario (tap) o el navegador lo bloquea. */
  async start() {
    // Safari 16.4+: "playback" suena aunque el switch de silencio esté puesto.
    const nav = navigator as AudioSessionNavigator;
    if (nav.audioSession) nav.audioSession.type = "playback";

    this.ctx ??= new AudioContext();
    // resume() antes de cualquier await: Safari sólo lo acepta dentro del gesto.
    const resumed = this.ctx.state === "running" ? Promise.resolve() : this.ctx.resume();

    if (!this.node) {
      await this.ctx.audioWorklet.addModule(WORKLET_URL);
      this.node = new AudioWorkletNode(this.ctx, "pcm-player", {
        numberOfInputs: 0,
        outputChannelCount: [1],
      });
      this.node.connect(this.ctx.destination);
      this.node.port.postMessage({ type: "rate", rate: this.sampleRate });
    }
    await resumed;
  }

  setSampleRate(rate: number) {
    if (rate <= 0) return;
    this.sampleRate = rate;
    this.node?.port.postMessage({ type: "rate", rate });
  }

  /** Encola un paquete. `stream` filtra lo que no es del stream elegido. */
  push(packet: ArrayBuffer, stream: number) {
    if (!this.node || this.ctx?.state !== "running" || packet.byteLength < 3) return;
    if (new Uint8Array(packet, 0, 1)[0] !== stream) return;

    // El slice realinea a 2 bytes (Int16Array no acepta offset 1). Todas las
    // plataformas que importan son little-endian, igual que el runner.
    const count = Math.floor((packet.byteLength - 1) / 2);
    const samples = new Int16Array(packet.slice(1, 1 + count * 2));
    this.node.port.postMessage({ type: "push", samples }, [samples.buffer]);
  }

  /** Corta lo que esté en cola (al cambiar de stream o reconectar). */
  flush() {
    this.node?.port.postMessage({ type: "flush" });
  }

  async stop() {
    this.flush();
    await this.ctx?.suspend().catch(() => {});
  }

  async close() {
    this.flush();
    this.node?.disconnect();
    this.node = null;
    await this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
