"""Veri doğrulama katmanı · HPAnalytic v1"""

# Gerçekçi aralıklar (2 takım toplamı)
RANGES = {
    'shots_total': (10, 40),
    'shots_per_team': (3, 25),
    'passes_per_team': (300, 900),
    'recoveries_per_team': (25, 100),
    'losses_per_team': (15, 80),
    'goals_total': (0, 10),
    'xg_total': (0.5, 6.5),
    'distance_per_team_m': (95000, 125000),
    'sprints_per_team': (60, 250),
    'ppda': (2.0, 25.0),
    'high_press_wins': (5, 40),
}

SEVERITY = {
    'shots_total': 'reject',      # 40+ şut yanlış
    'passes_per_team': 'warn',
    'distance_per_team_m': 'warn',
    'goals_total': 'reject',
    'ppda': 'warn',
    'default': 'warn'
}

def check(key, value):
    """Tek metrik kontrol. (ok, seviye, mesaj) döner."""
    if key not in RANGES:
        return (True, 'info', f'{key}: bilinmiyor, kontrol yok')
    lo, hi = RANGES[key]
    if value is None:
        return (True, 'info', f'{key}: boş, atlandı')
    if lo <= value <= hi:
        return (True, 'ok', f'{key}={value} (aralık {lo}-{hi})')
    sev = SEVERITY.get(key, 'warn')
    msg = f'{key}={value} ARALIK DIŞI (beklenen {lo}-{hi})'
    if sev == 'reject':
        return (False, 'reject', '❌ ' + msg + ' — pipeline durdurulmalı')
    return (True, 'warn', '⚠ ' + msg)

def pipeline_check(match_data):
    """Bir maçın tüm metriklerini kontrol et. Rapor döndür."""
    results = []
    d = match_data.get('derived', {})

    checks = [
        ('shots_total', d.get('shots', {}).get('total')),
        ('goals_total', d.get('goals', {}).get('total')),
        ('passes_per_team', (d.get('passes', {}).get('total') or 0) // 2),
        ('recoveries_per_team', (d.get('recoveries', {}).get('total') or 0) // 2),
        ('losses_per_team', (d.get('losses', {}).get('total') or 0) // 2),
    ]

    reject_count = 0
    warn_count = 0

    for key, val in checks:
        ok, sev, msg = check(key, val)
        results.append({'key': key, 'value': val, 'severity': sev, 'message': msg, 'ok': ok})
        if sev == 'reject': reject_count += 1
        elif sev == 'warn': warn_count += 1

    return {
        'results': results,
        'reject_count': reject_count,
        'warn_count': warn_count,
        'status': 'REJECT' if reject_count > 0 else ('WARN' if warn_count > 0 else 'OK'),
        'epistemic': 'KANIT',
        'caveat': 'Bu kontrol mantıksal aralık testidir. Doğrulanmış veri değildir.'
    }

if __name__ == '__main__':
    import json, sys
    if len(sys.argv) < 2:
        print('Kullanım: python3 sanity.py <analysis.json>')
        sys.exit(1)
    with open(sys.argv[1]) as f:
        data = json.load(f)
    print(json.dumps(pipeline_check(data), indent=2, ensure_ascii=False))
