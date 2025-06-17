
# 🤖 Selfchat-Discord

⚠️ **Catatan penting**: Ini adalah _selfbot_, dan melanggar [Discord TOS](https://discord.com/terms). Gunakan hanya untuk keperluan pribadi, risiko ditanggung sendiri.

---

## 🚀 Fitur

- 📤 Kirim pesan otomatis dari banyak akun/token
- 🧹 Hapus pesan otomatis setelah 0.5 detik
- 🔀 Pesan diambil acak dari `mes.txt`
- ⏱️ Interval acak antara 20–30 detik
- 📁 Konfigurasi via `config.json` 
---

## ⚙️ Instalasi

```bash
git clone https://github.com/kontia1/Selfchat-Discord.git && cd Selfchat-Discord
```

Install dependencies

```
npm install node-fetch@2
```

isi pesan, 1 pesan per line

```
nano mes.txt
```

Isi Access Token dan Channel ID

```
nano config.json
```

Contoh

```
[
  {
    "token": "token",
    "channels": ["channelid"]
  },
  {
    "token": "token",
    "channels": ["Channelid"]
  }
]

```

Jika Ingin Mengirim Pesan ke banyak Channel untuk 1 akun tambah kan Channel ID lain

Contoh

```
"channels": ["channel1","channel2"]
```

📌 Cara dapatkan Token:

⚠️ Jangan pernah bagikan token ke siapa pun!

Buka Discord di browser

Tekan F12, buka tab Network

Kirim Pesan bebas

Filter messages → klik request → lihat di Headers > Authorization

