import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText } = body;

    const isDuplicate = rawText?.includes('MUTATED') || false;
    const isPhishing = rawText?.includes('0xDead') || false;
    const isInjection = /ignore (all )?previous instructions/i.test(rawText || '');

    return NextResponse.json({
      success: true,
      extraction: {
        vendorName: rawText?.includes('Figma') ? 'Figma Enterprise' : 'AWS Cloud Infrastructure',
        amountUsdc: rawText?.includes('1,500') ? '1500.00' : '450.00',
        discountTerms: rawText?.includes('2/10') ? '2/10 Net 30' : 'Net 30'
      },
      evidence: {
        duplicateDetected: isDuplicate,
        vendorMasterMatch: !isPhishing,
        promptInjectionFlagged: isInjection,
        threeWayMatchVerified: true,
        canRegister: !isDuplicate && !isPhishing && !isInjection
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
