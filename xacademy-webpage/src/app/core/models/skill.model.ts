export interface Skill {
  Id: number;
  Nombre: string;
  EsArquero: boolean;
}

export interface PlayerSkill {
  idSkill: number;
  valor: number;
}

export interface SkillEvolution {
  version: string;
  anio: number;
  valor: number;
}