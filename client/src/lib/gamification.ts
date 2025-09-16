export interface GamificationLevel {
  id: number;
  name: string;
  mount: string;
  minPoints: number;
  maxPoints?: number;
  color: string;
  benefits: string[];
  icon: string;
}

export const GAMIFICATION_LEVELS: GamificationLevel[] = [
  {
    id: 0,
    name: "Vale do Jordão",
    mount: "Vale do Jordão",
    minPoints: 0,
    maxPoints: 299,
    color: "text-gray-600",
    benefits: [
      "Acesso ao app",
      "Notificações de eventos",
      "Visualização do calendário"
    ],
    icon: "valley"
  },
  {
    id: 1,
    name: "Monte Sinai",
    mount: "Monte Sinai",
    minPoints: 300,
    maxPoints: 399,
    color: "text-orange-600",
    benefits: [
      "Chat com líderes",
      "Inscrição em atividades",
      "Acesso a estudos bíblicos"
    ],
    icon: "mountain-1"
  },
  {
    id: 2,
    name: "Monte Nebo",
    mount: "Monte Nebo",
    minPoints: 400,
    maxPoints: 499,
    color: "text-blue-600",
    benefits: [
      "Criação de grupos",
      "Acesso a relatórios",
      "Participação em eventos especiais"
    ],
    icon: "mountain-2"
  },
  {
    id: 3,
    name: "Monte Moriá",
    mount: "Monte Moriá",
    minPoints: 500,
    maxPoints: 599,
    color: "text-purple-600",
    benefits: [
      "Organização de eventos",
      "Mentoria de novos membros",
      "Acesso a recursos avançados"
    ],
    icon: "mountain-3"
  },
  {
    id: 4,
    name: "Monte Carmelo",
    mount: "Monte Carmelo",
    minPoints: 600,
    maxPoints: 699,
    color: "text-green-600",
    benefits: [
      "Liderança de departamentos",
      "Treinamento de outros membros",
      "Acesso prioritário a eventos"
    ],
    icon: "mountain-4"
  },
  {
    id: 5,
    name: "Monte Hermon",
    mount: "Monte Hermon",
    minPoints: 700,
    maxPoints: 799,
    color: "text-indigo-600",
    benefits: [
      "Coordenação de projetos",
      "Representação da igreja",
      "Acesso a recursos exclusivos"
    ],
    icon: "mountain-5"
  },
  {
    id: 6,
    name: "Monte Sião",
    mount: "Monte Sião",
    minPoints: 800,
    maxPoints: 899,
    color: "text-red-600",
    benefits: [
      "Liderança ministerial",
      "Aconselhamento pastoral",
      "Status VIP completo"
    ],
    icon: "mountain-6"
  },
  {
    id: 7,
    name: "Monte das Oliveiras",
    mount: "Monte das Oliveiras",
    minPoints: 900,
    maxPoints: 999,
    color: "text-yellow-600",
    benefits: [
      "Ministério completo",
      "Acesso a todas as funcionalidades",
      "Reconhecimento especial"
    ],
    icon: "mountain-7"
  },
  {
    id: 8,
    name: "Canaã",
    mount: "Canaã",
    minPoints: 1000,
    color: "text-gold-600",
    benefits: [
      "Status máximo",
      "Todas as funcionalidades",
      "Reconhecimento especial",
      "Badges exclusivos",
      "A terra prometida alcançada 🌟"
    ],
    icon: "mountain-8"
  }
];

export function getLevelByPoints(points: number): GamificationLevel {
  const level = GAMIFICATION_LEVELS.find(l => 
    points >= l.minPoints && (!l.maxPoints || points <= l.maxPoints)
  );
  
  return level || GAMIFICATION_LEVELS[0];
}

export function getNextLevel(points: number): GamificationLevel | null {
  const currentLevel = getLevelByPoints(points);
  const nextLevel = GAMIFICATION_LEVELS.find(l => l.id === currentLevel.id + 1);
  
  return nextLevel || null;
}

export function getProgressToNextLevel(points: number): number {
  const currentLevel = getLevelByPoints(points);
  const nextLevel = getNextLevel(points);
  
  if (!nextLevel) return 100;
  
  const currentLevelPoints = points - currentLevel.minPoints;
  const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
  
  return Math.min((currentLevelPoints / pointsNeededForNext) * 100, 100);
}

export function getPointsToNextLevel(points: number): number {
  const nextLevel = getNextLevel(points);
  
  if (!nextLevel) return 0;
  
  return nextLevel.minPoints - points;
}

export function getMountName(points: number): string {
  const level = getLevelByPoints(points);
  return level.mount;
}

export function getLevelName(points: number): string {
  const level = getLevelByPoints(points);
  return level.name;
}

export function getLevelColor(points: number): string {
  const level = getLevelByPoints(points);
  return level.color;
}

export function getLevelIcon(points: number): string {
  const level = getLevelByPoints(points);
  return level.icon;
} 