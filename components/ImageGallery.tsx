import Image from 'next/image'
import { getCleanImageUrl } from '@/utils/imageHelper' // ✅ Import helper

interface ImageGalleryProps {
  images: string[]
}

function ImageGallery({ images }: ImageGalleryProps) {
  // 1. Sanitize all incoming images using the helper
  const safeImages = (images || []).map(getCleanImageUrl);

  // 2. Ensure we always have at least 5 images (fill with placeholders if needed)
  while (safeImages.length < 5) {
    safeImages.push('/placeholder-property.jpg');
  }

  const [mainImage, ...gridImages] = safeImages;

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-2 h-96">
      {/* Main large image on the left */}
      <div className="relative rounded-l-lg overflow-hidden">
        <Image
          src={mainImage}
          alt="Main property image"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Grid of 4 smaller images on the right */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {gridImages.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden ${
              index === 1 ? 'rounded-tr-lg' :
                index === 3 ? 'rounded-br-lg' : ''
            }`}
          >
            <Image
              src={image}
              alt={`Property image ${index + 2}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery