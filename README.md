# SHOW STUDIO
## Nike Virtual Store — Rebuilt via morluto

A React + Three.js (React Three Fiber) 3D virtual Nike store.

### Original

- Stack: React 19.3.0, @react-three/fiber 9.8.1, Three.js r186

### This Project
- **37 products** across 4 categories: Clothing (10), Shoes (9), Bags (10), Caps (8)
- **120 webp texture files** downloaded from the live site
- **3D shop layout** with 4 sections: Clothing rack, Sneaker wall, Bags rack, Caps rack
- Shopping cart with localStorage persistence
- Product view cycling (front/side/back for garments, right/front/left/back for shoes)

### Tech Stack
- React 19.3.0
- @react-three/fiber 9.8.1
- @react-three/drei (PMNDRS)
- Three.js r186
- Zustand (state management)
- Vite (build tool)

### Running
```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

### Asset Structure
```
public/
  garments/     # 10 clothing items × 3 views = 30 textures
  shoes/        # 9 shoes × 4 views = 36 textures
  bags/         # 10 bags × 3 views = 30 textures
  caps/         # 8 caps × 3 views = 24 textures
  favicon.svg
  apple-touch-icon.png
```
