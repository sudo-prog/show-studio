import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Splash from './components/Splash'
import Header from './components/Header'
import BottomBar from './components/BottomBar'
import CartDrawer from './components/CartDrawer'
import ShopSection from './components/ShopSection'
import { products } from './data/catalog'
import { useCartStore } from './hooks/useCartStore'
import { useProductHover } from './hooks/useProductHover'

// Store layout - 3D positions for each product category rack
const SECTIONS = {
  clothing: { label: 'Clothing', origin: [0, 0, -3], rotationY: 0, fitWidth: 3.2, lookY: 0 },
  shoes: { label: 'Shoes', origin: [3.2, 0, 0], rotationY: -Math.PI / 2, fitWidth: 2.7, panWidth: 5, lookY: -0.05 },
  bags: { label: 'Bags', origin: [0, 0, 3], rotationY: Math.PI, fitWidth: 3, fitHeight: 2.5, lookY: -0.22 },
  caps: { label: 'Caps', origin: [-3.3, 0, 0], rotationY: Math.PI / 2, fitWidth: 2.4, panWidth: 5, lookY: 0.08 },
}

function ShopScene({ selectedProduct, hoveredProduct, onSelect, onHover, onHoverEnd }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e9e6e0" />
      </mesh>

      {/* Product sections */}
      {Object.entries(SECTIONS).map(([key, section]) => (
        <ShopSection
          key={key}
          category={key}
          section={section}
          productList={products[key]}
          selectedProduct={selectedProduct}
          hoveredProduct={hoveredProduct}
          onSelect={onSelect}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
        />
      ))}
    </>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { selectedProduct, hoveredProduct, setSelectedProduct, setHoveredProduct, clearHovered } = useProductHover()
  const cart = useCartStore()

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showSplash && <Splash />}
      <Header />
      <BottomBar />
      <CartDrawer />
      
      <Canvas
        camera={{ position: [0, 1.6, 6], fov: 60 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={() => {
          setSelectedProduct(null)
          clearHovered()
        }}
      >
        <color attach="background" args={['#e9e6e0']} />
        <fog attach="fog" args={['#e9e6e0', 5, 30]} />
        <ShopScene
          selectedProduct={selectedProduct}
          hoveredProduct={hoveredProduct}
          onSelect={setSelectedProduct}
          onHover={setHoveredProduct}
          onHoverEnd={clearHovered}
        />
      </Canvas>
    </>
  )
}

export default App
