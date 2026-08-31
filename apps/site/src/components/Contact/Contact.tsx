import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../Reveal/Reveal';

const EMAIL = 'ashavparihar7@gmail.com';

// Pre-generated QR matrix for `mailto:ashavparihar7@gmail.com` (error-correction M) — embedded as
// static data so the code is scannable and clickable with no runtime QR dependency in the bundle.
const QR_ROWS = [
  '11111110011011110111101111111',
  '10000010010111111000101000001',
  '10111010111001010001101011101',
  '10111010110110110100001011101',
  '10111010100100011011101011101',
  '10000010101100000010001000001',
  '11111110101010101010101111111',
  '00000000111100101000000000000',
  '10111110000000001100001111100',
  '10111001111001110110101111111',
  '11100010000011111010110000000',
  '01110001011001010001110111000',
  '01111010111110110100100101111',
  '00001101010000011111011111011',
  '01010010111100000000010110000',
  '00100000100100101011000011000',
  '00010111101100001110100000110',
  '11101001010011110111101111111',
  '10000111100111111100110011100',
  '10111000010101010010011000000',
  '10001011011100110100111111101',
  '00000000101010011010100010111',
  '11111110010010000111101010100',
  '10000010101000101001100011011',
  '10111010100010000100111110101',
  '10111010101101110110000000000',
  '10111010101101111100111111010',
  '10000010001101111000111101010',
  '11111110110001100101000011100',
];

const QR_SIZE = QR_ROWS.length;
const QR_PATH = QR_ROWS.map((row, y) =>
  row
    .split('')
    .map((cell, x) => (cell === '1' ? `M${x} ${y}h1v1h-1z` : ''))
    .join(''),
).join('');

export function Contact() {
  return (
    <section id="contact" className="border-b border-panel-border px-6 py-24 md:px-10">
      <Reveal>
        <h2 className="label text-phosphor">Contact</h2>
      </Reveal>

      <Reveal className="mt-12 flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-none font-bold uppercase">
            Let&apos;s talk
          </p>
          <div className="label mt-8 flex gap-6">
            <a
              href="https://linkedin.com/in/ashavparihar/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-phosphor"
            >
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href="https://github.com/iamashav"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-phosphor"
            >
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>

        <a
          href={`mailto:${EMAIL}`}
          aria-label={`Email ${EMAIL}`}
          className="group inline-flex flex-col gap-3"
        >
          <svg
            className="size-40 border border-panel-border bg-panel fill-current p-3 text-muted transition-colors group-hover:text-phosphor"
            viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
            role="presentation"
          >
            <path d={QR_PATH} />
          </svg>
          <span className="text-micro text-muted">Scan or tap to email</span>
        </a>
      </Reveal>
    </section>
  );
}
