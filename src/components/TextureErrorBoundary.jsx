import { Component } from 'react'

export class TextureErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.warn('TextureErrorBoundary caught:', error.message)
  }

  render() {
    if (this.state.hasError) {
      // Fallback: render a simple placeholder box instead of crashing
      return this.props.fallback || null
    }
    return this.props.children
  }
}

export default TextureErrorBoundary
