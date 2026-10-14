import { z } from 'zod';

export const ActionAlternativeSchema = z.object({
  type: z.enum(['PAY_OBLIGATION', 'ALLOCATE', 'REDEEM', 'HOLD', 'ESCALATE']),
  expectedValueUsd: z.number(),
  reason: z.string()
}).strict();

export const ProposedActionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['PAY_OBLIGATION', 'ALLOCATE', 'REDEEM', 'HOLD', 'ESCALATE']),
  businessId: z.string(),
  obligationId: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  venueId: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/), // at most 6 decimal places
  expectedValueUsd: z.number(),
  alternatives: z.array(ActionAlternativeSchema),
  rationale: z.string().min(10),
  confidence: z.number().min(0).max(1),
  evidenceRefs: z.array(z.string()),
  idempotencyKey: z.string().min(5)
}).strict(); // Unknown fields are strictly rejected!

export const ProposeActionsInputSchema = z.object({
  actions: z.array(ProposedActionSchema)
}).strict();
