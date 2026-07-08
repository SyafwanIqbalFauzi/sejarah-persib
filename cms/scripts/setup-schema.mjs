// Schema-as-code setup for Directus, based on PRD §6.
// Run with: node cms/scripts/setup-schema.mjs
// Reads DIRECTUS_URL / DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD from ../../.env

import { api, login, ensureForeignKey, closePg } from './lib/directus-client.mjs'

async function ensureCollection(def) {
  const exists = await api(`/collections/${def.collection}`).catch(() => null)
  if (exists) {
    console.log(`= collection ${def.collection} already exists, skipping`)
    return
  }
  await api('/collections', { method: 'POST', body: JSON.stringify(def) })
  console.log(`+ created collection ${def.collection}`)
}

async function ensureField(collection, field) {
  const exists = await api(`/fields/${collection}/${field.field}`).catch(() => null)
  if (exists) {
    console.log(`= field ${collection}.${field.field} already exists, skipping`)
    return
  }
  await api(`/fields/${collection}`, { method: 'POST', body: JSON.stringify(field) })
  console.log(`+ created field ${collection}.${field.field}`)
}

async function ensureFieldMeta(collection, field, meta) {
  const existing = await api(`/fields/${collection}/${field}`).catch(() => null)
  if (existing && existing.data.meta?.interface === meta.interface) {
    console.log(`= field ${collection}.${field} interface already ${meta.interface}, skipping`)
    return
  }
  await api(`/fields/${collection}/${field}`, { method: 'PATCH', body: JSON.stringify({ meta }) })
  console.log(`~ updated field ${collection}.${field} interface -> ${meta.interface}`)
}

async function dropField(collection, field) {
  const existing = await api(`/fields/${collection}/${field}`).catch(() => null)
  if (!existing) {
    console.log(`= field ${collection}.${field} already absent, skipping`)
    return
  }
  await api(`/fields/${collection}/${field}`, { method: 'DELETE' })
  console.log(`- dropped field ${collection}.${field}`)
}

async function ensureRelation(relation) {
  const existing = await api(`/relations/${relation.collection}/${relation.field}`).catch(() => null)
  if (existing) {
    console.log(`= relation ${relation.collection}.${relation.field} already exists, skipping`)
    return
  }
  await api('/relations', { method: 'POST', body: JSON.stringify(relation) })
  console.log(`+ created relation ${relation.collection}.${relation.field} -> ${relation.related_collection}`)
}


const pk = (type = 'integer') => ({
  field: 'id',
  type,
  meta: { hidden: true, interface: 'input', readonly: true },
  schema: { is_primary_key: true, has_auto_increment: type === 'integer' }
})

const statusField = () => ({
  field: 'status',
  type: 'string',
  meta: {
    width: 'full',
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
        { text: 'Archived', value: 'archived' }
      ]
    },
    display: 'labels',
    display_options: {
      showAsDot: true,
      choices: [
        { value: 'published', color: '#00C897' },
        { value: 'draft', color: '#D3DAE4' },
        { value: 'archived', color: '#FB8C00' }
      ]
    }
  },
  schema: { default_value: 'draft', is_nullable: false }
})

const sortField = () => ({
  field: 'sort',
  type: 'integer',
  meta: { interface: 'input', hidden: true },
  schema: { is_nullable: true }
})

const collectionMeta = (name, { withStatus = true } = {}) => ({
  collection: name,
  meta: {
    icon: 'box',
    ...(withStatus
      ? { archive_field: 'status', archive_app_filter: true, archive_value: 'archived', unarchive_value: 'draft', sort_field: 'sort' }
      : {})
  },
  schema: {},
  fields: [pk(), ...(withStatus ? [statusField(), sortField()] : [])]
})

function textField(field, { required = false, label, choices, richText = false } = {}) {
  return {
    field,
    type: choices ? 'string' : 'text',
    meta: {
      interface: choices ? 'select-dropdown' : (richText ? 'input-rich-text-html' : 'input-multiline'),
      required,
      note: label,
      ...(choices ? { options: { choices: choices.map((c) => ({ text: c, value: c })) } } : {})
    },
    schema: { is_nullable: !required }
  }
}

