import { NextResponse } from 'next/server';
import https from 'https';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain') || 'heelo.com';

  const options = {
    method: 'GET',
    hostname: 'scampredictor.p.rapidapi.com',
    path: `/domain/${domain}`,
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY || '76ab21c891msh5b8df987ed5f464p1271f7jsn676e11078f0e',
      'x-rapidapi-host': 'scampredictor.p.rapidapi.com',
    },
  };

  return new Promise<NextResponse>((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk.toString();
      });

      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          
          // Map scam class to trust score
          const getTrustScore = (scamClass: number) => {
            switch (scamClass) {
              case 1: return 100; // Safe
              case 2: return 75;  // Slightly suspicious
              case 3: return 50;  // Moderately suspicious
              case 4: return 0;   // Most dangerous
              default: return 50; // Default to moderate
            }
          };

          // Map scam class to human-readable risk level
          const getRiskLevel = (scamClass: number) => {
            switch (scamClass) {
              case 1: return 'Safe';
              case 2: return 'Minimal Risk';
              case 3: return 'Moderate+ Risk';
              case 4: return 'High Risk';
              default: return 'Unknown Risk';
            }
          };

          const trustScore = getTrustScore(parsedBody.class);
          const riskLevel = getRiskLevel(parsedBody.class);

          resolve(NextResponse.json({
            scamClass: parsedBody.class,
            trustScore,
            riskLevel,
            domain
          }));
        } catch (error) {
          resolve(NextResponse.json({
            error: 'Failed to parse response',
            details: body
          }, { status: 500 }));
        }
      });
    });

    req.on('error', (error) => {
      resolve(NextResponse.json({
        error: 'Request failed',
        details: error.message
      }, { status: 500 }));
    });

    req.end();
  });
}