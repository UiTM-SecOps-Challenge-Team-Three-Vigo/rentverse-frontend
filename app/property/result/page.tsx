'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowDownWideNarrow } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Scrollbar, Mousewheel } from 'swiper/modules'
import usePropertiesStore from '@/stores/propertiesStore'
import MapViewer from '@/components/MapViewer'
import Pagination from '@/components/Pagination'
import CardProperty from '@/components/CardProperty'
import ContentWrapper from '@/components/ContentWrapper'
import ButtonSecondary from '@/components/ButtonSecondary'
import ButtonMapViewSwitcher from '@/components/ButtonMapViewSwitcher'

// Ensure Swiper styles are imported (usually in layout, but good to check)
import 'swiper/css'
import 'swiper/css/scrollbar'

function ResultsPage() {
  const { properties, isLoading, loadProperties, mapData } = usePropertiesStore()
  const [isMapView, setIsMapView] = useState(false)

  // 1. Load Data on Mount
  useEffect(() => {
    loadProperties({ limit: 10, page: 1 })
  }, [loadProperties])

  const toggleView = () => {
    setIsMapView(!isMapView)
  }

  // 2. Helper for Grid Layout (Mobile/Tablet)
  const getGroupedProperties = (itemsPerSlide: number) => {
    const grouped = []
    for (let i = 0; i < properties.length; i += itemsPerSlide) {
      grouped.push(properties.slice(i, i + itemsPerSlide))
    }
    return grouped
  }

  // 3. Calculate Map Center (Dynamic based on API results)
  const mapCenter = useMemo(() => {
    if (mapData?.latMean && mapData?.longMean) {
      return { lng: mapData.longMean, lat: mapData.latMean }
    }
    // Fallback: Kuala Lumpur
    return { lng: 101.6869, lat: 3.1390 } 
  }, [mapData])
  
  const mapZoom = mapData?.depth ? 11 : 10

  // 4. Generate Map Markers
  const propertyMarkers = useMemo(() => {
    return properties
      .filter(p => p.latitude && p.longitude) // ✅ FIX: Only show valid locations
      .map((property) => {
        // Safe image handling
        const coverImage = property.images && property.images.length > 0 
          ? property.images[0] 
          : '/images/placeholder-property.jpg'

        return {
          lng: property.longitude!,
          lat: property.latitude!,
          color: '#0D9488', // Teal color
          // ✅ FIX: HTML Popup with correct styling and Data
          popup: `
            <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
              <div style="
                width: 100%; 
                height: 100px; 
                background-image: url('${coverImage}'); 
                background-size: cover; 
                background-position: center; 
                border-radius: 6px; 
                margin-bottom: 8px;
              "></div>
              <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; line-height: 1.2;">${property.title}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${property.city}, ${property.state}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <p style="font-size: 14px; font-weight: 700; color: #0D9488; margin: 0;">
                  RM ${property.price.toLocaleString()}
                </p>
                <p style="font-size: 11px; color: #888; margin: 0;">
                  ${property.bedrooms}bd ${property.bathrooms}ba
                </p>
              </div>
              <a href="/property/${property.id}" style="display: block; margin-top: 8px; font-size: 12px; color: #0D9488; text-decoration: none; font-weight: 500;">
                View Details →
              </a>
            </div>
          `
        }
      })
  }, [properties])

  return (
    <ContentWrapper searchBoxType="compact">
      <div className="w-full py-4 px-2 sm:px-4 md:px-8 lg:px-12 flex justify-between items-start gap-x-5">
        
        {/* === LEFT SIDE: Property List === */}
        <div className={`w-full md:w-1/2 ${isMapView ? 'hidden' : 'block'}`}>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex flex-col gap-2">
              <h3 className="font-serif text-xl text-teal-900">
                {properties.length} homes found
              </h3>
              <p className="text-base text-teal-800">
                Showing results in Malaysia
              </p>
            </div>
            <ButtonSecondary
              iconLeft={<ArrowDownWideNarrow size={16} />}
              label="Sort"
            />
          </div>

          {/* List Content */}
          <div className="h-[75vh] overflow-hidden">
            {isLoading ? (
               <div className="h-full flex items-center justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
               </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block sm:hidden h-full">
                  <Swiper
                    direction="vertical"
                    slidesPerView="auto"
                    spaceBetween={16}
                    modules={[Scrollbar, Mousewheel]}
                    scrollbar={{ draggable: true }}
                    mousewheel={{ enabled: true }}
                    className="h-full"
                  >
                    {properties.map((property) => (
                      <SwiperSlide key={property.id} className="!h-auto pb-4">
                        <CardProperty property={property} />
                      </SwiperSlide>
                    ))}
                    <SwiperSlide className="!h-auto py-8">
                      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
                    </SwiperSlide>
                  </Swiper>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block h-full">
                  <Swiper
                    direction="vertical"
                    slidesPerView="auto"
                    spaceBetween={16}
                    modules={[Scrollbar, Mousewheel]}
                    scrollbar={{ draggable: true }}
                    mousewheel={{ enabled: true }}
                    className="h-full"
                  >
                    {getGroupedProperties(2).map((group, index) => (
                      <SwiperSlide key={index} className="!h-auto pb-4">
                        <div className="grid grid-cols-2 gap-4">
                          {group.map((property) => (
                            <CardProperty key={property.id} property={property} />
                          ))}
                        </div>
                      </SwiperSlide>
                    ))}
                    <SwiperSlide className="!h-auto py-8">
                      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
                    </SwiperSlide>
                  </Swiper>
                </div>
              </>
            )}
          </div>
        </div>

        {/* === RIGHT SIDE: Map === */}
        <div className={`w-full md:w-1/2 ${isMapView ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 h-[75vh] w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {isLoading ? (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading Map...</div>
              </div>
            ) : (
              <MapViewer
                center={mapCenter}
                zoom={mapZoom}
                markers={propertyMarkers}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="md:hidden">
        <ButtonMapViewSwitcher
          onClick={toggleView}
          isMapView={isMapView}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 shadow-xl"
        />
      </div>
    </ContentWrapper>
  )
}

export default ResultsPage