function stringField(field, opts = {}) {
  return {
    field,
    type: 'string',
    meta: { interface: 'input', required: !!opts.required, note: opts.label },
    schema: { is_nullable: !opts.required, is_unique: !!opts.unique }
  }
}

function intField(field, label) {
  return { field, type: 'integer', meta: { interface: 'input', note: label }, schema: { is_nullable: true } }
}

function dateField(field, label) {
  return { field, type: 'date', meta: { interface: 'datetime', note: label }, schema: { is_nullable: true } }
}

function m2oField(field, relatedCollection, relatedPkType = 'integer') {
  return {
    fieldDef: { field, type: relatedPkType, meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: true } },
    relation: { collection: null, field, related_collection: relatedCollection }
  }
}

function fileField(field, label) {
  return {
    fieldDef: { field, type: 'uuid', meta: { interface: 'file-image', special: ['file'], note: label }, schema: { is_nullable: true } },
    relation: { field, related_collection: 'directus_files' }
  }
}

function multiCheckboxField(field, choices, label) {
  return {
    field,
    type: 'csv',
    meta: {
      interface: 'select-multiple-checkbox',
      special: ['cast-csv'],
      note: label,
      options: { choices: choices.map((c) => ({ text: c, value: c })) }
    },
    schema: { is_nullable: true }
  }
}

async function patchField(collection, field, body) {
  await api(`/fields/${collection}/${field}`, { method: 'PATCH', body: JSON.stringify(body) })
  console.log(`~ patched field ${collection}.${field}`)
}

// --- Translations helper -------------------------------------------------
// Wires up the standard Directus "Translations" pattern: a `<collection>_translations`
// junction joined to `languages`, exposed as an alias field named `translations`.
async function addTranslations(collection, textFields) {
  const transCollection = `${collection}_translations`
  const fkField = `${collection}_id`

  await ensureCollection({
    collection: transCollection,
    meta: { icon: 'translate', hidden: true },
    schema: {},
    fields: [pk(), ...textFields]
  })

  await ensureField(collection, {
    field: 'translations',
    type: 'alias',
    meta: {
      interface: 'translations',
      special: ['translations'],
      options: { languageField: 'name', defaultLanguage: 'id-ID' }
    }
  })

  await ensureField(transCollection, {
    field: fkField,
    type: 'integer',
    meta: { interface: 'select-dropdown-m2o', hidden: true },
    schema: { is_nullable: false }
  })
  await ensureField(transCollection, {
    field: 'languages_code',
    type: 'string',
    meta: { interface: 'select-dropdown-m2o', hidden: true },
    schema: { is_nullable: false }
  })

  await ensureRelation({
    collection: transCollection,
    field: fkField,
    related_collection: collection,
    meta: { one_field: 'translations', junction_field: 'languages_code', sort_field: null },
    schema: { on_delete: 'CASCADE' }
  })
  await ensureForeignKey(transCollection, fkField, collection, 'CASCADE')
  await ensureRelation({
    collection: transCollection,
    field: 'languages_code',
    related_collection: 'languages',
    meta: { junction_field: fkField }
  })
}

