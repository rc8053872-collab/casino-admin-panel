import { playerService } from './playerService';
import type {
  PlayerReportFilters,
  PlayerReportKPIs,
  PlayerGrowthDataPoint,
  RetentionCohortItem,
  EngagementOverview,
  ActivityDistributionItem,
  AcquisitionChannelItem,
  PlayerSegmentSummary,
  PlayerRiskData,
  ValueDistributionItem,
  PlayerActivityReportRow,
  FullPlayerReport,
} from '../types/playerReport';

class PlayerReportService {
  /**
   * Helper to compute dynamic scaling multiplier based on period filter
   */
  private getPeriodMultiplier(period: string): number {
    switch (period) {
      case 'today':
        return 0.35;
      case 'yesterday':
        return 0.32;
      case '7d':
        return 0.65;
      case 'this_month':
        return 0.95;
      case 'last_month':
        return 0.90;
      case '30d':
      default:
        return 1.0;
    }
  }

  /**
   * 1. Top KPI Row metrics
   */
  public async getPlayerKPIs(filters: PlayerReportFilters): Promise<PlayerReportKPIs> {
    const mult = this.getPeriodMultiplier(filters.period);

    const baseNew = Math.round(1248 * mult);
    const baseDau = Math.round(2421 * (0.85 + mult * 0.15));
    const baseArpu = Math.round(4280 * (0.9 + (mult % 0.2)));
    const flagged = Math.round(84 * (0.8 + mult * 0.2));

    return {
      newPlayers: baseNew,
      newPlayersTrend: 18.2,
      newPlayersSub: `${Math.round(baseNew * 0.33)} today`,

      dailyActiveUsers: baseDau,
      dauTrend: 8.4,
      dauSub: `Peak: ${Math.round(baseDau * 0.16)} concurrent`,

      retentionRate: 24.1,
      retentionTrend: 2.8,
      retentionSub: '30-day retention',

      averagePlayerValue: baseArpu,
      arpuTrend: 6.4,
      arpuSub: 'Average wallet + game value',

      fraudRiskRate: 0.65,
      flaggedAccounts: flagged,
      highRiskCount: 12,
      fraudSub: '12 high-risk',
    };
  }

