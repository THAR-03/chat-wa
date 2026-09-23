# WhatsApp Private Bot

Bot WhatsApp berbasis Node.js + Baileys yang berjalan di Termux.

## Fitur

- Hanya merespons chat pribadi.
- Mengabaikan pesan grup.
- Hanya nomor owner yang dapat menggunakan bot.
- QR login tampil di terminal.
- Prefix perintah dapat diubah melalui `.env`.

## Instalasi di Termux

```bash
pkg update
pkg install nodejs git
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
npm install
cp .env.example .env
nano .env
npm start
```

Isi `.env`:

```env
BOT_NAME=PrivateBot
OWNER_NUMBER=6281234567890
PREFIX=!
```

`OWNER_NUMBER` harus memakai format internasional tanpa `+` atau spasi.

Contoh:
`6281234567890`

## Perintah

```text
!menu
!ping
!halo
```

Pesan biasa dari owner juga akan dibalas.

## Keamanan

Jangan upload `.env`, folder `auth/`, atau `node_modules/` ke GitHub. Ketiganya sudah dimasukkan ke `.gitignore`.
