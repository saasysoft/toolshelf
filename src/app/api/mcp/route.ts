import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '@/lib/mcp-server';

// Stateless mode: create fresh server+transport per request
async function handleMcpRequest(request: Request): Promise<Response> {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  await server.connect(transport);

  // Access the web-standard transport that accepts Web API Request/Response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webTransport = (transport as any)._webStandardTransport;

  if (webTransport?.handleRequest) {
    const response = await webTransport.handleRequest(request);
    return response;
  }

  // Fallback: shouldn't reach here with MCP SDK v1.26+
  return Response.json(
    { error: 'MCP transport not available' },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}
