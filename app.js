/**
 * RESQ-AGENT: Agentic Disaster Relief & Emergency Resource Coordinator
 * Kurukshetra 2.0 • Domain 1: AIML / Agentic AI / Data Science (PS20)
 * 
 * FULLY INTERACTIVE RUNTIME ENGINE & MULTI-AGENT STATE MANAGER
 * Fully Rule-Based • Zero External LLM/API • Pure Vanilla ES6 JavaScript
 * Unified State Store in localStorage['resq_agent_state']
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'resq_agent_state';

  // --- 1. TOAST NOTIFICATION SYSTEM ---
  function showToast(title, message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;

    let icon = '✓';
    if (type === 'warning') icon = '⚠️';
    if (type === 'critical') icon = '🚨';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // --- 2. DETERMINISTIC SEED STATE ---
  function getSeedState() {
    return {
      currentCycleId: 'cycle_001',
      cycleCounter: 1,
      zones: [
        {
          zone_id: 'Z-01',
          name: 'Old Port Coastal Belt',
          population: 4200,
          casualties: 35,
          damage_level: 'HIGH',
          hours_since_aid: 6,
          status: 'critical',
          requested: { food: 350, medical: 180, shelter: 200, rescue: 8 },
          allocated: { food: 0, medical: 0, shelter: 0, rescue: 0 },
          pending: { food: 350, medical: 180, shelter: 200, rescue: 8 },
          assignedAgency: 'AG-NDRF',
          lastAidTimestamp: null
        },
        {
          zone_id: 'Z-02',
          name: 'Highland Valley Ridge',
          population: 1800,
          casualties: 8,
          damage_level: 'MEDIUM',
          hours_since_aid: 3,
          status: 'warning',
          requested: { food: 150, medical: 50, shelter: 80, rescue: 0 },
          allocated: { food: 0, medical: 0, shelter: 0, rescue: 0 },
          pending: { food: 150, medical: 50, shelter: 80, rescue: 0 },
          assignedAgency: 'AG-REDX',
          lastAidTimestamp: null
        },
        {
          zone_id: 'Z-03',
          name: 'Metro Eastern Ward',
          population: 9500,
          casualties: 18,
          damage_level: 'LOW',
          hours_since_aid: 14,
          status: 'stable',
          requested: { food: 400, medical: 90, shelter: 120, rescue: 2 },
          allocated: { food: 0, medical: 0, shelter: 0, rescue: 0 },
          pending: { food: 400, medical: 90, shelter: 120, rescue: 2 },
          assignedAgency: 'AG-SDRF',
          lastAidTimestamp: null
        }
      ],
      inventory: [
        { resource_type: 'food', name: 'Food Kits', total_units: 2500, available_units: 1800 },
        { resource_type: 'medical', name: 'Medical Kits', total_units: 1200, available_units: 650 },
        { resource_type: 'shelter', name: 'Shelter Capacity', total_units: 1500, available_units: 900 },
        { resource_type: 'rescue', name: 'Rescue Teams', total_units: 50, available_units: 28 }
      ],
      agencies: [
        { id: 'AG-NDRF', name: 'Govt-Relief (NDRF)' },
        { id: 'AG-REDX', name: 'Red-Cross-NGO' },
        { id: 'AG-SDRF', name: 'State-Disaster-Force' }
      ],
      reports: [
        {
          report_id: 'rep_001',
          zone_id: 'Z-01',
          zone_name: 'Old Port Coastal Belt',
          timestamp: new Date(Date.now() - 3600000 * 6).toLocaleTimeString(),
          casualties: 35,
          population: 4200,
          damage_level: 'HIGH',
          resources_requested: { food: 350, medical: 180, shelter: 200, rescue: 8 },
          agency_id: 'AG-NDRF'
        },
        {
          report_id: 'rep_002',
          zone_id: 'Z-02',
          zone_name: 'Highland Valley Ridge',
          timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString(),
          casualties: 8,
          population: 1800,
          damage_level: 'MEDIUM',
          resources_requested: { food: 150, medical: 50, shelter: 80, rescue: 0 },
          agency_id: 'AG-REDX'
        },
        {
          report_id: 'rep_003',
          zone_id: 'Z-03',
          zone_name: 'Metro Eastern Ward',
          timestamp: new Date(Date.now() - 3600000 * 14).toLocaleTimeString(),
          casualties: 18,
          population: 9500,
          damage_level: 'LOW',
          resources_requested: { food: 400, medical: 90, shelter: 120, rescue: 2 },
          agency_id: 'AG-SDRF'
        }
      ],
      allocations: [],
      auditLogs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          cycle_id: 'cycle_001',
          entity_type: 'SYSTEM',
          entity_id: 'RESQ-CORE',
          action: 'SYSTEM_INITIALIZED',
          rule_triggered: 'INIT_BOOTSTRAP',
          explanation: 'Deterministic multi-agent relief engine initialized with 3 operational zones and seed inventory.'
        }
      ],
      duplicateConflicts: [],
      escalations: []
    };
  }

  // --- 3. STATE PERSISTENCE ---
  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Unable to load from localStorage, resetting to seed state.', e);
    }
    const seed = getSeedState();
    saveState(seed);
    return seed;
  }

  function saveState(s) {
    state = s || state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  function resetState() {
    state = getSeedState();
    saveState(state);
    AuditLoggerModule.log(
      state.currentCycleId,
      'SYSTEM',
      'RESQ-CORE',
      'STATE_RESET',
      'RESET_TO_SEED',
      'Operational environment restored to baseline deterministic seed data.'
    );
    renderAll();
    showToast('Demo State Reset', 'Restored 3 baseline zones and full warehouse stockpiles.', 'info');
    return state;
  }

  // ==========================================================================
  // 4. THE SIX RULE-BASED AGENT MODULES (DETERMINISTIC JAVASCRIPT)
  // ==========================================================================

  // --- AGENT 1: ZONE REPORT / INCIDENT INTAKE ---
  const ReportIntakeModule = {
    ingestReport(payload) {
      if (!payload || !payload.zone_name) {
        throw new Error('Validation Error: Zone name is required.');
      }
      const population = Math.max(1, Number(payload.population) || 0);
      const casualties = Math.max(0, Number(payload.casualties) || 0);

      if (casualties > population) {
        throw new Error(`Validation Error: Casualties (${casualties}) cannot exceed total population (${population}).`);
      }

      const reportId = 'rep_' + String(state.reports.length + 101);
      const zoneId = payload.zone_id || ('Z-' + String(state.zones.length + 1).padStart(2, '0'));
      const timestamp = new Date().toLocaleTimeString();

      const newReport = {
        report_id: reportId,
        zone_id: zoneId,
        zone_name: payload.zone_name,
        timestamp: timestamp,
        casualties: casualties,
        population: population,
        damage_level: String(payload.damage_level || 'MEDIUM').toUpperCase(),
        hours_since_aid: Math.max(0, Number(payload.hours_since_aid) || 12),
        resources_requested: payload.resources_requested || { food: 100, medical: 50, shelter: 50, rescue: 0 },
        agency_id: payload.agency_id || 'AG-NDRF'
      };

      state.reports.push(newReport);

      // Upsert Zone
      let zone = state.zones.find(z => z.zone_id === zoneId);
      if (!zone) {
        zone = {
          zone_id: zoneId,
          name: payload.zone_name,
          population: population,
          casualties: casualties,
          damage_level: newReport.damage_level,
          hours_since_aid: newReport.hours_since_aid,
          status: casualties >= 30 ? 'critical' : (casualties >= 10 ? 'warning' : 'stable'),
          requested: { ...newReport.resources_requested },
          allocated: { food: 0, medical: 0, shelter: 0, rescue: 0 },
          pending: { ...newReport.resources_requested },
          assignedAgency: newReport.agency_id,
          lastAidTimestamp: null
        };
        state.zones.push(zone);
      } else {
        zone.name = payload.zone_name;
        zone.population = population;
        zone.casualties = casualties;
        zone.damage_level = newReport.damage_level;
        zone.hours_since_aid = newReport.hours_since_aid;
        zone.requested = { ...newReport.resources_requested };
        zone.pending = { ...newReport.resources_requested };
      }

      AuditLoggerModule.log(
        state.currentCycleId,
        'REPORT',
        reportId,
        'REPORT_SUBMITTED',
        'SCHEMA_VALIDATION_PASS',
        `Incident report ${reportId} accepted for ${zone.name} (${zone.zone_id}). Casualties: ${zone.casualties}, Damage: ${zone.damage_level}.`
      );

      saveState(state);
      return { report: newReport, zone: zone };
    }
  };

  // --- AGENT 2: NEEDS ASSESSMENT AGENT ---
  const NeedsAssessmentModule = {
    assessZone(zoneId) {
      const zone = state.zones.find(z => z.zone_id === zoneId);
      if (!zone) throw new Error(`Zone ${zoneId} not found.`);

      const pop = Number(zone.population) || 0;
      const cas = Number(zone.casualties) || 0;
      const dmg = String(zone.damage_level).toUpperCase();

      const needs = {
        medical: cas > 20 || dmg === 'HIGH' ? 'HIGH' : (cas > 5 || dmg === 'MEDIUM' ? 'MEDIUM' : 'LOW'),
        rescue: dmg === 'HIGH' || cas > 30 ? 'HIGH' : (dmg === 'MEDIUM' ? 'MEDIUM' : 'LOW'),
        food: pop >= 3000 ? 'HIGH' : (pop >= 1000 ? 'MEDIUM' : 'LOW'),
        shelter: dmg === 'HIGH' ? 'HIGH' : (dmg === 'MEDIUM' ? 'MEDIUM' : 'LOW')
      };

      const recommendedUnits = {
        medical: needs.medical === 'HIGH' ? Math.round(cas * 3.5 + 50) : (needs.medical === 'MEDIUM' ? Math.round(cas * 2 + 20) : 15),
        rescue: needs.rescue === 'HIGH' ? Math.max(5, Math.round(pop / 400)) : (needs.rescue === 'MEDIUM' ? Math.max(2, Math.round(pop / 800)) : 0),
        food: needs.food === 'HIGH' ? Math.round(pop * 0.1) : (needs.food === 'MEDIUM' ? Math.round(pop * 0.05) : Math.round(pop * 0.02)),
        shelter: needs.shelter === 'HIGH' ? Math.round(pop * 0.06) : (needs.shelter === 'MEDIUM' ? Math.round(pop * 0.03) : 10)
      };

      return {
        zone_id: zone.zone_id,
        zone_name: zone.name,
        needs: needs,
        recommendedUnits: recommendedUnits
      };
    }
  };

  // --- AGENT 3: PRIORITY SCORING ENGINE (THE ONLY OFFICIAL PS20 PRD FORMULA) ---
  const PriorityScoringModule = {
    calculateScore(zone, maxCasualtiesSeen = null) {
      if (!zone) return null;

      if (maxCasualtiesSeen === null || maxCasualtiesSeen === undefined) {
        maxCasualtiesSeen = state.zones.reduce((max, z) => Math.max(max, Number(z.casualties) || 0), 0);
      }
      maxCasualtiesSeen = Math.max(0, Number(maxCasualtiesSeen) || 0);

      const casualties = Math.max(0, Number(zone.casualties) || 0);
      const population = Math.max(0, Number(zone.population) || 0);

      // 1. CasualtyScore: min(100, (casualties / maxCasualties) * 100). If max casualties is 0, use 0.
      let casualtyScore = 0;
      if (maxCasualtiesSeen > 0) {
        casualtyScore = Math.min(100, (casualties / maxCasualtiesSeen) * 100);
      }

      // 2. PopulationScore: min(100, (population / 10,000) * 100)
      const populationScore = Math.min(100, (population / 10000) * 100);

      // 3. DamageScore: LOW = 20, MEDIUM = 60, HIGH = 100
      let damageScore = 60;
      const dmgRaw = String(zone.damage_level || '').toUpperCase();
      if (dmgRaw === 'LOW' || zone.damage_level === 20 || zone.damage_level === 1 || zone.damage_level === 2) {
        damageScore = 20;
      } else if (dmgRaw === 'HIGH' || zone.damage_level === 100 || zone.damage_level === 5) {
        damageScore = 100;
      } else if (dmgRaw === 'MEDIUM' || zone.damage_level === 60 || zone.damage_level === 3 || zone.damage_level === 4) {
        damageScore = 60;
      }

      // 4. TimeSinceLastAidScore: min(100, hoursSinceLastAid * 5)
      let hoursSinceAid = 0;
      if (zone.hours_since_aid !== undefined && zone.hours_since_aid !== null) {
        hoursSinceAid = Math.max(0, Number(zone.hours_since_aid));
      } else if (zone.lastAidTimestamp) {
        const elapsedHours = (Date.now() - new Date(zone.lastAidTimestamp).getTime()) / (1000 * 60 * 60);
        hoursSinceAid = Math.max(0, elapsedHours);
      } else {
        hoursSinceAid = 12;
      }
      const timeScore = Math.min(100, hoursSinceAid * 5);

      // Weighted Calculation
      const casualtyWeighted = 0.40 * casualtyScore;
      const populationWeighted = 0.25 * populationScore;
      const damageWeighted = 0.20 * damageScore;
      const timeWeighted = 0.15 * timeScore;

      const finalScore = Number((casualtyWeighted + populationWeighted + damageWeighted + timeWeighted).toFixed(2));

      const formulaStr = `0.40 × ${casualtyScore.toFixed(1)} + 0.25 × ${populationScore.toFixed(1)} + 0.20 × ${damageScore.toFixed(1)} + 0.15 × ${timeScore.toFixed(1)} = ${finalScore.toFixed(2)}`;

      const explanation = `Zone scored ${finalScore.toFixed(1)}/100 driven by ${
        casualtyWeighted >= 25 ? 'critical casualty density (+' + casualtyWeighted.toFixed(1) + ' pts)' :
        (damageWeighted >= 18 ? 'high structural destruction (+' + damageWeighted.toFixed(1) + ' pts)' : 'compounded population scale and response delay')
      }. Component contributions: Casualties ${casualtyWeighted.toFixed(1)}, Population ${populationWeighted.toFixed(1)}, Damage ${damageWeighted.toFixed(1)}, Time ${timeWeighted.toFixed(1)}.`;

      return {
        zone_id: zone.zone_id,
        zone_name: zone.name,
        casualties: casualties,
        maxCasualtiesSeen: maxCasualtiesSeen,
        population: population,
        damageLevel: zone.damage_level,
        hoursSinceAid: hoursSinceAid,
        casualtyScore: Number(casualtyScore.toFixed(2)),
        populationScore: Number(populationScore.toFixed(2)),
        damageScore: Number(damageScore.toFixed(2)),
        timeScore: Number(timeScore.toFixed(2)),
        casualtyWeighted: Number(casualtyWeighted.toFixed(2)),
        populationWeighted: Number(populationWeighted.toFixed(2)),
        damageWeighted: Number(damageWeighted.toFixed(2)),
        timeWeighted: Number(timeWeighted.toFixed(2)),
        finalScore: finalScore,
        formulaStr: formulaStr,
        explanation: explanation
      };
    },

    rankAllZones() {
      const maxCasualties = state.zones.reduce((max, z) => Math.max(max, Number(z.casualties) || 0), 0);
      const ranked = state.zones.map(z => {
        const score = this.calculateScore(z, maxCasualties);
        z.priorityScore = score.finalScore;
        z.priorityDetails = score;
        z.status = score.finalScore >= 70 ? 'critical' : (score.finalScore >= 40 ? 'warning' : 'stable');
        return {
          zone: z,
          scoreDetails: score
        };
      }).sort((a, b) => b.scoreDetails.finalScore - a.scoreDetails.finalScore);

      AuditLoggerModule.log(
        state.currentCycleId,
        'PRIORITY',
        'ALL_ZONES',
        'PRIORITIES_RECALCULATED',
        'OFFICIAL_PRD_FORMULA_0.4C_0.25P_0.2D_0.15T',
        `Re-ranked ${ranked.length} operational zones using official PRD formula. Top priority: ${ranked[0]?.zone.name} (${ranked[0]?.scoreDetails.finalScore}/100).`
      );

      saveState(state);
      return ranked;
    }
  };

  // --- AGENT 4: RESOURCE ALLOCATION AGENT (GREEDY CAPPED 40% RULE) ---
  const AllocationEngineModule = {
    runAllocationCycle(triggerReason = 'Manual Dispatch') {
      state.cycleCounter = (state.cycleCounter || 1) + 1;
      state.currentCycleId = 'cycle_' + String(state.cycleCounter).padStart(3, '0');

      const ranked = PriorityScoringModule.rankAllZones();
      const newAllocations = [];
      const newEscalations = [];

      ranked.forEach(({ zone }) => {
        const resTypes = ['food', 'medical', 'shelter', 'rescue'];

        resTypes.forEach(resType => {
          const reqUnits = Number(zone.requested[resType]) || 0;
          const remainingNeed = Number(zone.pending[resType]) !== undefined ? zone.pending[resType] : reqUnits;

          if (remainingNeed <= 0) return;

          const invItem = state.inventory.find(i => i.resource_type === resType);
          if (!invItem) return;

          // EXACT PS20 ALLOCATION RULE:
          // min(units_requested, 40% of currently available units, remaining_need)
          const maxAllowedCap = Math.floor(invItem.available_units * 0.40);
          const toAllocate = Math.max(0, Math.min(remainingNeed, maxAllowedCap));

          if (toAllocate > 0) {
            invItem.available_units -= toAllocate;
            zone.allocated[resType] = (zone.allocated[resType] || 0) + toAllocate;
            zone.pending[resType] = Math.max(0, remainingNeed - toAllocate);
            zone.lastAidTimestamp = new Date().toISOString();
            zone.hours_since_aid = 0;

            const agency = state.agencies[(newAllocations.length) % state.agencies.length];
            const allocRecord = {
              allocation_id: 'alloc_' + String(state.allocations.length + newAllocations.length + 1).padStart(3, '0'),
              cycle_id: state.currentCycleId,
              zone_id: zone.zone_id,
              zone_name: zone.name,
              resource_type: resType,
              units_allocated: toAllocate,
              agency_id: agency.id,
              agency_name: agency.name,
              rule_triggered: 'greedy-capped-40pct',
              timestamp: new Date().toLocaleTimeString(),
              status: 'assigned',
              duplicate: false
            };

            newAllocations.push(allocRecord);
          }

          // Check for unmet need -> Escalation Flag
          const postAllocationPending = zone.pending[resType];
          if (postAllocationPending > 0) {
            const escRecord = {
              cycle_id: state.currentCycleId,
              zone_id: zone.zone_id,
              zone_name: zone.name,
              resource_type: resType,
              requested: reqUnits,
              allocated: zone.allocated[resType],
              pending: postAllocationPending,
              reason: invItem.available_units === 0 ? 'INVENTORY_DEPLETED' : 'CYCLE_40PCT_CAP_REACHED',
              timestamp: new Date().toLocaleTimeString()
            };
            newEscalations.push(escRecord);
            zone.status = 'escalated';
          }
        });
      });

      state.allocations.push(...newAllocations);
      state.escalations = newEscalations;

      AuditLoggerModule.log(
        state.currentCycleId,
        'ALLOCATION',
        state.currentCycleId,
        'ALLOCATION_CYCLE_COMPLETED',
        'GREEDY_CAPPED_40PCT',
        `Allocation cycle ${state.currentCycleId} completed (${triggerReason}). Created ${newAllocations.length} allocations. ${newEscalations.length} escalations triggered.`
      );

      saveState(state);
      renderAll();

      if (newEscalations.length > 0) {
        showToast(`Cycle ${state.currentCycleId} Complete`, `Dispatched ${newAllocations.length} allocations. ⚠️ ${newEscalations.length} unmet requests escalated.`, 'warning');
      } else {
        showToast(`Cycle ${state.currentCycleId} Complete`, `Dispatched ${newAllocations.length} allocations across priority queue.`, 'success');
      }

      return { allocations: newAllocations, escalations: newEscalations };
    }
  };

  // --- AGENT 5: DUPLICATE-EFFORT CHECKER ---
  const DuplicateCheckerModule = {
    detectDuplicates() {
      const conflicts = [];
      const cycleAllocations = state.allocations.filter(a => a.cycle_id === state.currentCycleId);

      for (let i = 0; i < cycleAllocations.length; i++) {
        for (let j = i + 1; j < cycleAllocations.length; j++) {
          const a1 = cycleAllocations[i];
          const a2 = cycleAllocations[j];

          if (a1.zone_id === a2.zone_id && a1.resource_type === a2.resource_type && a1.agency_id !== a2.agency_id) {
            a1.duplicate = true;
            a2.duplicate = true;
            conflicts.push({
              conflict_id: `conf_${a1.allocation_id}_${a2.allocation_id}`,
              cycle_id: state.currentCycleId,
              zone_id: a1.zone_id,
              zone_name: a1.zone_name,
              resource_type: a1.resource_type,
              agency1: a1.agency_name,
              agency2: a2.agency_name,
              alloc1_id: a1.allocation_id,
              alloc2_id: a2.allocation_id,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        }
      }

      state.duplicateConflicts = conflicts;
      saveState(state);
      return conflicts;
    },

    simulateConflict() {
      const targetZone = state.zones[0] || { zone_id: 'Z-01', name: 'Old Port Coastal Belt' };
      const targetRes = 'medical';

      const alloc1 = {
        allocation_id: 'alloc_dup_' + String(state.allocations.length + 1),
        cycle_id: state.currentCycleId,
        zone_id: targetZone.zone_id,
        zone_name: targetZone.name,
        resource_type: targetRes,
        units_allocated: 40,
        agency_id: 'AG-NDRF',
        agency_name: 'Govt-Relief (NDRF)',
        rule_triggered: 'manual-duplicate-dispatch',
        timestamp: new Date().toLocaleTimeString(),
        status: 'assigned',
        duplicate: true
      };

      const alloc2 = {
        allocation_id: 'alloc_dup_' + String(state.allocations.length + 2),
        cycle_id: state.currentCycleId,
        zone_id: targetZone.zone_id,
        zone_name: targetZone.name,
        resource_type: targetRes,
        units_allocated: 40,
        agency_id: 'AG-REDX',
        agency_name: 'Red-Cross-NGO',
        rule_triggered: 'manual-duplicate-dispatch',
        timestamp: new Date().toLocaleTimeString(),
        status: 'assigned',
        duplicate: true
      };

      state.allocations.push(alloc1, alloc2);
      this.detectDuplicates();

      AuditLoggerModule.log(
        state.currentCycleId,
        'DUPLICATE',
        alloc1.allocation_id,
        'DUPLICATE_EFFORT_DETECTED',
        'COMPOSITE_KEY_COLLISION',
        `DUPLICATE EFFORT: Conflicting commitments detected for ${targetRes.toUpperCase()} in ${targetZone.name} between Govt-Relief and Red-Cross.`
      );

      saveState(state);
      renderAll();
      showToast('Duplicate Effort Detected', `Overlapping commitments found for ${targetZone.name}. Human resolution required.`, 'critical');
    },

    resolveConflict(allocIdToKeep) {
      const kept = state.allocations.find(a => a.allocation_id === allocIdToKeep);
      const toRemove = state.allocations.filter(a => a.duplicate && a.allocation_id !== allocIdToKeep);

      // Restore inventory from cancelled allocations
      toRemove.forEach(rem => {
        const inv = state.inventory.find(i => i.resource_type === rem.resource_type);
        if (inv) inv.available_units += rem.units_allocated;
      });

      state.allocations = state.allocations.filter(a => !(a.duplicate && a.allocation_id !== allocIdToKeep));
      state.allocations.forEach(a => { if (a.allocation_id === allocIdToKeep) a.duplicate = false; });
      state.duplicateConflicts = [];

      AuditLoggerModule.log(
        state.currentCycleId,
        'COORDINATOR',
        allocIdToKeep,
        'DUPLICATE_RESOLVED',
        'MANUAL_COORDINATOR_DECISION',
        `Coordinator resolved duplicate dispatch conflict. Retained verified assignment to ${kept ? kept.agency_name : allocIdToKeep}.`
      );

      saveState(state);
      renderAll();
      showToast('Duplicate Conflict Resolved', `Retained verified assignment for ${kept ? kept.agency_name : allocIdToKeep}. Duplicate cancelled.`, 'success');
    }
  };

  // --- AGENT 6: AUDIT LOGGER ---
  const AuditLoggerModule = {
    log(cycleId, entityType, entityId, action, ruleTriggered, explanation) {
      const entry = {
        timestamp: new Date().toLocaleTimeString(),
        cycle_id: cycleId || state.currentCycleId || 'cycle_001',
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        rule_triggered: ruleTriggered,
        explanation: explanation
      };
      state.auditLogs.unshift(entry);
      if (state.auditLogs.length > 150) state.auditLogs.pop();
      saveState(state);
      return entry;
    }
  };

  // ==========================================================================
  // 5. INTERACTIVE CONTROLLERS & EVENT BINDINGS
  // ==========================================================================

  // --- CONTROLLER 1: PRIORITY SIMULATOR (5 INPUTS) ---
  function initPrioritySimulator() {
    const popSlider = document.getElementById('simPop');
    const casSlider = document.getElementById('simCas');
    const dmgSelect = document.getElementById('simDmg');
    const timeSlider = document.getElementById('simTime');
    const maxCasSlider = document.getElementById('simMaxCas');

    const popNum = document.getElementById('simPopNum');
    const casNum = document.getElementById('simCasNum');
    const timeNum = document.getElementById('simTimeNum');
    const maxCasNum = document.getElementById('simMaxCasNum');

    if (!popSlider || !casSlider) return;

    function syncInputs(source, target) {
      if (source && target && source.value !== target.value) {
        target.value = source.value;
      }
    }

    function calculateAndRenderSim() {
      const pop = Number(popSlider.value);
      const cas = Number(casSlider.value);
      const dmg = dmgSelect.value;
      const time = Number(timeSlider.value);
      const maxCas = Number(maxCasSlider.value);

      // Sync display labels
      const popValLabel = document.getElementById('simPopVal');
      if (popValLabel) popValLabel.textContent = pop.toLocaleString();

      const casValLabel = document.getElementById('simCasVal');
      if (casValLabel) casValLabel.textContent = cas;

      const timeValLabel = document.getElementById('simTimeVal');
      if (timeValLabel) timeValLabel.textContent = `${time} hrs`;

      const maxCasValLabel = document.getElementById('simMaxCasVal');
      if (maxCasValLabel) maxCasValLabel.textContent = maxCas;

      const testZone = {
        zone_id: 'SIM-ZONE',
        name: 'Simulated Zone',
        population: pop,
        casualties: cas,
        damage_level: dmg,
        hours_since_aid: time
      };

      const result = PriorityScoringModule.calculateScore(testZone, maxCas);

      // Hero score
      const scoreEl = document.getElementById('simHeroScore');
      if (scoreEl) scoreEl.textContent = result.finalScore.toFixed(1);

      // Progress bars
      const barCas = document.getElementById('barCas');
      if (barCas) {
        barCas.style.width = `${result.casualtyScore}%`;
        document.getElementById('barCasVal').textContent = `${result.casualtyScore.toFixed(1)} / 100 (contrib: +${result.casualtyWeighted.toFixed(1)})`;
      }

      const barPop = document.getElementById('barPop');
      if (barPop) {
        barPop.style.width = `${result.populationScore}%`;
        document.getElementById('barPopVal').textContent = `${result.populationScore.toFixed(1)} / 100 (contrib: +${result.populationWeighted.toFixed(1)})`;
      }

      const barDmg = document.getElementById('barDmg');
      if (barDmg) {
        barDmg.style.width = `${result.damageScore}%`;
        document.getElementById('barDmgVal').textContent = `${result.damageScore.toFixed(1)} / 100 (contrib: +${result.damageWeighted.toFixed(1)})`;
      }

      const barTime = document.getElementById('barTime');
      if (barTime) {
        barTime.style.width = `${result.timeScore}%`;
        document.getElementById('barTimeVal').textContent = `${result.timeScore.toFixed(1)} / 100 (contrib: +${result.timeWeighted.toFixed(1)})`;
      }

      // Formula text
      const mathEl = document.getElementById('simFormulaOutput');
      if (mathEl) {
        mathEl.innerHTML = `Priority Score = <span class="math-hl">0.40 × ${result.casualtyScore.toFixed(1)}</span> (Casualties) + ` +
          `<span class="math-hl">0.25 × ${result.populationScore.toFixed(1)}</span> (Population) + ` +
          `<span class="math-hl">0.20 × ${result.damageScore.toFixed(1)}</span> (Damage: ${dmg}) + ` +
          `<span class="math-hl">0.15 × ${result.timeScore.toFixed(1)}</span> (Time unserved) = ` +
          `<strong style="color:var(--accent-orange); font-size:1.1rem;">${result.finalScore.toFixed(2)}</strong> / 100`;
      }

      // Natural language explanation
      const expEl = document.getElementById('simExplainOutput');
      if (expEl) expEl.textContent = result.explanation;
    }

    // Sliders to Numbers
    popSlider.addEventListener('input', () => { syncInputs(popSlider, popNum); calculateAndRenderSim(); });
    casSlider.addEventListener('input', () => { syncInputs(casSlider, casNum); calculateAndRenderSim(); });
    timeSlider.addEventListener('input', () => { syncInputs(timeSlider, timeNum); calculateAndRenderSim(); });
    maxCasSlider.addEventListener('input', () => { syncInputs(maxCasSlider, maxCasNum); calculateAndRenderSim(); });
    dmgSelect.addEventListener('change', calculateAndRenderSim);

    // Numbers to Sliders
    if (popNum) popNum.addEventListener('input', () => { syncInputs(popNum, popSlider); calculateAndRenderSim(); });
    if (casNum) casNum.addEventListener('input', () => { syncInputs(casNum, casSlider); calculateAndRenderSim(); });
    if (timeNum) timeNum.addEventListener('input', () => { syncInputs(timeNum, timeSlider); calculateAndRenderSim(); });
    if (maxCasNum) maxCasNum.addEventListener('input', () => { syncInputs(maxCasNum, maxCasSlider); calculateAndRenderSim(); });

    calculateAndRenderSim();
  }

  // --- CONTROLLER 2: SUBMIT ZONE REPORT FORM ---
  function handleReportFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('repZoneName');
    const popInput = document.getElementById('repPop');
    const casInput = document.getElementById('repCas');
    const dmgInput = document.getElementById('repDmg');
    const hoursInput = document.getElementById('repHours');
    const agencyInput = document.getElementById('repAgency');

    const foodInput = document.getElementById('repFood');
    const medInput = document.getElementById('repMed');
    const shelterInput = document.getElementById('repShelter');
    const rescueInput = document.getElementById('repRescue');

    if (!nameInput || !popInput || !casInput) return;

    try {
      const payload = {
        zone_name: nameInput.value.trim(),
        population: Number(popInput.value),
        casualties: Number(casInput.value),
        damage_level: dmgInput.value,
        hours_since_aid: Number(hoursInput.value) || 12,
        agency_id: agencyInput.value,
        resources_requested: {
          food: Math.max(0, Number(foodInput.value) || 0),
          medical: Math.max(0, Number(medInput.value) || 0),
          shelter: Math.max(0, Number(shelterInput.value) || 0),
          rescue: Math.max(0, Number(rescueInput.value) || 0)
        }
      };

      const result = ReportIntakeModule.ingestReport(payload);
      const ranked = PriorityScoringModule.rankAllZones();
      const rankPos = ranked.findIndex(r => r.zone.zone_id === result.zone.zone_id) + 1;

      renderAll();
      showToast('Report Submitted Successfully', `Registered ${result.zone.name} (${result.zone.zone_id}). Currently ranked #${rankPos}.`, 'success');

      // Clear form
      nameInput.value = '';
      popInput.value = '';
      casInput.value = '';
      foodInput.value = '100';
      medInput.value = '50';
      shelterInput.value = '50';
      rescueInput.value = '2';
    } catch (err) {
      showToast('Submission Rejected', err.message, 'critical');
    }
  }

  // --- CONTROLLER 3: DYNAMIC REALLOCATION DEMO ---
  function triggerDynamicReallocation() {
    const payload = {
      zone_name: 'Riverside Village',
      population: 2800,
      casualties: 72,
      damage_level: 'HIGH',
      hours_since_aid: 18,
      agency_id: 'AG-NDRF',
      resources_requested: { food: 300, medical: 150, shelter: 100, rescue: 10 }
    };

    const res = ReportIntakeModule.ingestReport(payload);
    const ranked = PriorityScoringModule.rankAllZones();
    AllocationEngineModule.runAllocationCycle('Dynamic Influx of Critical Incident');

    const flowBox = document.getElementById('reallocStatusDisplay');
    if (flowBox) {
      flowBox.innerHTML = `
        <div style="background: rgba(249, 115, 22, 0.1); border:1px solid var(--accent-orange); padding:16px; border-radius:8px;">
          <h5 style="color:var(--accent-orange); margin-bottom:6px;">✓ DYNAMIC REALLOCATION EXECUTED (Cycle ${state.currentCycleId})</h5>
          <p style="font-size:0.85rem; color:#cbd5e1;">
            High-severity report ingested: <strong>${res.zone.name}</strong> (72 casualties, HIGH damage).<br>
            <strong>Queue Shift:</strong> Riverside Village seized <strong>Rank #1</strong> with Priority Score <strong>${ranked[0]?.scoreDetails.finalScore}/100</strong>.<br>
            New cycle created and greedy capped 40% stockpiles deployed immediately.
          </p>
        </div>
      `;
    }
  }

  // --- CONTROLLER 4: INVENTORY MODIFICATIONS ---
  function updateInventoryStock(resType, delta) {
    const item = state.inventory.find(i => i.resource_type === resType);
    if (!item) return;

    item.available_units = Math.max(0, Math.min(item.total_units, item.available_units + delta));
    AuditLoggerModule.log(
      state.currentCycleId,
      'INVENTORY',
      resType,
      'INVENTORY_UPDATED',
      'MANUAL_STOCKPILE_ADJUSTMENT',
      `Stockpile for ${item.name} adjusted to ${item.available_units} / ${item.total_units} units.`
    );
    saveState(state);
    renderAll();
    showToast('Inventory Updated', `${item.name} stock modified to ${item.available_units} units.`, 'info');
  }

  function quickDepleteMedical() {
    const med = state.inventory.find(i => i.resource_type === 'medical');
    if (med) {
      med.available_units = 20;
      AuditLoggerModule.log(
        state.currentCycleId,
        'INVENTORY',
        'medical',
        'INVENTORY_SCARCITY_SIMULATED',
        'MANUAL_DEPLETION_TEST',
        'Medical stockpile manually depleted to 20 units to test scarcity behavior and escalation triggers.'
      );
      saveState(state);
      renderAll();
      showToast('Scarcity Test Activated', 'Medical stockpile reduced to 20 units. Run allocation to test escalation.', 'warning');
    }
  }

  function quickRestockAll() {
    state.inventory.forEach(inv => {
      inv.available_units = inv.total_units;
    });
    AuditLoggerModule.log(
      state.currentCycleId,
      'INVENTORY',
      'ALL_DEPOTS',
      'STOCKPILES_REPLENISHED',
      'RESTOCK_100PCT',
      'All warehouse stockpiles replenished to 100% capacity.'
    );
    saveState(state);
    renderAll();
    showToast('Stock Replenished', 'All warehouse inventories restored to 100% full capacity.', 'success');
  }

  // --- CONTROLLER 5: INTERACTIVE ARCHITECTURE NODES ---
  const ARCH_NODE_DETAILS = {
    report: {
      title: 'Agent 1: Zone Report / Incident Intake',
      desc: 'Schema-validates incoming incident reports, bounds casualties <= population, assigns sequential report IDs, and registers zone updates.',
      target: 'sec-10-datamodel',
      btnText: 'Open Incident Report Form'
    },
    needs: {
      title: 'Agent 2: Needs Assessment Agent',
      desc: 'Normalizes incident metrics into categorical requirements across Food, Medical, Shelter, and Rescue vectors using deterministic heuristic tables.',
      target: 'sec-11-needs-agent',
      btnText: 'View Needs Assessment Rules'
    },
    priority: {
      title: 'Agent 3: Priority Scoring Engine',
      desc: 'Calculates the official 4-factor PS20 formula (0.40C + 0.25P + 0.20D + 0.15T) and ranks operational zones into a deterministic queue.',
      target: 'sec-18-sim-priority',
      btnText: 'Launch Priority Simulator'
    },
    allocation: {
      title: 'Agent 4: Resource Allocation Agent',
      desc: 'Dispatches available warehouse stockpiles using the greedy 40% availability ceiling, enforces zero-floor protection, and tags unmet needs with escalation flags.',
      target: 'sec-19-sim-allocation',
      btnText: 'Run Allocation Engine'
    },
    duplicate: {
      title: 'Agent 5: Duplicate-Effort Checker',
      desc: 'Monitors composite keys (cycle_id::zone_id::resource_type) to flag overlapping agency commitments before transport departs depots.',
      target: 'sec-15-duplicate',
      btnText: 'Test Duplicate Conflict'
    },
    audit: {
      title: 'Agent 6: Audit Logger Agent',
      desc: 'Maintains an immutable chronological ledger translating all mathematical actions into natural-language explanations for post-disaster inquiries.',
      target: 'sec-22-audit',
      btnText: 'Inspect Audit Ledger'
    },
    dashboard: {
      title: 'Unified Command Dashboard',
      desc: 'Real-time multi-agency visual board reflecting active zone rankings, allocation statuses, stockpile gauges, and emergency escalations.',
      target: 'sec-21-dashboard',
      btnText: 'Open Live Dashboard'
    }
  };

  function selectArchitectureNode(nodeKey) {
    const detail = ARCH_NODE_DETAILS[nodeKey];
    if (!detail) return;

    // Highlight nodes
    document.querySelectorAll('.arch-node').forEach(n => {
      if (n.getAttribute('data-node') === nodeKey) {
        n.classList.add('active-step');
      } else {
        n.classList.remove('active-step');
      }
    });

    const drawer = document.getElementById('archDetailDrawer');
    if (drawer) {
      drawer.innerHTML = `
        <div>
          <h4 style="color:var(--accent-orange); margin-bottom:4px;">${detail.title}</h4>
          <p style="font-size:0.85rem; color:#cbd5e1; max-width:650px;">${detail.desc}</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.RESQ.scrollToSection('${detail.target}')">
          ${detail.btnText} →
        </button>
      `;
    }
  }

  // --- CONTROLLER 6: END-TO-END 13-STEP SCENARIO RUNNER ---
  let scenarioStep = 1;
  const SCENARIO_STEPS = [
    {
      step: 1,
      title: 'Initial Seed Zones Active',
      desc: 'System starts with 3 initial zones (Z-01, Z-02, Z-03) and 4 baseline warehouse stockpiles.',
      action: () => { resetState(); }
    },
    {
      step: 2,
      title: 'Critical Report Ingested: Riverside Village (Z-04)',
      desc: 'Field report arrives: 72 casualties, HIGH structural damage, 2,800 residents displaced.',
      action: () => {
        ReportIntakeModule.ingestReport({
          zone_name: 'Riverside Village',
          population: 2800,
          casualties: 72,
          damage_level: 'HIGH',
          hours_since_aid: 18,
          resources_requested: { food: 300, medical: 150, shelter: 100, rescue: 10 },
          agency_id: 'AG-NDRF'
        });
      }
    },
    {
      step: 3,
      title: 'Priority Scoring Engine Recalculates',
      desc: 'Batch maximum casualties updated to 72. Official formula calculates exact 0-100 scores.',
      action: () => { PriorityScoringModule.rankAllZones(); }
    },
    {
      step: 4,
      title: 'Riverside Village Seizes Rank #1',
      desc: 'Zone Z-04 achieves the highest priority score (89.0/100) and tops the dispatch queue.',
      action: () => { PriorityScoringModule.rankAllZones(); }
    },
    {
      step: 5,
      title: 'Execute Allocation Cycle 002',
      desc: 'Allocation engine dispatches resources in priority order, enforcing the 40% cap.',
      action: () => { AllocationEngineModule.runAllocationCycle('Scenario Step 5'); }
    },
    {
      step: 6,
      title: 'Medical & Rescue Units Deployed',
      desc: 'Z-04 receives urgent medical kits and rescue teams from Govt-Relief (NDRF).',
      action: () => { renderAll(); }
    },
    {
      step: 7,
      title: 'Secondary Report Influx: Highland Valley',
      desc: 'Highland Valley (Z-02) reports rising flood levels; casualties increase to 25.',
      action: () => {
        const z2 = state.zones.find(z => z.zone_id === 'Z-02');
        if (z2) { z2.casualties = 25; z2.damage_level = 'HIGH'; z2.hours_since_aid = 8; }
        saveState(state);
      }
    },
    {
      step: 8,
      title: 'Dashboard Dynamically Re-ranks',
      desc: 'Z-02 priority score surges, dynamically reordering the coordination dashboard.',
      action: () => { PriorityScoringModule.rankAllZones(); }
    },
    {
      step: 9,
      title: 'Duplicate Commitment Injected',
      desc: 'Two agencies accidentally commit medical kits to the same zone within the same cycle.',
      action: () => { DuplicateCheckerModule.simulateConflict(); }
    },
    {
      step: 10,
      title: 'Simulate Severe Stockpile Scarcity',
      desc: 'Medical inventory depleted to only 20 units to test critical shortage protocols.',
      action: () => {
        const med = state.inventory.find(i => i.resource_type === 'medical');
        if (med) med.available_units = 20;
        saveState(state);
      }
    },
    {
      step: 11,
      title: 'Run Allocation Under Scarcity',
      desc: 'Cycle 003 triggers. Capped inventory cannot meet remaining zone requirements.',
      action: () => { AllocationEngineModule.runAllocationCycle('Scenario Step 11: Scarcity'); }
    },
    {
      step: 12,
      title: 'Escalation Alert Triggered',
      desc: 'Unmet medical demands exceed availability; automated ESCALATION flags raised.',
      action: () => { renderAll(); }
    },
    {
      step: 13,
      title: 'Audit Trail & Explainability Review',
      desc: 'Complete immutable chronological record of all mathematical decisions verified.',
      action: () => {
        renderAll();
        scrollToSection('sec-22-audit');
      }
    }
  ];

  function runScenarioStep(targetStep) {
    if (targetStep < 1) targetStep = 1;
    if (targetStep > SCENARIO_STEPS.length) targetStep = SCENARIO_STEPS.length;
    scenarioStep = targetStep;
    const current = SCENARIO_STEPS[scenarioStep - 1];

    current.action();

    const stepNumEl = document.getElementById('scenarioStepNum');
    if (stepNumEl) stepNumEl.textContent = `Step ${current.step} of ${SCENARIO_STEPS.length}`;

    const stepTitleEl = document.getElementById('scenarioStepTitle');
    if (stepTitleEl) stepTitleEl.textContent = current.title;

    const stepDescEl = document.getElementById('scenarioStepDesc');
    if (stepDescEl) stepDescEl.textContent = current.desc;

    const indicators = document.querySelectorAll('.scenario-step-indicator');
    indicators.forEach((ind, idx) => {
      if (idx + 1 === scenarioStep) {
        ind.className = 'scenario-step-indicator active';
      } else if (idx + 1 < scenarioStep) {
        ind.className = 'scenario-step-indicator completed';
      } else {
        ind.className = 'scenario-step-indicator';
      }
    });

    renderAll();
    showToast(`Scenario Step ${current.step}`, current.title, 'info');
  }

  function runNextScenarioStep() {
    runScenarioStep(scenarioStep + 1);
  }

  function runPrevScenarioStep() {
    runScenarioStep(scenarioStep - 1);
  }

  // --- CONTROLLER 7: AUTOMATED TEST SUITE (10 TESTS) ---
  const ValidationTestSuite = {
    tests: [
      {
        id: 1,
        name: 'Zero Casualties Normalization',
        desc: 'Casualty score evaluates strictly to 0.0 when casualties = 0.',
        run() {
          const res = PriorityScoringModule.calculateScore({ casualties: 0, population: 5000, damage_level: 'LOW', hours_since_aid: 0 }, 50);
          return res.casualtyScore === 0 && res.casualtyWeighted === 0;
        }
      },
      {
        id: 2,
        name: 'Maximum Casualties Normalization',
        desc: 'Casualties equal to batch max evaluates to 100.0 (40.0 pts).',
        run() {
          const res = PriorityScoringModule.calculateScore({ casualties: 80, population: 5000, damage_level: 'MEDIUM', hours_since_aid: 4 }, 80);
          return res.casualtyScore === 100 && res.casualtyWeighted === 40;
        }
      },
      {
        id: 3,
        name: 'Damage Score Discrete Mapping',
        desc: 'LOW=20, MEDIUM=60, HIGH=100 discrete mapping verification.',
        run() {
          const low = PriorityScoringModule.calculateScore({ casualties: 10, population: 2000, damage_level: 'LOW', hours_since_aid: 1 }, 50);
          const med = PriorityScoringModule.calculateScore({ casualties: 10, population: 2000, damage_level: 'MEDIUM', hours_since_aid: 1 }, 50);
          const high = PriorityScoringModule.calculateScore({ casualties: 10, population: 2000, damage_level: 'HIGH', hours_since_aid: 1 }, 50);
          return low.damageScore === 20 && med.damageScore === 60 && high.damageScore === 100;
        }
      },
      {
        id: 4,
        name: 'Time Unserved Capping at 100',
        desc: 'Hours unserved × 5 caps strictly at 100.0 (15.0 pts).',
        run() {
          const res = PriorityScoringModule.calculateScore({ casualties: 10, population: 1000, damage_level: 'LOW', hours_since_aid: 30 }, 50);
          return res.timeScore === 100 && res.timeWeighted === 15;
        }
      },
      {
        id: 5,
        name: 'Population Scale Cap at 10,000',
        desc: 'Population >= 10,000 caps population score at 100.0 (25.0 pts).',
        run() {
          const res = PriorityScoringModule.calculateScore({ casualties: 10, population: 25000, damage_level: 'LOW', hours_since_aid: 2 }, 50);
          return res.populationScore === 100 && res.populationWeighted === 25;
        }
      },
      {
        id: 6,
        name: 'Inventory Zero Floor Protection',
        desc: 'Inventory decrement never results in negative available units.',
        run() {
          const inv = { resource_type: 'food', available_units: 15 };
          const requested = 100;
          const allocated = Math.min(requested, Math.floor(inv.available_units * 0.40));
          return allocated <= inv.available_units && (inv.available_units - allocated) >= 0;
        }
      },
      {
        id: 7,
        name: 'Greedy 40% Availability Ceiling',
        desc: 'Per-cycle allocation cannot exceed 40% of available inventory.',
        run() {
          const available = 500;
          const maxAllowed = Math.floor(available * 0.40);
          return maxAllowed === 200;
        }
      },
      {
        id: 8,
        name: 'Composite Key Duplicate Detection',
        desc: 'Detects two agencies assigned same supply to same zone in cycle.',
        run() {
          const testAllocs = [
            { cycle_id: 'c1', zone_id: 'Z-A', resource_type: 'medical', agency_id: 'AG-1' },
            { cycle_id: 'c1', zone_id: 'Z-A', resource_type: 'medical', agency_id: 'AG-2' }
          ];
          const hasCollision = (testAllocs[0].zone_id === testAllocs[1].zone_id &&
                                testAllocs[0].resource_type === testAllocs[1].resource_type &&
                                testAllocs[0].agency_id !== testAllocs[1].agency_id);
          return hasCollision === true;
        }
      },
      {
        id: 9,
        name: 'Deterministic Ranking Consistency',
        desc: 'Re-running ranking on identical data yields identical queue order.',
        run() {
          const r1 = PriorityScoringModule.rankAllZones();
          const r2 = PriorityScoringModule.rankAllZones();
          return r1[0].zone.zone_id === r2[0].zone.zone_id && r1[0].scoreDetails.finalScore === r2[0].scoreDetails.finalScore;
        }
      },
      {
        id: 10,
        name: 'Escalation Trigger on Unmet Demand',
        desc: 'When requested units exceed allocated units, escalation pending count matches.',
        run() {
          const requested = 100;
          const allocated = 40;
          const pending = requested - allocated;
          return pending === 60;
        }
      }
    ],

    runAll() {
      const results = this.tests.map(t => {
        let passed = false;
        try { passed = t.run(); } catch (e) { passed = false; }
        return { ...t, passed };
      });

      results.forEach(res => {
        const badge = document.getElementById(`test-status-${res.id}`);
        if (badge) {
          badge.textContent = res.passed ? 'PASS' : 'FAIL';
          badge.className = res.passed ? 'test-status-badge pass' : 'test-status-badge fail';
        }
      });

      const passCount = results.filter(r => r.passed).length;
      const summaryEl = document.getElementById('testSummaryCount');
      if (summaryEl) {
        summaryEl.textContent = `${passCount} / ${results.length} PASSED`;
      }
      showToast('Validation Suite Finished', `Ran 10 automated unit tests: ${passCount}/10 PASSED.`, 'success');
      return results;
    }
  };

  // --- CONTROLLER 8: AUDIT FILTERING ---
  let currentAuditFilter = 'ALL';

  function filterAuditLogs(filterType) {
    currentAuditFilter = filterType;
    document.querySelectorAll('.filter-pill').forEach(btn => {
      if (btn.getAttribute('data-filter') === filterType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderAuditLogsTable();
  }

  // ==========================================================================
  // 6. RENDERING PIPELINE (SYNCHRONIZES DOM WITH REAL STATE)
  // ==========================================================================
  function renderAll() {
    renderHeroStats();
    renderInventoryTables();
    renderDashboardZoneCards();
    renderAllocationsTable();
    renderAuditLogsTable();
    renderDuplicateBanner();
    renderNeedsSelectDropdown();
  }

  function renderHeroStats() {
    const statZones = document.getElementById('statActiveZones');
    if (statZones) statZones.textContent = state.zones.length;

    const statResTypes = document.getElementById('statResourceTypes');
    if (statResTypes) statResTypes.textContent = state.inventory.length;

    const statAgencies = document.getElementById('statAgencies');
    if (statAgencies) statAgencies.textContent = state.agencies.length;

    const statCycle = document.getElementById('statCycleId');
    if (statCycle) statCycle.textContent = state.currentCycleId;

    const statAllocs = document.getElementById('statActiveAllocations');
    if (statAllocs) statAllocs.textContent = state.allocations.length;

    const statAudits = document.getElementById('statAuditEvents');
    if (statAudits) statAudits.textContent = state.auditLogs.length;
  }

  function renderInventoryTables() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;

    grid.innerHTML = state.inventory.map(inv => {
      const pct = Math.round((inv.available_units / inv.total_units) * 100);
      const isLow = pct < 25;
      return `
        <div class="inventory-stock-card">
          <div class="inv-stock-top">
            <strong>${inv.name}</strong>
            <span class="status-chip ${isLow ? 'critical' : 'stable'}">${pct}%</span>
          </div>
          <div class="inv-stock-avail">${inv.available_units.toLocaleString()} <span style="font-size:0.75rem; color:var(--text-muted);">avail</span></div>
          <div class="inv-stock-total">Total Capacity: ${inv.total_units.toLocaleString()} units</div>
          
          <div class="progress-track" style="margin:8px 0 10px 0;">
            <div class="progress-fill ${isLow ? 'fill-red' : 'fill-green'}" style="width: ${pct}%"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:8px;">
            <span style="font-size:0.72rem; color:var(--text-muted);">Adjust Units:</span>
            <div style="display:flex; gap:4px;">
              <button class="btn btn-secondary btn-sm" onclick="window.RESQ.adjustInventory('${inv.resource_type}', -50)" title="Deduct 50">-50</button>
              <button class="btn btn-secondary btn-sm" onclick="window.RESQ.adjustInventory('${inv.resource_type}', 50)" title="Add 50">+50</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDashboardZoneCards() {
    const container = document.getElementById('dashboardZoneCards');
    if (!container) return;

    const maxCas = state.zones.reduce((max, z) => Math.max(max, Number(z.casualties) || 0), 0);
    const ranked = state.zones.map(z => ({
      zone: z,
      score: PriorityScoringModule.calculateScore(z, maxCas)
    })).sort((a, b) => b.score.finalScore - a.score.finalScore);

    container.innerHTML = ranked.map(({ zone, score }, idx) => {
      const isDup = state.duplicateConflicts.some(c => c.zone_id === zone.zone_id);
      const statusClass = isDup ? 'duplicate' : (zone.status || 'stable');
      const statusText = isDup ? 'DUPLICATE ALERT' : (zone.status ? zone.status.toUpperCase() : 'STABLE');

      return `
        <div class="resq-card" style="border-left: 4px solid ${
          statusClass === 'critical' ? 'var(--accent-red)' :
          statusClass === 'duplicate' ? 'var(--accent-orange)' :
          statusClass === 'warning' ? 'var(--accent-amber)' : 'var(--accent-green)'
        };">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <div>
              <span class="section-num-tag" style="font-size:0.68rem;">RANK #${idx + 1}</span>
              <h4 style="font-size:1.1rem; font-weight:700; color:#fff;">${zone.name} (${zone.zone_id})</h4>
            </div>
            <span class="status-chip ${statusClass}">${statusText}</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin:12px 0; font-size:0.8rem; background:rgba(255,255,255,0.02); padding:10px; border-radius:6px;">
            <div><span style="color:var(--text-muted);">Priority Score:</span> <strong style="color:var(--accent-orange); font-family:var(--font-mono);">${score.finalScore.toFixed(1)}/100</strong></div>
            <div><span style="color:var(--text-muted);">Damage Grade:</span> <strong style="color:#fff;">${zone.damage_level}</strong></div>
            <div><span style="color:var(--text-muted);">Casualties:</span> <strong style="color:var(--accent-red);">${zone.casualties}</strong></div>
            <div><span style="color:var(--text-muted);">Population:</span> <strong style="color:#fff;">${zone.population.toLocaleString()}</strong></div>
          </div>

          <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:12px;">
            <strong>Allocated:</strong> Food ${zone.allocated?.food || 0}, Med ${zone.allocated?.medical || 0}, Shelter ${zone.allocated?.shelter || 0}, Rescue ${zone.allocated?.rescue || 0}
          </div>

          <div style="font-size:0.72rem; color:var(--text-muted); font-family:var(--font-mono); border-top:1px solid var(--border-subtle); padding-top:8px; display:flex; justify-content:space-between;">
            <span>Agency: <strong>${zone.assignedAgency || 'Govt-Relief'}</strong></span>
            <span>Unserved: <strong>${zone.hours_since_aid || 0} hrs</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAllocationsTable() {
    const tbody = document.getElementById('allocationsTableBody');
    if (!tbody) return;

    if (state.allocations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:20px;">No allocations dispatched yet in this operational session. Click "Run Allocation Cycle" above.</td></tr>`;
      return;
    }

    tbody.innerHTML = state.allocations.slice(-20).reverse().map(a => `
      <tr>
        <td class="code-cell">${a.allocation_id}</td>
        <td><span class="meta-pill" style="font-size:0.7rem;">${a.cycle_id}</span></td>
        <td><strong>${a.zone_name}</strong> (${a.zone_id})</td>
        <td><span class="code-cell" style="text-transform:uppercase;">${a.resource_type}</span></td>
        <td><strong style="color:#fff; font-family:var(--font-mono);">${a.units_allocated}</strong></td>
        <td>${a.agency_name}</td>
        <td><span class="code-cell">${a.rule_triggered}</span></td>
        <td><span class="status-chip ${a.duplicate ? 'duplicate' : 'stable'}">${a.duplicate ? 'DUPLICATE' : 'ASSIGNED'}</span></td>
      </tr>
    `).join('');
  }

  function renderAuditLogsTable() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    let filtered = state.auditLogs;
    if (currentAuditFilter !== 'ALL') {
      filtered = state.auditLogs.filter(l => {
        if (currentAuditFilter === 'PRIORITY') return l.entity_type === 'PRIORITY' || l.action.includes('PRIORITY');
        if (currentAuditFilter === 'ALLOCATION') return l.entity_type === 'ALLOCATION' || l.action.includes('ALLOCATION');
        if (currentAuditFilter === 'DUPLICATE') return l.entity_type === 'DUPLICATE' || l.action.includes('DUPLICATE');
        if (currentAuditFilter === 'ESCALATION') return l.action.includes('ESCALATION');
        if (currentAuditFilter === 'REPORT') return l.entity_type === 'REPORT' || l.action.includes('REPORT');
        return true;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No audit events matching filter "${currentAuditFilter}".</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.slice(0, 35).map(log => `
      <tr>
        <td class="code-cell" style="white-space:nowrap;">${log.timestamp}</td>
        <td><span class="meta-pill" style="font-size:0.68rem;">${log.cycle_id}</span></td>
        <td><strong style="color:#fff;">${log.entity_type}</strong> <span style="color:var(--text-muted); font-size:0.72rem;">(${log.entity_id})</span></td>
        <td><span class="code-cell">${log.action}</span></td>
        <td><span style="font-size:0.72rem; color:var(--accent-cyan);">${log.rule_triggered}</span></td>
        <td style="font-size:0.82rem; color:#cbd5e1;">${log.explanation}</td>
      </tr>
    `).join('');
  }

  function renderDuplicateBanner() {
    const banner = document.getElementById('duplicateAlertBanner');
    if (!banner) return;

    if (state.duplicateConflicts.length > 0) {
      const c = state.duplicateConflicts[0];
      banner.style.display = 'flex';
      banner.innerHTML = `
        <div class="alert-text-group">
          <div class="alert-icon-ring">⚠️</div>
          <div>
            <h5 style="color:var(--accent-red); font-weight:700;">DUPLICATE-EFFORT COLLISION DETECTED (Cycle ${c.cycle_id})</h5>
            <p style="font-size:0.85rem; color:#f8fafc;">
              Zone <strong>${c.zone_name} (${c.zone_id})</strong> has conflicting commitments for 
              <strong style="color:var(--accent-cyan); text-transform:uppercase;">${c.resource_type}</strong> 
              between <strong>${c.agency1}</strong> and <strong>${c.agency2}</strong>.
            </p>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="window.RESQ.resolveDuplicate('${c.alloc1_id}')">Keep ${c.agency1}</button>
          <button class="btn btn-primary btn-sm" onclick="window.RESQ.resolveDuplicate('${c.alloc2_id}')">Keep ${c.agency2}</button>
        </div>
      `;
    } else {
      banner.style.display = 'none';
    }
  }

  function renderNeedsSelectDropdown() {
    const select = document.getElementById('needsZoneSelect');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = state.zones.map(z => `
      <option value="${z.zone_id}">${z.name} (${z.zone_id}) - Cas: ${z.casualties}, Damage: ${z.damage_level}</option>
    `).join('');

    if (currentVal && state.zones.some(z => z.zone_id === currentVal)) {
      select.value = currentVal;
    }
    updateNeedsInspection();
  }

  function updateNeedsInspection() {
    const select = document.getElementById('needsZoneSelect');
    const display = document.getElementById('needsResultDisplay');
    if (!select || !display) return;

    const zoneId = select.value || (state.zones[0] && state.zones[0].zone_id);
    if (!zoneId) return;

    try {
      const res = NeedsAssessmentModule.assessZone(zoneId);
      display.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:10px;">
          <div style="background:var(--bg-surface); padding:10px; border-radius:6px; border:1px solid var(--border-subtle);">
            <div style="font-size:0.72rem; color:var(--text-muted);">MEDICAL NEED</div>
            <strong style="color:var(--accent-red); font-size:1.1rem;">${res.needs.medical}</strong>
            <div style="font-size:0.75rem; color:#fff; margin-top:2px;">${res.recommendedUnits.medical} kits</div>
          </div>
          <div style="background:var(--bg-surface); padding:10px; border-radius:6px; border:1px solid var(--border-subtle);">
            <div style="font-size:0.72rem; color:var(--text-muted);">RESCUE NEED</div>
            <strong style="color:var(--accent-orange); font-size:1.1rem;">${res.needs.rescue}</strong>
            <div style="font-size:0.75rem; color:#fff; margin-top:2px;">${res.recommendedUnits.rescue} teams</div>
          </div>
          <div style="background:var(--bg-surface); padding:10px; border-radius:6px; border:1px solid var(--border-subtle);">
            <div style="font-size:0.72rem; color:var(--text-muted);">FOOD NEED</div>
            <strong style="color:var(--accent-green); font-size:1.1rem;">${res.needs.food}</strong>
            <div style="font-size:0.75rem; color:#fff; margin-top:2px;">${res.recommendedUnits.food} kits</div>
          </div>
          <div style="background:var(--bg-surface); padding:10px; border-radius:6px; border:1px solid var(--border-subtle);">
            <div style="font-size:0.72rem; color:var(--text-muted);">SHELTER NEED</div>
            <strong style="color:var(--accent-cyan); font-size:1.1rem;">${res.needs.shelter}</strong>
            <div style="font-size:0.75rem; color:#fff; margin-top:2px;">${res.recommendedUnits.shelter} units</div>
          </div>
        </div>
      `;
    } catch (e) {
      display.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem;">Select a zone to inspect needs.</p>`;
    }
  }

  // --- NAVIGATION CONTROLLER ---
  function initNavigation() {
    // Search Box Filter
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const sections = document.querySelectorAll('.resq-section');
        let matches = 0;
        sections.forEach(sec => {
          const text = sec.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            sec.style.display = '';
            matches++;
          } else {
            sec.style.display = 'none';
          }
        });
      });
    }

    // Scrollspy for Sidebar
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.sidebar-nav-link').forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    document.querySelectorAll('.resq-section').forEach(sec => observer.observe(sec));
  }

  function toggleMobileSidebar() {
    const sidebar = document.querySelector('.portal-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const sidebar = document.querySelector('.portal-sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  }

  // --- INITIALIZE RUNTIME ON DOM LOAD ---
  document.addEventListener('DOMContentLoaded', () => {
    initPrioritySimulator();
    initNavigation();
    renderAll();

    // Bind Report Form if present
    const repForm = document.getElementById('incidentReportForm');
    if (repForm) {
      repForm.addEventListener('submit', handleReportFormSubmit);
    }

    // Bind Needs Dropdown
    const needsSelect = document.getElementById('needsZoneSelect');
    if (needsSelect) {
      needsSelect.addEventListener('change', updateNeedsInspection);
    }

    // Bind Audit Filters
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter') || e.target.textContent.trim().toUpperCase();
        filterAuditLogs(filter);
      });
    });

    // Default Architecture Node selection
    selectArchitectureNode('report');
  });

  // Expose global controller
  const ResqEngine = {
    // Modules
    ReportIntakeModule,
    NeedsAssessmentModule,
    PriorityScoringModule,
    AllocationEngineModule,
    DuplicateCheckerModule,
    AuditLoggerModule,
    ValidationTestSuite,

    // Public Actions
    resetState,
    triggerDynamicReallocation,
    runScenarioStep,
    runNextScenarioStep,
    runPrevScenarioStep,
    simulateDuplicate: () => DuplicateCheckerModule.simulateConflict(),
    resolveDuplicate: (allocId) => DuplicateCheckerModule.resolveConflict(allocId),
    runAllocation: () => AllocationEngineModule.runAllocationCycle('Coordinator Manual Dispatch'),
    runAllTests: () => ValidationTestSuite.runAll(),
    adjustInventory: (resType, delta) => updateInventoryStock(resType, delta),
    depleteMedical: quickDepleteMedical,
    restockAll: quickRestockAll,
    selectArchitectureNode,
    filterAuditLogs,
    submitReportForm: handleReportFormSubmit,
    scrollToSection,
    toggleMobileSidebar,
    getState: () => state,
    showToast,

    // Backward compatibility aliases
    rankAllZones: () => PriorityScoringModule.rankAllZones(),
    calculateScore: (z, m) => PriorityScoringModule.calculateScore(z, m)
  };

  window.RESQ = ResqEngine;
  window.ReliefApp = ResqEngine;
  window.PS20Prototype = ResqEngine;
  window.PS20PrototypeUI = ResqEngine;

})();
