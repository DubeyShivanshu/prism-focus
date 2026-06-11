import { blockRepository } from '../repositories/blockRepository.js'
import { ApiError }        from '../utils/apiError.js'

export const blockService = {
  // List all blocked sites for user
  async list(userId) {
    return blockRepository.findByUser(userId)
  },

  // Get enabled rules (for extension)
  async getEnabledRules(userId) {
    return blockRepository.findEnabled(userId)
  },

  // Add a site
  async add(userId, { domain, name, category, frictionLevel, schedule }) {
    const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase()

    const existing = await blockRepository.findByDomainAndUser(clean, userId)
    if (existing) throw new ApiError(409, `${clean} is already in your list`)

    return blockRepository.create({
      user: userId,
      domain: clean,
      name: name || clean,
      category,
      frictionLevel,
      schedule,
    })
  },

  // Update a site
  async update(siteId, userId, updates) {
    const site = await blockRepository.findByIdAndUser(siteId, userId)
    if (!site) throw new ApiError(404, 'Blocked site not found')

    // Never let domain be changed (would break extension rules)
    const { domain: _domain, user: _user, ...safe } = updates

    return blockRepository.update(siteId, safe)
  },

  // Remove a site
  async remove(siteId, userId) {
    const site = await blockRepository.findByIdAndUser(siteId, userId)
    if (!site) throw new ApiError(404, 'Blocked site not found')
    await blockRepository.delete(siteId)
  },

  // Toggle enabled/disabled
  async toggle(siteId, userId) {
    const site = await blockRepository.findByIdAndUser(siteId, userId)
    if (!site) throw new ApiError(404, 'Blocked site not found')
    return blockRepository.update(siteId, { isEnabled: !site.isEnabled })
  },
}
