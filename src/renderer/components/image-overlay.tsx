/**
 * Image Overlay - Shows pasted/dropped images
 */
interface Props {
  src: string
  onClose: () => void
}

export function ImageOverlay({ src, onClose }: Props) {
  return (
    <div className="image-overlay" onClick={onClose}>
      <div className="image-overlay-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-overlay-close" onClick={onClose}>×</button>
        <img src={src} alt="Pasted image" />
        <div className="image-overlay-actions">
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.download = `paste-${Date.now()}.png`
              link.href = src
              link.click()
            }}
          >
            Save
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
