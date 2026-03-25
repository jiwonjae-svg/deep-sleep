import { CategoryInfo } from '@/types';

export const categories: CategoryInfo[] = [
  { id: 'rain-water', name: '비 & 물', nameEn: 'Rain & Water', emoji: '🌧️', color: '#5B9BD5' },
  { id: 'ocean-beach', name: '바다 & 해변', nameEn: 'Ocean & Beach', emoji: '🌊', color: '#2E86AB' },
  { id: 'wind-weather', name: '바람 & 날씨', nameEn: 'Wind & Weather', emoji: '💨', color: '#87CEEB' },
  { id: 'forest-nature', name: '숲 & 자연', nameEn: 'Forest & Nature', emoji: '🌲', color: '#6BCB77' },
  { id: 'fire-warmth', name: '불 & 따뜻함', nameEn: 'Fire & Warmth', emoji: '🔥', color: '#FF8C42' },
  { id: 'indoor-ambient', name: '실내 & 일상', nameEn: 'Indoor & Ambient', emoji: '🏠', color: '#D4A574' },
  { id: 'urban-transport', name: '도시 & 교통', nameEn: 'Urban & Transport', emoji: '🏙️', color: '#8D93AB' },
  { id: 'musical-tonal', name: '음악 & 톤', nameEn: 'Musical & Tonal', emoji: '🎵', color: '#9B72CF' },
  { id: 'special-environments', name: '특수 환경', nameEn: 'Special', emoji: '✨', color: '#2EC4B6' },
  { id: 'seasonal-special', name: '계절 & 특별', nameEn: 'Seasonal', emoji: '🌸', color: '#E8A0BF' },
];

export function getCategoryById(id: string): CategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}