  /**
   * 2. Player Growth & Activity Chart
   */
  public async getPlayerGrowth(filters: PlayerReportFilters): Promise<PlayerGrowthDataPoint[]> {
    const isShort = filters.period === 'today' || filters.period === 'yesterday';
    const is7d = filters.period === '7d';

    if (isShort) {
      // Hourly trend
      const hours = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'];
      return hours.map((h, i) => ({
        date: h,
        newPlayers: 40 + i * 14 + (i % 2 === 0 ? 12 : -8),
        activePlayers: 320 + i * 85 + (i % 3 === 0 ? 40 : -20),
        returningPlayers: 180 + i * 45 + (i % 2 === 0 ? 15 : -10),
      }));
    }

    if (is7d) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, i) => ({
        date: day,
        newPlayers: 140 + i * 18 + (i === 5 || i === 6 ? 45 : 0),
        activePlayers: 1850 + i * 110 + (i === 5 || i === 6 ? 320 : 0),
        returningPlayers: 920 + i * 75 + (i === 5 || i === 6 ? 160 : 0),
      }));
    }

    // Default 30 Days (sample 10 distributed intervals)
    const intervals = [
      'Oct 01', 'Oct 04', 'Oct 07', 'Oct 10', 'Oct 13',
      'Oct 16', 'Oct 19', 'Oct 22', 'Oct 25', 'Oct 28', 'Oct 31',
    ];

    return intervals.map((date, i) => ({
      date,
      newPlayers: 110 + i * 12 + (i % 3 === 0 ? 25 : -10),
      activePlayers: 1980 + i * 65 + (i % 2 === 0 ? 90 : -45),
      returningPlayers: 1140 + i * 48 + (i % 3 === 0 ? 60 : -30),
    }));
  }

  /**
   * 3. Retention Cohort Analysis
   */
  public async getRetentionData(filters: PlayerReportFilters): Promise<RetentionCohortItem[]> {
    const mult = this.getPeriodMultiplier(filters.period);
    const baseCohort = Math.round(1248 * mult);

    return [
      {
        cohort: 'Day 1',
        rate: 68.4,
        playerCount: Math.round(baseCohort * 0.684),
        cohortSize: baseCohort,
        returnedPlayers: Math.round(baseCohort * 0.684),
        dropOff: Math.round(baseCohort * (1 - 0.684)),
      },
      {
        cohort: 'Day 7',
        rate: 44.2,
        playerCount: Math.round(baseCohort * 0.442),
        cohortSize: baseCohort,
        returnedPlayers: Math.round(baseCohort * 0.442),
        dropOff: Math.round(baseCohort * (1 - 0.442)),
      },
      {
        cohort: 'Day 14',
        rate: 32.8,
        playerCount: Math.round(baseCohort * 0.328),
        cohortSize: baseCohort,
        returnedPlayers: Math.round(baseCohort * 0.328),
        dropOff: Math.round(baseCohort * (1 - 0.328)),
      },
      {
        cohort: 'Day 30',
        rate: 24.1,
        playerCount: Math.round(baseCohort * 0.241),
        cohortSize: baseCohort,
        returnedPlayers: Math.round(baseCohort * 0.241),
        dropOff: Math.round(baseCohort * (1 - 0.241)),
      },
    ];
  }

  /**
   * 4. Player Engagement Overview
   */
  public async getEngagementData(_filters: PlayerReportFilters): Promise<EngagementOverview> {
    return {
      avgSessionDuration: '18m 42s',
      sessionsPerPlayer: 4.8,
      gamesPerPlayer: 7.2,
      peakConcurrent: 386,
    };
  }

  /**
   * 5. Activity Distribution (Donut Chart)
   */
  public async getActivityDistribution(_filters: PlayerReportFilters): Promise<ActivityDistributionItem[]> {
    return [
      { name: 'Casual', percentage: 42, playerCount: 1016, color: '#3B82F6', segmentKey: 'casual' },
      { name: 'Regular', percentage: 31, playerCount: 750, color: '#10B981', segmentKey: 'regular' },
      { name: 'Highly Active', percentage: 18, playerCount: 435, color: '#8B5CF6', segmentKey: 'highly-active' },
      { name: 'Dormant', percentage: 9, playerCount: 220, color: '#94A3B8', segmentKey: 'dormant' },
    ];
  }

  /**
   * 6. Player Acquisition Channels
   */
  public async getAcquisitionData(_filters: PlayerReportFilters): Promise<AcquisitionChannelItem[]> {
    return [
      { channel: 'Organic', players: 524, percentage: 42, trend: 8.2 },
      { channel: 'Referral', players: 349, percentage: 28, trend: 12.4 },
      { channel: 'Campaign', players: 224, percentage: 18, trend: 5.1 },
      { channel: 'Direct', players: 151, percentage: 12, trend: -1.4 },
    ];
  }

  /**
   * 7. Top Player Segments Table
   */
  public async getPlayerSegments(_filters: PlayerReportFilters): Promise<PlayerSegmentSummary[]> {
    return [
      {
        segment: 'VIP',
        segmentKey: 'vip',
        players: 482,
        avgSession: '42m',
        avgSpend: 18420,
        retention: 78.4,
        trend: '+14.2%',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      {
        segment: 'High Value',
        segmentKey: 'high-value',
        players: 1240,
        avgSession: '31m',
        avgSpend: 8420,
        retention: 64.2,
        trend: '+9.5%',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      {
        segment: 'Regular',
        segmentKey: 'regular',
        players: 2150,
        avgSession: '22m',
        avgSpend: 3120,
        retention: 48.6,
        trend: '+4.1%',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        segment: 'New Players',
        segmentKey: 'new',
        players: 1248,
        avgSession: '14m',
        avgSpend: 1450,
        retention: 38.2,
        trend: '+18.2%',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      {
        segment: 'At Risk',
        segmentKey: 'at-risk',
        players: 842,
        avgSession: '8m',
        avgSpend: 1120,
        retention: 18.4,
        trend: '-12.8%',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      },
      {
        segment: 'Dormant',
        segmentKey: 'dormant',
        players: 610,
        avgSession: '3m',
        avgSpend: 420,
        retention: 6.2,
        trend: '-8.4%',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      },
    ];
  }

  /**
   * 8. Player Risk Monitor & Signals
   */
  public async getPlayerRisk(_filters: PlayerReportFilters): Promise<PlayerRiskData> {
    return {
      flaggedCount: 84,
      highRiskCount: 12,
      mediumRiskCount: 32,
      lowRiskCount: 40,
      signals: [
        { label: 'Rapid withdrawals', cases: 32, description: 'Multiple withdrawal requests within 10 minutes', riskFilter: 'rapid-withdrawals' },
        { label: 'Multiple accounts', cases: 21, description: 'Matched device fingerprint or identical IP cluster', riskFilter: 'multi-accounting' },
        { label: 'Unusual game activity', cases: 17, description: 'Win rates deviating >4σ from arena statistical baseline', riskFilter: 'gameplay-anomaly' },
        { label: 'Velocity anomaly', cases: 14, description: 'Sudden buyin volume surge (>5x 30d median)', riskFilter: 'velocity-spike' },
      ],
      trend: [
        { day: 'Mon', flags: 14, suspensions: 2, reviews: 8 },
        { day: 'Tue', flags: 18, suspensions: 3, reviews: 12 },
        { day: 'Wed', flags: 12, suspensions: 1, reviews: 9 },
        { day: 'Thu', flags: 22, suspensions: 4, reviews: 15 },
        { day: 'Fri', flags: 28, suspensions: 5, reviews: 19 },
        { day: 'Sat', flags: 35, suspensions: 6, reviews: 24 },
        { day: 'Sun', flags: 24, suspensions: 3, reviews: 17 },
      ],
    };
  }

  /**
   * 9. Player Value Distribution
   */
  public async getPlayerValueDistribution(_filters: PlayerReportFilters): Promise<ValueDistributionItem[]> {
    return [
      { tier: '₹0–₹1K', count: 1840, percentage: 38.4, avgActivity: '2.1 sessions/wk' },
      { tier: '₹1K–₹5K', count: 1420, percentage: 29.6, avgActivity: '4.8 sessions/wk' },
      { tier: '₹5K–₹10K', count: 820, percentage: 17.1, avgActivity: '8.4 sessions/wk' },
      { tier: '₹10K–₹50K', count: 540, percentage: 11.3, avgActivity: '14.2 sessions/wk' },
      { tier: '₹50K+', count: 172, percentage: 3.6, avgActivity: '22.8 sessions/wk' },
    ];
  }

  /**
   * 10. Recent Player Activity (Derived from real Player service objects)
   */
  public async getRecentPlayerActivity(filters: PlayerReportFilters): Promise<PlayerActivityReportRow[]> {
    const players = await playerService.getPlayers();

    // Map each real player to reporting telemetry
    const rows: PlayerActivityReportRow[] = players.map((p, idx) => {
      let segment = 'Regular';
      if (p.totalDeposits > 100000 || p.balance > 25000) segment = 'VIP';
      else if (p.totalDeposits > 30000) segment = 'High Value';
      else if (p.status === 'blocked' || p.riskTier === 'high' || p.riskTier === 'critical') segment = 'At Risk';
      else if (idx % 4 === 0) segment = 'New';

      let activityLevel: 'High' | 'Medium' | 'Low' = 'Medium';
      if (p.gamesPlayed > 300 || p.status === 'in_match') activityLevel = 'High';
      else if (p.gamesPlayed < 50 || p.status === 'offline') activityLevel = 'Low';

      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (p.riskTier === 'critical') riskLevel = 'Critical';
      else if (p.riskTier === 'high') riskLevel = 'High';
      else if (p.riskTier === 'medium') riskLevel = 'Medium';

      return {
        player: p,
        segment,
        lastActive: p.lastActiveAt || '5 min ago',
        sessionsCount: Math.max(4, Math.round(p.gamesPlayed / 12)),
        gamesCount: p.gamesPlayed,
        walletBalance: p.balance,
        activityLevel,
        riskLevel,
        status: p.status === 'in_match' ? 'In Match' : p.status === 'active' ? 'Active' : p.status === 'blocked' ? 'Blocked' : 'Suspended',
      };
    });

    // Apply filtering
    return rows.filter((r) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = `${r.player.firstName} ${r.player.lastName}`.toLowerCase().includes(q);
        const matchUser = r.player.username.toLowerCase().includes(q);
        const matchId = r.player.playerId.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchId) return false;
      }

      if (filters.segment && filters.segment !== 'all') {
        const segQuery = filters.segment.toLowerCase();
        if (!r.segment.toLowerCase().includes(segQuery)) return false;
      }

      if (filters.activity && filters.activity !== 'all') {
        if (r.activityLevel.toLowerCase() !== filters.activity.toLowerCase()) return false;
      }

      if (filters.risk && filters.risk !== 'all') {
        if (r.riskLevel.toLowerCase() !== filters.risk.toLowerCase()) return false;
      }

      return true;
    });
  }

  /**
   * 11. Dynamically generated Player Insights
   */
  public async generatePlayerInsights(filters: PlayerReportFilters): Promise<string[]> {
    const kpis = await this.getPlayerKPIs(filters);
    const retention = await this.getRetentionData(filters);
    const d1Rate = retention.find((r) => r.cohort === 'Day 1')?.rate || 68.4;

    return [
      `Day 1 retention reached ${d1Rate}% (+4.2% higher than the previous cohort benchmark).`,
      'Players acquired through referrals demonstrate 18% higher 30-day retention across card arenas.',
      'High-value and VIP players are returning 2.4× more frequently than casual cohorts.',
      `${kpis.flaggedAccounts} flagged accounts monitored for automated AML velocity spikes and buyin anomalies.`,
    ];
  }

  /**
   * 12. Complete Report Aggregate
   */
  public async getPlayerReport(filters: PlayerReportFilters): Promise<FullPlayerReport> {
    const [
      kpis,
      growth,
      retention,
      engagement,
      activityDistribution,
      acquisition,
      segments,
      risk,
      valueDistribution,
      recentActivity,
      insights,
    ] = await Promise.all([
      this.getPlayerKPIs(filters),
      this.getPlayerGrowth(filters),
      this.getRetentionData(filters),
      this.getEngagementData(filters),
      this.getActivityDistribution(filters),
      this.getAcquisitionData(filters),
      this.getPlayerSegments(filters),
      this.getPlayerRisk(filters),
      this.getPlayerValueDistribution(filters),
      this.getRecentPlayerActivity(filters),
      this.generatePlayerInsights(filters),
    ]);

    return {
      kpis,
      growth,
      retention,
      engagement,
      activityDistribution,
      acquisition,
      segments,
      risk,
      valueDistribution,
      recentActivity,
      insights,
    };
  }

  /**
   * 13. Export Player Report (CSV / PDF)
   */
  public async exportPlayerReport(
    format: 'csv' | 'pdf',
    filters: PlayerReportFilters
  ): Promise<void> {
    const report = await this.getPlayerReport(filters);

    if (format === 'csv') {
      const headers = [
        'Player ID',
        'Player Name',
        'Username',
        'Segment',
        'Joined At',
        'Last Active',
        'Sessions',
        'Games Played',
        'Wallet Balance (INR)',
        'Activity Level',
        'Risk Level',
        'Status',
      ];

      const csvRows = report.recentActivity.map((r) => [
        `"${r.player.playerId}"`,
        `"${r.player.firstName} ${r.player.lastName}"`,
        `"${r.player.username}"`,
        `"${r.segment}"`,
        `"${new Date(r.player.createdAt).toISOString().slice(0, 10)}"`,
        `"${r.lastActive}"`,
        r.sessionsCount,
        r.gamesCount,
        r.walletBalance,
        `"${r.activityLevel}"`,
        `"${r.riskLevel}"`,
        `"${r.status}"`,
      ]);

      const csvString = [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `player_analytics_report_${filters.period}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // PDF Printable Window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Player Analytics & Retention Report - ${filters.period.toUpperCase()}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
                h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
                p.sub { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 24px; }
                .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px; }
                .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
                .kpi-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .kpi-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
                th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
                th { background: #f1f5f9; font-weight: 700; color: #334155; }
                .insights { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 12px; }
                .insights h3 { margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #1e40af; }
                ul { margin: 0; padding-left: 20px; }
              </style>
            </head>
            <body>
              <h1>Game Admin Operations — Player Intelligence Report</h1>
              <p class="sub">Generated on ${new Date().toLocaleString()} • Period: ${filters.period.toUpperCase()}</p>
              
              <div class="kpis">
                <div class="kpi-card"><div class="kpi-label">New Players</div><div class="kpi-val">${report.kpis.newPlayers.toLocaleString()}</div></div>
                <div class="kpi-card"><div class="kpi-label">DAU</div><div class="kpi-val">${report.kpis.dailyActiveUsers.toLocaleString()}</div></div>
                <div class="kpi-card"><div class="kpi-label">Retention Rate</div><div class="kpi-val">${report.kpis.retentionRate}%</div></div>
                <div class="kpi-card"><div class="kpi-label">Avg Player Value</div><div class="kpi-val">₹${report.kpis.averagePlayerValue.toLocaleString()}</div></div>
                <div class="kpi-card"><div class="kpi-label">Risk Rate</div><div class="kpi-val">${report.kpis.fraudRiskRate}%</div></div>
              </div>

              <div class="insights">
                <h3>Executive Retention Insights</h3>
                <ul>
                  ${report.insights.map((ins) => `<li>${ins}</li>`).join('')}
                </ul>
              </div>

              <h3>Recent Player Activity Ledger</h3>
              <table>
                <thead>
                  <tr>
                    <th>Player ID</th>
                    <th>Name</th>
                    <th>Segment</th>
                    <th>Sessions</th>
                    <th>Games</th>
                    <th>Wallet Balance</th>
                    <th>Activity</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.recentActivity
                    .slice(0, 15)
                    .map(
                      (r) => `
                    <tr>
                      <td>${r.player.playerId}</td>
                      <td>${r.player.firstName} ${r.player.lastName}</td>
                      <td>${r.segment}</td>
                      <td>${r.sessionsCount}</td>
                      <td>${r.gamesCount}</td>
                      <td>₹${r.walletBalance.toLocaleString()}</td>
                      <td>${r.activityLevel}</td>
                      <td>${r.riskLevel}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  }
}

export const playerReportService = new PlayerReportService();
