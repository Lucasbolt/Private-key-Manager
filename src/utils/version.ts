import { version } from '../version.js'

/**
 * Fetches the latest version of the application from the package.json file.
 * @returns {string} The latest version string.
 */
export function getLatestVersion(): string {
    return version
}