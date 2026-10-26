/**
 * Reproduce el audio del runner: PCM con signo de 16 bits little-endian,
 * mono, sin contenedor. El byte 0 de cada paquete dice de qué stream es
 * (0 original, 1 traducido) y se descarta antes de decodificar.
 *
 * Cada paquete se agenda justo detrás del anterior en el AudioContext, con
 * un colchón corto para absorber el jitter de la red. Si la cola crece
 * (pestaña congelada, red a tirones) se tira lo atrasado: en traducción en
 * vivo es mejor perder medio segundo que ir tres atrás del ponente.
 */

const LEAD_S = 0.2;
const MAX_LAG_S = 1.2;

export const STREAM_BYTE = { original: 0, translation: 1 } as const;

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private nextTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor(private sampleRate = 16000) {}

  /** Debe llamarse desde un gesto del usuario (tap) o el navegador lo bloquea. */
  async start() {
    // Safari 16.4+: "playback" suena aunque el switch de silencio esté puesto.
    const nav = navigator as AudioSessionNavigator;
    if (nav.audioSession) nav.audioSession.type = "playback";

    this.ctx ??= new AudioContext();
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  setSampleRate(rate: number) {
    if (rate > 0) this.sampleRate = rate;
  }

  /** Agenda un paquete. `stream` filtra lo que no es del stream elegido. */
  push(packet: ArrayBuffer, stream: number) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running" || packet.byteLength < 3) return;

    const view = new DataView(packet);
    if (view.getUint8(0) !== stream) return;

    const count = Math.floor((packet.byteLength - 1) / 2);
    const buffer = ctx.createBuffer(1, count, this.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < count; i++) {
      samples[i] = view.getInt16(1 + i * 2, true) / 32768;
    }

    const now = ctx.currentTime;
    if (this.nextTime - now > MAX_LAG_S) this.flush();
    // Primer paquete, o la cola se vació: arranca con el colchón.
    if (this.nextTime < now) this.nextTime = now + LEAD_S;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => this.sources.delete(source);
    source.start(this.nextTime);
    this.sources.add(source);
    this.nextTime += buffer.duration;
  }

  /** Corta lo que esté agendado (al cambiar de stream o reconectar). */
  flush() {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {}
    }
    this.sources.clear();
    this.nextTime = 0;
  }

  async stop() {
    this.flush();
    await this.ctx?.suspend().catch(() => {});
  }

  async close() {
    this.flush();
    await this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
