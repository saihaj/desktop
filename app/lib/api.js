import { Router } from 'express'
import { basename } from 'path'
import { hostname, platform, arch, cpus } from 'os'
import { readJSON } from 'fs-extra'

import { CUSTOM_THEMES_FOLDER } from './consts'
import { listCSSFiles } from './utils'
import { getSources, getLanguages } from './db'

const api = Router()

// Register heartbeat route
api.get( '/heartbeat', ( _, res ) => res.send( 'alive' ) )

// Serve any themes
api.get( '/themes', ( _, res ) => Promise.all( (
  [ 'frontend/src/themes', CUSTOM_THEMES_FOLDER ].map( listCSSFiles )
) ).then( ( [ themes, customThemes ] ) => res.json( [ ...themes, ...customThemes ].map( x => basename( x, '.css' ) ) ) ) )

// Version information
api.get( '/about', ( _, res ) => Promise.all( [
  readJSON( 'package.json', 'utf-8' ),
  readJSON( 'node_modules/@shabados/database/package.json', 'utf-8' ),
] ).then( ( [ { version }, { version: databaseVersion } ] ) => res.json( {
  version,
  databaseVersion,
  hostname: hostname(),
  arch: arch(),
  cpus: `${cpus().length}x ${cpus()[ 0 ].model}`,
  platform: platform(),
} ) ) )

// Gurbani Sources, with possible and recommended translations
api.get( '/sources', ( _, res ) => getSources().then( sources => res.json( sources ) ) )

// Gurbani Sources, with possible translations
api.get( '/languages', ( _, res ) => getLanguages().then( languages => res.json( { languages } ) ) )

export default api