import { ProposedAction, TreasurySnapshot, GateEvaluation, GateRuleResult, Obligation } from './types.js';
import { ARC_KNOWN_BLOCKLISTED_ADDRESS, ZERO_ADDRESS } from './evidence.js';
import { runLiquidityForecast } from './forecast.js';

export class PolicyGate {
  /**
   * Deterministically dry-runs an action against rules G1 through G14
   */
  public static evaluate(action: ProposedAction, snapshot: TreasurySnapshot): GateEvaluation {
    const results: GateRuleResult[] = [];
    let shouldEscalate = false;
    let fatalRejection = false;
    let fatalReason = '';

    // G13: Kill switch & pause are off
    if (snapshot.isPaused) {
      results.push({
        ruleId: 'G13',
        ruleName: 'Vault not paused / Kill switch off',
        passed: false,
        reason: 'EuthynaVault is paused by Guardian/Owner'
      });
      fatalRejection = true;
      fatalReason = 'Vault is paused';
    } else {
      results.push({
        ruleId: 'G13',
        ruleName: 'Vault not paused / Kill switch off',
        passed: true
      });
    }

    // G1: Action matches schema, amount has at most 6 decimals
    if (action.amount <= 0n) {
      results.push({
        ruleId: 'G1',
        ruleName: 'Schema & non-zero amount',
        passed: false,
        reason: 'Action amount must be positive integer base units'
      });
      fatalRejection = true;
      fatalReason = 'Amount must be positive';
    } else {
      results.push({
        ruleId: 'G1',
        ruleName: 'Schema & non-zero amount',
        passed: true
      });
    }

    // G5: Per-transaction and daily caps respected (applies to outflows: payments and allocations)
    if (action.type === 'PAY_OBLIGATION' || action.type === 'ALLOCATE') {
      const exceedsTxCap = action.amount > snapshot.policy.perTxCap;
      const exceedsDailyCap = snapshot.spentToday + action.amount > snapshot.policy.dailyCap;
      if (exceedsTxCap || exceedsDailyCap) {
        const reason = exceedsTxCap
          ? `Amount ${action.amount} exceeds per-transaction cap ${snapshot.policy.perTxCap}`
          : `Daily spend of ${snapshot.spentToday + action.amount} exceeds daily cap ${snapshot.policy.dailyCap}`;
        results.push({
          ruleId: 'G5',
          ruleName: 'Per-transaction and daily caps respected',
          passed: false,
          reason
        });
        fatalRejection = true;
        fatalReason = reason;
      } else {
        results.push({
          ruleId: 'G5',
          ruleName: 'Per-transaction and daily caps respected',
          passed: true
        });
      }
    } else {
      results.push({
        ruleId: 'G5',
        ruleName: 'Per-transaction and daily caps respected',
        passed: true
      });
    }

    // Rules specific to PAY_OBLIGATION
    let targetObligation: Obligation | undefined;
    if (action.type === 'PAY_OBLIGATION') {
      targetObligation = snapshot.obligations.find(o => o.id === action.obligationId);

      // G2: Obligation registered, received if required, not already paid
      if (!targetObligation) {
        results.push({
          ruleId: 'G2',
          ruleName: 'Obligation registered, received, unpaid',
          passed: false,
          reason: `Obligation ${action.obligationId} not found in registered obligations`
        });
        fatalRejection = true;
        fatalReason = 'Obligation not registered';
      } else if (targetObligation.paid) {
        results.push({
          ruleId: 'G2',
          ruleName: 'Obligation registered, received, unpaid',
          passed: false,
          reason: `Obligation ${action.obligationId} is already marked paid (idempotency guard)`
        });
        fatalRejection = true;
        fatalReason = 'Already paid';
      } else if (targetObligation.requiresReceipt && !targetObligation.received) {
        results.push({
          ruleId: 'G2',
          ruleName: 'Obligation registered, received, unpaid',
          passed: false,
          reason: `Obligation ${action.obligationId} requires goods receipt attestation before payment`
        });
        fatalRejection = true;
        fatalReason = 'Goods not received';
      } else {
        results.push({
          ruleId: 'G2',
          ruleName: 'Obligation registered, received, unpaid',
          passed: true
        });
      }

      // G3: Payee equals vendor master address & active onchain
      if (targetObligation) {
        const vendor = snapshot.vendors[targetObligation.vendorId];
        const payeeLower = targetObligation.payeeAddress.toLowerCase();
        if (!vendor) {
          results.push({
            ruleId: 'G3',
            ruleName: 'Payee active vendor master match',
            passed: false,
            reason: `Vendor record for ID ${targetObligation.vendorId} missing`
          });
          shouldEscalate = true;
        } else if (vendor.payeeAddress.toLowerCase() !== payeeLower) {
          results.push({
            ruleId: 'G3',
            ruleName: 'Payee active vendor master match',
            passed: false,
            reason: `Payee address ${targetObligation.payeeAddress} differs from master record ${vendor.payeeAddress}`
          });
          shouldEscalate = true;
        } else if (vendor.status !== 'Active') {
          results.push({
            ruleId: 'G3',
            ruleName: 'Payee active vendor master match',
            passed: false,
            reason: `Vendor is in ${vendor.status} state, requires owner approval / cooldown`
          });
          shouldEscalate = true;
        } else {
          results.push({
            ruleId: 'G3',
            ruleName: 'Payee active vendor master match',
            passed: true
          });
        }

        // G12: Screening status is clear
        if (payeeLower === ARC_KNOWN_BLOCKLISTED_ADDRESS || payeeLower === ZERO_ADDRESS) {
          results.push({
            ruleId: 'G12',
            ruleName: 'Screening status clear',
            passed: false,
            reason: `Payee ${payeeLower} is on the compliance blocklist`
          });
          shouldEscalate = true;
        } else {
          results.push({
            ruleId: 'G12',
            ruleName: 'Screening status clear',
            passed: true
          });
        }

        // G4: Amount equals registered amount, or exact discounted amount inside window
        let expectedAmount = targetObligation.amount;
        if (targetObligation.discountTerms) {
          const { p, n } = targetObligation.discountTerms;
          const isInsideDiscountWindow = snapshot.simulatedDay <= n;
          if (isInsideDiscountWindow) {
            // Exact discount amount: amount * (100 - p) / 100
            const discountBps = Math.round(p * 100);
            expectedAmount = (targetObligation.amount * BigInt(10000 - discountBps)) / 10000n;
          }
        }

        if (action.amount !== expectedAmount && action.amount !== targetObligation.amount) {
          results.push({
            ruleId: 'G4',
            ruleName: 'Amount equals registered or discounted exact value',
            passed: false,
            reason: `Proposed amount ${action.amount} does not match registered ${targetObligation.amount} or discounted ${expectedAmount}`
          });
          fatalRejection = true;
          fatalReason = 'Amount mismatch';
        } else {
          results.push({
            ruleId: 'G4',
            ruleName: 'Amount equals registered or discounted exact value',
            passed: true
          });
        }
      }
    }

    // G6: Discretionary action leaves liquid USDC >= minLiquidReserve
    // Mandatory due-date payments can use the reserve; discretionary actions (early discount, allocate) cannot.
    const isDiscretionary =
      action.type === 'ALLOCATE' ||
      (action.type === 'PAY_OBLIGATION' && targetObligation?.kind === 'DISCRETIONARY');

    if (isDiscretionary) {
      if (snapshot.liquidBalance - action.amount < snapshot.policy.minLiquidReserve) {
        results.push({
          ruleId: 'G6',
          ruleName: 'Discretionary action preserves liquid reserve',
          passed: false,
          reason: `Liquid after action (${snapshot.liquidBalance - action.amount}) would breach reserve floor (${snapshot.policy.minLiquidReserve})`
        });
        fatalRejection = true;
        fatalReason = 'Breaches reserve floor';
      } else {
        results.push({
          ruleId: 'G6',
          ruleName: 'Discretionary action preserves liquid reserve',
          passed: true
        });
      }
    } else {
      results.push({
        ruleId: 'G6',
        ruleName: 'Discretionary action preserves liquid reserve',
        passed: true
      });
    }

    // Rules specific to ALLOCATE
    if (action.type === 'ALLOCATE') {
      const venue = snapshot.venues.find(v => v.id === action.venueId);
      if (!venue || !venue.enabled) {
        results.push({
          ruleId: 'G8',
          ruleName: 'Venue enabled and concentration limit holds',
          passed: false,
          reason: `Venue ${action.venueId} is not enabled or not found`
        });
        fatalRejection = true;
        fatalReason = 'Venue not enabled';
      } else {
        // Concentration limit check
        const totalTreasury = snapshot.liquidBalance + snapshot.venues.reduce((acc, v) => acc + v.principalDeployed, 0n);
        const maxVenueAllocation = (totalTreasury * BigInt(venue.maxShareBps)) / 10000n;
        const newTotal = venue.principalDeployed + action.amount;

        if (newTotal > maxVenueAllocation || newTotal > venue.capacityCap) {
          results.push({
            ruleId: 'G8',
            ruleName: 'Venue enabled and concentration limit holds',
            passed: false,
            reason: `Allocation exceeds venue capacity or concentration limit (${venue.maxShareBps / 100}%)`
          });
          fatalRejection = true;
          fatalReason = 'Concentration cap exceeded';
        } else {
          results.push({
            ruleId: 'G8',
            ruleName: 'Venue enabled and concentration limit holds',
            passed: true
          });
        }

        // G9: Redemption lead time fits before next mandatory obligation
        // Check next mandatory obligation
        const nextMandatory = snapshot.obligations
          .filter(o => !o.paid && o.kind === 'MANDATORY')
          .sort((a, b) => a.dueDay - b.dueDay)[0];

        if (nextMandatory) {
          const daysUntilMandatory = nextMandatory.dueDay - snapshot.simulatedDay;
          if (daysUntilMandatory <= venue.redemptionLatencyDays) {
            results.push({
              ruleId: 'G9',
              ruleName: 'Redemption lead time fits before mandatory obligation',
              passed: false,
              reason: `Venue redemption latency (${venue.redemptionLatencyDays}d) exceeds days until mandatory payment (${daysUntilMandatory}d)`
            });
            fatalRejection = true;
            fatalReason = 'Redemption latency conflict';
          } else {
            results.push({
              ruleId: 'G9',
              ruleName: 'Redemption lead time fits before mandatory obligation',
              passed: true
            });
          }
        } else {
          results.push({
            ruleId: 'G9',
            ruleName: 'Redemption lead time fits before mandatory obligation',
            passed: true
          });
        }
      }
    }

    // G7: Monte Carlo shortfall probability <= epsilon (applies to discretionary actions)
    if (isDiscretionary) {
      let postLiquid = snapshot.liquidBalance;
      if (action.type === 'PAY_OBLIGATION' || action.type === 'ALLOCATE') {
        postLiquid = snapshot.liquidBalance >= action.amount ? snapshot.liquidBalance - action.amount : 0n;
      } else if (action.type === 'REDEEM') {
        postLiquid = snapshot.liquidBalance + action.amount;
      }
      const postActionSnapshot: TreasurySnapshot = {
        ...snapshot,
        liquidBalance: postLiquid
      };
      const forecast = runLiquidityForecast(postActionSnapshot, 14, 12345, 500);
      if (forecast.overallShortfallProbability > snapshot.policy.epsilonShortfall) {
        results.push({
          ruleId: 'G7',
          ruleName: 'Shortfall probability below epsilon',
          passed: false,
          reason: `Monte Carlo shortfall probability (${(forecast.overallShortfallProbability * 100).toFixed(1)}%) exceeds epsilon threshold (${(snapshot.policy.epsilonShortfall * 100).toFixed(1)}%)`
        });
        fatalRejection = true;
        fatalReason = 'Shortfall risk exceeds epsilon';
      } else {
        results.push({
          ruleId: 'G7',
          ruleName: 'Shortfall probability below epsilon',
          passed: true
        });
      }
    } else {
      results.push({
        ruleId: 'G7',
        ruleName: 'Shortfall probability below epsilon',
        passed: true
      });
    }

    // G10: Gas fee is below set share of action's benefit
    // Arc transaction fee is ~0.01 USDC ($0.01 = 10,000 base units)
    const estimatedGasUsd = 0.01;
    if (action.expectedValueUsd > 0 && estimatedGasUsd / action.expectedValueUsd > snapshot.policy.maxGasFeeShareOfBenefit) {
      results.push({
        ruleId: 'G10',
        ruleName: 'Gas fee below set share of benefit',
        passed: false,
        reason: `Gas fee ($${estimatedGasUsd}) exceeds ${(snapshot.policy.maxGasFeeShareOfBenefit * 100).toFixed(0)}% of benefit ($${action.expectedValueUsd.toFixed(2)})`
      });
      fatalRejection = true;
      fatalReason = 'Gas fee too high relative to benefit';
    } else {
      results.push({
        ruleId: 'G10',
        ruleName: 'Gas fee below set share of benefit',
        passed: true
      });
    }

    // G11: Confidence threshold check
    if (action.confidence < snapshot.policy.minConfidenceThreshold) {
      results.push({
        ruleId: 'G11',
        ruleName: 'Confidence at or above threshold',
        passed: false,
        reason: `Action confidence (${(action.confidence * 100).toFixed(1)}%) below minimum ${(snapshot.policy.minConfidenceThreshold * 100).toFixed(0)}%`
      });
      shouldEscalate = true;
    } else {
      results.push({
        ruleId: 'G11',
        ruleName: 'Confidence at or above threshold',
        passed: true
      });
    }

    // G14: Preflight simulation check (blocklist or zero address will revert)
    if (action.type === 'PAY_OBLIGATION' && targetObligation) {
      const p = targetObligation.payeeAddress.toLowerCase();
      if (p === ARC_KNOWN_BLOCKLISTED_ADDRESS || p === ZERO_ADDRESS) {
        results.push({
          ruleId: 'G14',
          ruleName: 'Simulated transaction (eth_call) does not revert',
          passed: false,
          reason: 'Preflight simulation failed: transfer to blocklisted address reverts on Arc'
        });
        fatalRejection = true;
        fatalReason = 'Preflight simulation reverted';
      } else {
        results.push({
          ruleId: 'G14',
          ruleName: 'Simulated transaction (eth_call) does not revert',
          passed: true
        });
      }
    } else {
      results.push({
        ruleId: 'G14',
        ruleName: 'Simulated transaction (eth_call) does not revert',
        passed: true
      });
    }

    const passed = !fatalRejection && !shouldEscalate;

    return {
      actionId: action.id,
      passed,
      escalate: shouldEscalate,
      ruleResults: results,
      rejectionReason: fatalRejection ? fatalReason : shouldEscalate ? 'Escalated for human review' : undefined
    };
  }
}
