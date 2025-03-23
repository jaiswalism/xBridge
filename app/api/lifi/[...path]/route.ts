import { NextRequest, NextResponse } from 'next/server';

// This special handler pattern works specifically with Next.js App Router
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the pathname from the URL directly instead of using params
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract the path segments by removing the /api/lifi part
    const pathSegment = pathname.replace('/api/lifi/', '');
    
    const { searchParams } = url;
    
    // Construct the target URL with all query parameters
    const queryString = Array.from(searchParams.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Use li.quest domain
    const targetUrl = `https://li.quest/v1/${pathSegment}${
      queryString ? '?' + queryString : ''
    }`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Forward the request to Li.Fi API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use no-store for tokens to avoid caching large responses
      cache: pathSegment.startsWith('tokens') ? 'no-store' : 'default',
    });
    
    if (!response.ok) {
      console.error(`Error from Li.Fi API: ${response.status} ${response.statusText}`);
      
      // Try to get more detailed error information
      let errorDetail = "";
      try {
        const errorResponse = await response.json();
        errorDetail = errorResponse.message || JSON.stringify(errorResponse);
      } catch (e) {
        // If we can't parse the error response, just use the status text
      }
      
      return NextResponse.json(
        { 
          error: `Error from Li.Fi API: ${response.status} ${response.statusText}`,
          detail: errorDetail 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the response with appropriate headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch from Li.Fi API',
      detail: error instanceof Error ? error.message : String(error)
    }, {
      status: 500,
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}