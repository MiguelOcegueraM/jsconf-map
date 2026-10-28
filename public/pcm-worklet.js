/**
 * Reproductor PCM en el hilo de audio. El hilo principal sólo le pasa los
 * paquetes (Int16 mono a la tasa del runner) y aquí se convierten, se
 * remuestrean a la tasa del AudioContext y se tocan de corrido.
 *
 * Antes cada paquete era un AudioBufferSourceNode creado en el hilo
 * principal: en un Android de gama baja eso son decenas de nodos por segundo
 * peleando con React y el recolector de basura, y el audio se trababa.
 *
 * Colchón: arranca a sonar con LEAD_S en cola; si se vacía, calla y vuelve a
 * juntar colchón; si pasa de MAX_LAG_S (pestaña congelada, red a tirones) se
 * tira lo viejo — en vivo es mejor perder medio segundo que ir atrás.
 */

const LEAD_S = 0.25;
const MAX_LAG_S = 1.2;

class PcmPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    /** @type {Float32Array[]} */
    this.chunks = [];
    /** Posición de lectura (fraccionaria) dentro de chunks[0]. */
    this.offset = 0;
    /** Muestras en cola, a la tasa del runner. */
    this.queued = 0;
    this.rate = 16000;
    this.playing = false;

    this.port.onmessage = ({ data }) => {
      if (data.type === "push") this.push(data.samples);
      else if (data.type === "flush") this.flush();
      else if (data.type === "rate" && data.rate > 0) this.rate = data.rate;
    };
  }

  /** @param {Int16Array} int16 */
  push(int16) {
    const chunk = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) chunk[i] = int16[i] / 32768;
    this.chunks.push(chunk);
    this.queued += chunk.length;

    if (this.queued > MAX_LAG_S * this.rate) {
      const keep = LEAD_S * this.rate;
      while (this.chunks.length > 1 && this.queued - this.chunks[0].length >= keep) {
        this.queued -= this.chunks.shift().length;
      }
      this.offset = 0;
    }
  }

  flush() {
    this.chunks = [];
    this.offset = 0;
    this.queued = 0;
    this.playing = false;
  }

  process(_inputs, outputs) {
    const out = outputs[0][0];
    if (!out) return true;

    if (!this.playing) {
      if (this.queued < LEAD_S * this.rate) return true;
      this.playing = true;
    }

    // `sampleRate` es global en AudioWorkletGlobalScope: la del contexto.
    const step = this.rate / sampleRate;
    for (let i = 0; i < out.length; i++) {
      const chunk = this.chunks[0];
      if (!chunk) {
        // Se acabó la cola: silencio hasta juntar colchón otra vez.
        this.playing = false;
        break;
      }
      const index = Math.floor(this.offset);
      const frac = this.offset - index;
      const a = chunk[index];
      const b = index + 1 < chunk.length ? chunk[index + 1] : (this.chunks[1]?.[0] ?? a);
      out[i] = a + (b - a) * frac;

      this.offset += step;
      while (this.chunks.length && this.offset >= this.chunks[0].length) {
        this.offset -= this.chunks[0].length;
        this.queued -= this.chunks.shift().length;
      }
    }
    return true;
  }
}

registerProcessor("pcm-player", PcmPlayerProcessor);
