# Syndics encrypted payload

Decode these files into the site repo. Do not commit plaintext chapters or access codes.

## Layout
- `_sources/syndics/guide-index.md` is the public table of contents (plain markdown).
- `_sources/syndics/payload/MANIFEST.json` lists sha256 of each decoded file, destinations, and split-part lists.
- `_sources/syndics/payload/<dest>.b64` is base64 of the encrypted data or of the PDF.
- Split objects use `.b64.part01`, `.part02`, and so on: concatenate in order with no extra separators, then base64-decode.

## Decode
Use MANIFEST.json: join `parts` in order, base64-decode, check sha256, write to `decode_to`.

Chapter count must be 112 bins plus c/index.bin, plus keys.json and manifest.public.json. Place the PDF at assets/syndics/rapport-systeme-ia-souverain-syndic.pdf.
