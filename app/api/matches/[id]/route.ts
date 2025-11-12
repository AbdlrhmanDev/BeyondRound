// Temporary re-export for backward compatibility
// TODO: Remove after migrating all clients to /api/v1/matches/[id]

import { GET as V1GET } from '../../v1/matches/[id]/route';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  return V1GET(req, context);
}

