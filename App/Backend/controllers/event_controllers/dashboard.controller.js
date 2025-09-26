import Event from '../../models/event.model.js'
import Team from '../../models/team.model.js'

// Helper: get team ids for a user (leader or member)
async function getUserTeamIds(userId) {
  const teams = await Team.find({
    $or: [
      { leader: userId },
      { 'members.user': userId },
    ],
  }).select('_id').lean()
  return teams.map((t) => t._id)
}

export async function getEventsForUser(req, res) {
  try {
    const userId = req.user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' })
    const teamIds = await getUserTeamIds(userId)
    const events = await Event.find({ createdBy: { $in: teamIds } }).lean()
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getPublishedEvents(req, res) {
  try {
    const userId = req.user?._id
    const teamIds = await getUserTeamIds(userId)
    const events = await Event.find({ createdBy: { $in: teamIds }, status: 'published' }).lean()
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getDraftEvents(req, res) {
  try {
    const userId = req.user?._id
    const teamIds = await getUserTeamIds(userId)
    const events = await Event.find({ createdBy: { $in: teamIds }, status: 'draft' }).lean()
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// Stubs for registration logs and check-ins (replace with your collections)
export async function getRegistrationLogs(req, res) {
  try {
    const { eventId } = req.params
    // TODO: Join with real Registration model when available
    res.json([])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getCheckIns(req, res) {
  try {
    const { eventId } = req.params
    // TODO: Join with real CheckIn model when available
    res.json([])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}


