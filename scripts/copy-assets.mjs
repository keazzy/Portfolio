// The site serves /assets/... from public/assets, which is a git-ignored symlink to ../assets on this machine.
// A deploy has no symlink, so the build copies the originals in. Locally the symlink is there and this does nothing.
import { cpSync, existsSync } from 'node:fs';

if (!existsSync('public/assets') && existsSync('assets')) {
  cpSync('assets', 'public/assets', { recursive: true });
  console.log('Copied assets/ into public/assets');
}
