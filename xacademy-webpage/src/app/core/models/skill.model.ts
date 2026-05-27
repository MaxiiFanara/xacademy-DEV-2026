export interface Skill {
  idSkill: number;
  nombre?: string;
}

export interface PlayerSkill {
  idSkill: number;
  valor: number;
}

export interface SkillEvolution {
  version: string;
  año: number;
  valor: number;
}