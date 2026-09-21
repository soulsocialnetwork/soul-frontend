import type { LucideIcon } from 'lucide-react';
import {
  Archive, Book, BookOpen, Globe, HandHeart, Heart, Laptop, Leaf,
  MessageSquare, Music, Palette, Plane, Smile, Sun, Trophy, Users,
} from 'lucide-react';

export type CategoryId =
  | 'knowledge' | 'art' | 'reflection' | 'help' | 'nature' | 'music'
  | 'wellness' | 'travel' | 'food' | 'books' | 'gratitude' | 'humor'
  | 'technology' | 'sports' | 'community' | 'moment' | 'memory' | 'cause';

export type SoulCategory = { id: CategoryId; label: string; icon: LucideIcon };

export const SOUL_CATEGORIES: readonly SoulCategory[] = [
  { id: 'knowledge', label: 'Conhecimento', icon: Book },
  { id: 'art', label: 'Arte & Criatividade', icon: Palette },
  { id: 'reflection', label: 'Reflexão', icon: MessageSquare },
  { id: 'help', label: 'Dúvida & Ajuda', icon: HandHeart },
  { id: 'nature', label: 'Natureza', icon: Leaf },
  { id: 'music', label: 'Música', icon: Music },
  { id: 'wellness', label: 'Bem-estar', icon: Smile },
  { id: 'travel', label: 'Viagem', icon: Plane },
  { id: 'food', label: 'Gastronomia', icon: Globe },
  { id: 'books', label: 'Livros & Leitura', icon: BookOpen },
  { id: 'gratitude', label: 'Gratidão', icon: Heart },
  { id: 'humor', label: 'Humor', icon: Smile },
  { id: 'technology', label: 'Tecnologia', icon: Laptop },
  { id: 'sports', label: 'Esportes', icon: Trophy },
  { id: 'community', label: 'Comunidade', icon: Users },
  { id: 'moment', label: 'Momento do Dia', icon: Sun },
  { id: 'memory', label: 'Memória', icon: Archive },
  { id: 'cause', label: 'Causa Social', icon: Globe },
];

export const CATEGORY_BY_ID = new Map(SOUL_CATEGORIES.map(category => [category.id, category]));
