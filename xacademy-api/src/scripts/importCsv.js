import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { sequelize } from '../db/connection.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import {
  JugadorModel,
  VersionJugadorModel,
  VersionJugadorPosicionModel,
  VersionJugadorSkillModel,
  NacionalidadModel,
  ClubModel,
  VersionModel,
  PosicionModel,
  SkillModel,
} from '../db/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto (3 niveles arriba de src/scripts/)
config({ path: path.join(__dirname, '../../../.env') });
// Leer el CSV
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('❌ Uso: node src/scripts/importCsv.js <ruta-del-csv>');
  process.exit(1);
}

const csvContent = fs.readFileSync(path.resolve(csvPath), 'utf-8');
const rows = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`📋 Total de filas a procesar: ${rows.length}`);

// Cache para evitar queries repetidas
const cache = {
  nacionalidades: {},
  clubs: {},
  versiones: {},
  posiciones: {},
  skills: {},
};

async function loadCache() {
  const [nacs, clubs, vers, poss, skills] = await Promise.all([
    NacionalidadModel.findAll(),
    ClubModel.findAll(),
    VersionModel.findAll(),
    PosicionModel.findAll(),
    SkillModel.findAll(),
  ]);

  nacs.forEach(n => cache.nacionalidades[n.Nombre.toLowerCase()] = n.Id);
  clubs.forEach(c => cache.clubs[c.Nombre.toLowerCase()] = c.Id);
  vers.forEach(v => cache.versiones[v.Nombre.toLowerCase()] = v.Id);
  poss.forEach(p => cache.posiciones[p.Nombre.toLowerCase()] = p.Id);
  skills.forEach(s => cache.skills[s.Nombre.toLowerCase()] = { id: s.Id, esArquero: s.EsArquero });

  console.log('✅ Cache cargado');
}

async function processRow(row) {
  const idNacionalidad = cache.nacionalidades[row.nacionalidad?.toLowerCase()];
  const idClub = cache.clubs[row.club?.toLowerCase()];
  const idVersion = cache.versiones[row.version?.toLowerCase()];
  const idPosicion = cache.posiciones[row.posicionPrincipal?.toLowerCase()];

  if (!idNacionalidad || !idClub || !idVersion || !idPosicion) {
    console.warn(`⚠️ Saltando ${row.nombre} ${row.apellido} — datos no encontrados:`, {
      nacionalidad: row.nacionalidad,
      club: row.club,
      version: row.version,
      posicion: row.posicionPrincipal,
    });
    return;
  }

  const t = await sequelize.transaction();
  try {
    // Buscar si ya existe el jugador
    let jugador = await JugadorModel.findOne({
      where: {
        Nombre: row.nombre,
        Apellido: row.apellido,
        FechaNacimiento: row.fechaNacimiento || null,
      },
      transaction: t,
    });

    if (!jugador) {
      jugador = await JugadorModel.create({
        Nombre: row.nombre,
        Apellido: row.apellido,
        FechaNacimiento: row.fechaNacimiento || null,
        EsHombre: row.esHombre === 'true' || row.esHombre === true,
        EsRetirado: false,
        AnioRetiro: null,
        EsDelJuegoBase: true,
        EsActivo: true,
        IdNacionalidad: idNacionalidad,
        IdUsuarioCreador: null,
      }, { transaction: t });
    }

    // Buscar si ya existe la versión del jugador
    let versionJugador = await VersionJugadorModel.findOne({
      where: { IdJugador: jugador.Id, IdVersion: idVersion },
      transaction: t,
    });

    if (!versionJugador) {
      versionJugador = await VersionJugadorModel.create({
        IdJugador: jugador.Id,
        IdVersion: idVersion,
        IdClub: idClub,
        ImagenPath: null,
        Calificacion: parseInt(row.calificacion) || 0,
      }, { transaction: t });
    } else {
      await VersionJugadorModel.update({
        IdClub: idClub,
        Calificacion: parseInt(row.calificacion) || 0,
      }, {
        where: { Id: versionJugador.Id },
        transaction: t,
      });
    }

    // Reemplazar posiciones
    await VersionJugadorPosicionModel.destroy({
      where: { IdVersionJugador: versionJugador.Id },
      transaction: t,
    });
    await VersionJugadorPosicionModel.create({
      IdVersionJugador: versionJugador.Id,
      IdPosicion: idPosicion,
      EsPrincipal: true,
    }, { transaction: t });

    // Reemplazar skills
    const skillNames = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY', 'DIV', 'HAN', 'KIC', 'REF', 'SPE', 'POS'];
    const skillsData = skillNames
      .filter(name => row[name] !== undefined && row[name] !== '')
      .map(name => {
        const skill = cache.skills[name.toLowerCase()];
        if (!skill) return null;
        return {
          IdVersionJugador: versionJugador.Id,
          IdSkill: skill.id,
          Valor: parseInt(row[name]) || 0,
        };
      })
      .filter(Boolean);

    if (skillsData.length > 0) {
      await VersionJugadorSkillModel.destroy({
        where: { IdVersionJugador: versionJugador.Id },
        transaction: t,
      });
      await VersionJugadorSkillModel.bulkCreate(skillsData, { transaction: t });
    }

    await t.commit();
    console.log(`✅ ${row.nombre} ${row.apellido} (${row.version})`);
  } catch (error) {
    await t.rollback();
    console.error(`❌ Error procesando ${row.nombre} ${row.apellido}:`, error.message);
  }
}

async function main() {
  await loadCache();

  let procesados = 0;
  let errores = 0;

  for (const row of rows) {
    try {
      await processRow(row);
      procesados++;
    } catch {
      errores++;
    }
  }

  console.log(`\n📊 Resultado: ${procesados} procesados, ${errores} errores`);
  process.exit(0);
}

main();