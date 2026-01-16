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

// ESTA ES LA PARTE NUEVA: Maneja el envío de la foto (Base64)
export async function POST(request: NextRequest) {
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const { searchParams } = new URL(request.url);

  if (!googleScriptUrl) {
    return NextResponse.json({ success: false, error: "Falta GOOGLE_SCRIPT_URL" }, { status: 500 });
  }

  try {
    // Obtenemos el cuerpo de la petición (donde viene la imagen)
    const body = await request.json();

    // Reenviamos a Google Script incluyendo los parámetros de la URL y el cuerpo
    const finalUrl = `${googleScriptUrl}?${searchParams.toString()}`;
    
    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en Proxy POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}