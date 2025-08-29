import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(_request: NextRequest) {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/mcp/methods`);
    if (!resp.ok) {
      throw new Error(`Backend responded with ${resp.status}`);
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('MCP methods proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch MCP methods' }, { status: 500 });
  }
}
