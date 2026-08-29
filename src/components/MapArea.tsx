import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FilterType, Store, KyungHeeCollege } from '../types';
import { KHU_GATE_LOCATION } from '../data/stores';
import { getCollegeBadgeInfo } from '../utils/collegeAffiliation';

interface MapAreaProps {
  stores: Store[];
  currentFilter: FilterType;
  selectedStore: Store | null;
  onSelectStore: (store: Store | null) => void;
  onOpenDetailModal: (store: Store) => void;
  isGateFocused: boolean;
  onGateFocusReset: () => void;
  currentCollege?: KyungHeeCollege | null;
}

export const MapArea: React.FC<MapAreaProps> = ({
  stores,
  currentFilter,
  selectedStore,
  onSelectStore,
  onOpenDetailModal,
  isGateFocused,
  onGateFocusReset,
  currentCollege,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const gateGroupRef = useRef<L.LayerGroup | null>(null);
  const storeMarkerMapRef = useRef<Record<string, L.Marker>>({});

  // 1. Initialize Map on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([37.248, 127.078], 15);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap | KYUNGHEE ROAD' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    const gateGroup = L.layerGroup().addTo(map);

    markerGroupRef.current = markerGroup;
    gateGroupRef.current = gateGroup;
    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render store markers when stores or filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;

    const markerGroup = markerGroupRef.current;
    markerGroup.clearLayers();
    storeMarkerMapRef.current = {};

    stores.forEach((store) => {
      if (currentFilter !== 'all' && store.type !== currentFilter) return;

      let iconClass = '';
      let iconEmoji = '🍽️';

      if (store.type === 'cafe') {
        iconClass = 'cafe';
        iconEmoji = '☕';
      } else if (store.type === 'pub') {
        iconClass = 'pub';
        iconEmoji = '🍺';
      } else if (store.type === 'life') {
        iconClass = 'life';
        iconEmoji = '💪';
      }

      const iconHtml = `<div id="marker-${store.id}" class="pin-marker ${iconClass}">${iconEmoji}</div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([store.lat, store.lng], { icon: customIcon });

      const badgeInfo = getCollegeBadgeInfo(store, currentCollege);

      marker.bindTooltip(`${store.name} (${badgeInfo.shortLabel})`, {
        direction: 'top',
        className: 'custom-tooltip',
        offset: [0, -16],
      });

      const popupHtml = `
        <div class="overflow-hidden bg-white text-gray-900 rounded-2xl">
          <div class="relative w-full h-[130px] bg-gray-100 overflow-hidden">
            <img 
              src="${store.img}" 
              alt="${store.name}" 
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60'"
            />
            <div class="absolute top-2 left-2 bg-[#8B1D24] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
              KYUNGHEE ROAD
            </div>
            ${
              store.estimatedSaving
                ? `<div class="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    절약: ${store.estimatedSaving}
                   </div>`
                : ''
            }
          </div>
          
          <div class="p-3.5 flex flex-col gap-1.5">
            <div class="flex items-center justify-between gap-1 flex-wrap">
              <span class="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                ${store.category}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${
                badgeInfo.isAffiliatedWithCurrent
                  ? 'bg-red-50 text-[#8B1D24] border border-red-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }">
                ${badgeInfo.label}
              </span>
            </div>

            <h3 class="text-[15px] font-extrabold text-gray-900 leading-tight">
              ${store.name}
            </h3>

            <p class="text-[11px] text-gray-500 flex items-center gap-1">
              📍 ${store.addr}
            </p>

            <div class="text-[11px] text-gray-700 bg-gray-50 p-2 rounded-lg leading-relaxed border border-gray-100">
              ${store.desc}
            </div>

            <div class="bg-red-50/90 border border-red-200 text-[#8B1D24] p-2.5 rounded-xl text-[11px] leading-relaxed">
              <div class="font-black flex items-center gap-1 mb-1 text-[11px]">
                🎁 학우 제휴 혜택 안내
              </div>
              <div class="whitespace-pre-line font-semibold text-[11px]">
                ${store.benefit}
              </div>
            </div>

            <div class="flex gap-1.5 mt-1">
              <a 
                href="https://map.kakao.com/link/to/${encodeURIComponent(store.name)},${store.lat},${store.lng}" 
                target="_blank" 
                rel="noreferrer"
                class="flex-1 py-1.5 text-center bg-[#FEE500] hover:bg-[#ebd400] text-[#191919] font-bold text-[11px] rounded-lg shadow-xs transition-colors"
              >
                카카오길찾기
              </a>
              <a 
                href="https://map.naver.com/p/search/${encodeURIComponent(store.name)}" 
                target="_blank" 
                rel="noreferrer"
                class="flex-1 py-1.5 text-center bg-[#03C75A] hover:bg-[#02b350] text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
              >
                네이버검색
              </a>
              <button 
                id="btn-detail-${store.id}" 
                class="px-2.5 py-1.5 bg-[#8B1D24] hover:bg-[#72151b] text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
              >
                상세
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
        minWidth: 290,
      });

      marker.on('popupopen', () => {
        onSelectStore(store);
        // Bind detail button inside popup
        setTimeout(() => {
          const detailBtn = document.getElementById(`btn-detail-${store.id}`);
          if (detailBtn) {
            detailBtn.onclick = () => onOpenDetailModal(store);
          }
        }, 50);
      });

      marker.addTo(markerGroup);
      storeMarkerMapRef.current[store.name] = marker;
    });
  }, [stores, currentFilter, currentCollege, onSelectStore, onOpenDetailModal]);

  // 3. Focus selected store on map
  useEffect(() => {
    if (!selectedStore || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.flyTo([selectedStore.lat, selectedStore.lng], 17, {
      duration: 0.9,
    });

    const marker = storeMarkerMapRef.current[selectedStore.name];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 700);
    }
  }, [selectedStore]);

  // 4. Handle Single Gate Pulse Marker
  useEffect(() => {
    if (!isGateFocused || !mapInstanceRef.current || !gateGroupRef.current) return;

    const map = mapInstanceRef.current;
    const gateGroup = gateGroupRef.current;

    // Clear previous gate markers
    gateGroup.clearLayers();

    // Fly to Kyung Hee Univ Gate coordinates
    map.flyTo([KHU_GATE_LOCATION.lat, KHU_GATE_LOCATION.lng], 17, {
      duration: 0.9,
    });

    // Create single pulsing gate marker
    const gateIcon = L.divIcon({
      html: `<div class="single-gate-marker-pulse" title="${KHU_GATE_LOCATION.name}">🏛️</div>`,
      className: '',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20],
    });

    const gateMarker = L.marker([KHU_GATE_LOCATION.lat, KHU_GATE_LOCATION.lng], { icon: gateIcon });

    const gatePopupHtml = `
      <div class="p-3 text-center bg-white rounded-xl">
        <div class="text-2xl mb-1">🏛️</div>
        <h4 class="text-sm font-extrabold text-[#8B1D24] mb-0.5">
          ${KHU_GATE_LOCATION.name}
        </h4>
        <p class="text-xs text-gray-600 font-medium mb-1.5">
          ${KHU_GATE_LOCATION.desc}
        </p>
        <p class="text-[10px] text-gray-400">
          📍 ${KHU_GATE_LOCATION.addr}
        </p>
      </div>
    `;

    gateMarker.bindPopup(gatePopupHtml, { minWidth: 220 });
    gateMarker.addTo(gateGroup);

    setTimeout(() => {
      gateMarker.openPopup();
    }, 600);

    onGateFocusReset();
  }, [isGateFocused, onGateFocusReset]);

  return <div id="map" ref={mapContainerRef} className="w-full h-full" />;
};
