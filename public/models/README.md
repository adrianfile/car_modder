
# 3D Models Directory

Letakkan file 3D (.fbx, .glb, atau .gltf) Anda di folder ini:
`public/models/`

Contoh:
- `public/models/velg.fbx`
- `public/models/spoiler.fbx`
- `public/models/ban.fbx`

Kemudian daftarkan path-nya di file `app/inventory/data.ts` pada item terkait:
```ts
{
  id: "velg-1",
  name: "Mod Carbon Apex R20 Monoblock",
  category: "velg",
  modelUrl: "/models/velg.fbx", // <-- arahkan ke file Anda di sini
  ...
}
```
Three.js akan secara otomatis mendeteksi file .fbx, memuat model, dan menyesuaikan skala serta posisinya di tengah ruangan studio!
