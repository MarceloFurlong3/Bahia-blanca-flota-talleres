import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // IMPORTANTE: Asegúrate de que esta URL en tu .env.local sea la de Google (terminada en /exec)
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    return NextResponse.json({ success: false, error: "Falta GOOGLE_SCRIPT_URL en .env.local" }, { status: 500 });
  }

  try {
    // Reenviamos todos los parámetros (action, ri, estado, etc.) a Google
    const finalUrl = `${googleScriptUrl}?${searchParams.toString()}`;
    
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error en el Proxy de Next.js:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}