async function main() {
  console.log('Logging in to Directus...')
  await login()
  console.log('Logged in.')

  // 1. languages -----------------------------------------------------------
  await ensureCollection({
    collection: 'languages',
    meta: { icon: 'translate' },
    schema: {},
    fields: [
      { field: 'code', type: 'string', meta: { interface: 'input', readonly: true }, schema: { is_primary_key: true } },
      stringField('name', { required: true })
    ]
  })
  for (const row of [{ code: 'id-ID', name: 'Bahasa Indonesia' }, { code: 'en-US', name: 'English' }]) {
    const existing = await api(`/items/languages/${row.code}`).catch(() => null)
    if (!existing) await api('/items/languages', { method: 'POST', body: JSON.stringify(row) })
  }
  console.log('+ seeded languages (id-ID, en-US)')

  // 2. sources ---------------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('sources'),
    fields: [
      ...collectionMeta('sources').fields,
      stringField('nama_sumber', { required: true }),
      stringField('url'),
      textField('tipe', { choices: ['buku', 'artikel', 'wawancara', 'situs_web', 'lainnya'] }),
      textField('catatan')
    ]
  })

  const sourceRef = (label) => ({
    fieldDef: { field: 'sumber_utama', type: 'integer', meta: { interface: 'select-dropdown-m2o', note: label }, schema: { is_nullable: true } },
    relation: { field: 'sumber_utama', related_collection: 'sources', schema: { on_delete: 'SET NULL' } }
  })

  // 3. eras --------------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('eras'),
    fields: [
      ...collectionMeta('eras').fields,
      stringField('slug', { required: true, unique: true }),
      intField('tahun_mulai'),
      intField('tahun_selesai')
    ]
  })
  await ensureField('eras', sourceRef().fieldDef)
  await ensureRelation({ collection: 'eras', ...sourceRef().relation })
  await ensureForeignKey('eras', 'sumber_utama', 'sources', 'SET NULL')
  await addTranslations('eras', [textField('nama_era', { required: true }), textField('deskripsi', { richText: true })])
  await ensureFieldMeta('eras_translations', 'deskripsi', { interface: 'input-rich-text-html' })

  // 4. coaches -------------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('coaches'),
    fields: [
      ...collectionMeta('coaches').fields,
      stringField('slug', { required: true, unique: true }),
      stringField('nama', { required: true }),
      dateField('periode_mulai'),
      dateField('periode_selesai')
    ]
  })
  await ensureField('coaches', sourceRef().fieldDef)
  await ensureRelation({ collection: 'coaches', ...sourceRef().relation })
  await ensureForeignKey('coaches', 'sumber_utama', 'sources', 'SET NULL')
  await addTranslations('coaches', [textField('pencapaian')])

  // 5. players ---------------------------------------------------------------
  const posisiChoices = [
    'Kiper',
    'Bek Tengah',
    'Bek Sayap',
    'Gelandang Bertahan',
    'Gelandang Tengah',
    'Gelandang Serang',
    'Sayap Kanan',
    'Sayap Kiri',
    'Penyerang Tengah',
    'Penyerang Kedua'
  ]

  await ensureCollection({
    ...collectionMeta('players'),
    fields: [
      ...collectionMeta('players').fields,
      stringField('slug', { required: true, unique: true }),
      stringField('nama', { required: true }),
      multiCheckboxField('posisi', posisiChoices),
      intField('tahun_aktif_mulai'),
      intField('tahun_aktif_selesai')
    ]
  })
  await ensureField('players', sourceRef().fieldDef)
  await ensureRelation({ collection: 'players', ...sourceRef().relation })
  await ensureForeignKey('players', 'sumber_utama', 'sources', 'SET NULL')
  await ensureField('players', fileField('foto', 'Foto pemain').fieldDef)
  await ensureRelation({ collection: 'players', ...fileField('foto').relation })
  await ensureField('players', stringField('nama_lengkap', { label: 'Nama lengkap' }))
  await ensureField('players', stringField('tempat_lahir', { label: 'Tempat lahir' }))
  await ensureField('players', dateField('tanggal_lahir', 'Tanggal lahir'))
  await ensureField('players', intField('jumlah_laga', 'Jumlah laga (caps)'))
  await ensureField('players', intField('jumlah_gol', 'Jumlah gol'))
  await ensureField('players', intField('jumlah_assist', 'Jumlah assist'))
  await patchField('players', 'posisi', multiCheckboxField('posisi', posisiChoices))
  await addTranslations('players', [textField('biodata', { richText: true })])
  await patchField('players_translations', 'biodata', { meta: { interface: 'input-rich-text-html' } })

  // 6. seasons -----------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('seasons'),
    fields: [
      ...collectionMeta('seasons').fields,
      stringField('nama_kompetisi'),
      stringField('hasil_akhir'),
      intField('posisi_klasemen'),
      intField('tahun_mulai'),
      intField('tahun_selesai'),
      textField('keterangan')
    ]
  })
  await dropField('seasons', 'nama_musim')
  await ensureField('seasons', intField('tahun_mulai'))
  await ensureField('seasons', intField('tahun_selesai'))
  await ensureField('seasons', textField('keterangan'))
  await ensureField('seasons', { field: 'era', type: 'integer', meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: true } })
  await ensureRelation({ collection: 'seasons', field: 'era', related_collection: 'eras', schema: { on_delete: 'SET NULL' } })
  await ensureForeignKey('seasons', 'era', 'eras', 'SET NULL')

  // 7. matches -----------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('matches'),
    fields: [
      ...collectionMeta('matches').fields,
      dateField('tanggal'),
      stringField('lawan', { required: true }),
      stringField('skor'),
      textField('kategori', { choices: ['biasa', 'ikonik'] })
    ]
  })
  await ensureField('matches', { field: 'season', type: 'integer', meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: true } })
  await ensureRelation({ collection: 'matches', field: 'season', related_collection: 'seasons', schema: { on_delete: 'SET NULL' } })
  await ensureForeignKey('matches', 'season', 'seasons', 'SET NULL')
  await ensureField('matches', sourceRef().fieldDef)
  await ensureRelation({ collection: 'matches', ...sourceRef().relation })
  await ensureForeignKey('matches', 'sumber_utama', 'sources', 'SET NULL')
  await addTranslations('matches', [textField('deskripsi_naratif')])

  // 8. player_season_stats (no status/translations — pure stats join table) --
  await ensureCollection({
    collection: 'player_season_stats',
    meta: { icon: 'query_stats' },
    schema: {},
    fields: [
      pk(),
      intField('jumlah_laga'),
      intField('gol'),
      intField('assist'),
      intField('kartu_kuning'),
      intField('kartu_merah')
    ]
  })
  await ensureField('player_season_stats', { field: 'player', type: 'integer', meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: false } })
  await ensureRelation({ collection: 'player_season_stats', field: 'player', related_collection: 'players', schema: { on_delete: 'CASCADE' } })
  await ensureForeignKey('player_season_stats', 'player', 'players', 'CASCADE')
  await ensureField('player_season_stats', { field: 'season', type: 'integer', meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: false } })
  await ensureRelation({ collection: 'player_season_stats', field: 'season', related_collection: 'seasons', schema: { on_delete: 'CASCADE' } })
  await ensureForeignKey('player_season_stats', 'season', 'seasons', 'CASCADE')

  // 9. trophies ------------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('trophies'),
    fields: [
      ...collectionMeta('trophies').fields,
      stringField('nama_gelar', { required: true }),
      intField('tahun'),
      stringField('kompetisi'),
      textField('jenis', { choices: ['klub', 'individu'] })
    ]
  })
  // Trophies relate to eras transitively via season (era -> season -> trophy),
  // not directly — a trophy is won in a specific season, and that season already
  // belongs to an era, so a direct trophies.era field would be a redundant/wrong path.
  await dropField('trophies', 'era')
  await ensureField('trophies', { field: 'season', type: 'integer', meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: true } })
  await ensureRelation({ collection: 'trophies', field: 'season', related_collection: 'seasons', schema: { on_delete: 'SET NULL' } })
  await ensureForeignKey('trophies', 'season', 'seasons', 'SET NULL')
  await ensureField('trophies', sourceRef().fieldDef)
  await ensureRelation({ collection: 'trophies', ...sourceRef().relation })
  await ensureForeignKey('trophies', 'sumber_utama', 'sources', 'SET NULL')

  // 10. stories --------------------------------------------------------------
  await ensureCollection({
    ...collectionMeta('stories'),
    fields: [
      ...collectionMeta('stories').fields,
      stringField('slug', { required: true, unique: true }),
      textField('tipe', { choices: ['fun_fact', 'cerita_panjang'] })
    ]
  })
  for (const [f, related] of [['era', 'eras'], ['player', 'players'], ['match', 'matches'], ['coach', 'coaches']]) {
    await ensureField('stories', { field: f, type: 'integer', meta: { interface: 'select-dropdown-m2o' }, schema: { is_nullable: true } })
    await ensureRelation({ collection: 'stories', field: f, related_collection: related, schema: { on_delete: 'SET NULL' } })
    await ensureForeignKey('stories', f, related, 'SET NULL')
  }
  await ensureField('stories', sourceRef().fieldDef)
  await ensureRelation({ collection: 'stories', ...sourceRef().relation })
  await ensureForeignKey('stories', 'sumber_utama', 'sources', 'SET NULL')
  await addTranslations('stories', [textField('judul', { required: true }), textField('isi')])

  console.log('\nDone. Schema created per PRD §6.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => closePg())
