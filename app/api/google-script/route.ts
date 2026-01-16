import { NextRequest, NextResponse } from 'next/server';

// Esta función maneja la lectura de datos y actualizaciones simples
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    return NextResponse.json({ success: false, error: "Falta GOOGLE_SCRIPT_URL" }, { status: 500 });
  }

  try {
    const finalUrl = `${googleScriptUrl}?${searchParams.toString()}`;
    const response = await fetch(finalUrl, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const { searchParams } = new URL(request.url);

  if (!googleScriptUrl) {
    return NextResponse.json({ success: false, error: "Falta GOOGLE_SCRIPT_URL" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const action = searchParams.get('action');
    const filename = searchParams.get('filename');

    // Construimos la petición a Google de forma que la entienda siempre
    const finalUrl = `${googleScriptUrl}?action=${action}&filename=${encodeURIComponent(filename || '')}`;
    
    const response = await fetch(finalUrl, {
      method: 'POST',
      // Enviamos el base64 directamente en el cuerpo
      body: JSON.stringify({
        base64: body.base64,
        filename: filename,
        action: action
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}