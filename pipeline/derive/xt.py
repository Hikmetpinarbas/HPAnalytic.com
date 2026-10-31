import math
GRID_X, GRID_Y = 10, 8
CELL_W, CELL_H = 105/GRID_X, 68/GRID_Y

def prior_xt(x, y):
    goal_x, goal_y = 105, 34
    dist = math.sqrt((goal_x - x)**2 + (goal_y - y)**2)
    if dist < 0.5: return 0.95
    dx, dy = goal_x - x, goal_y - y
    angle = math.atan2(abs(dy), max(dx, 0.5))
    angular = math.cos(min(angle, math.pi/2 - 0.05)) ** 2
    base = 0.95 * math.exp(-dist / 24)
    return round(min(0.95, base * (0.35 + 0.65 * angular)), 3)

def flip(x, y, team_code, target='GS'):
    if team_code != target:
        return 105 - x, 68 - y
    return x, y

def cell_of(x, y):
    c = min(int(x / CELL_W), GRID_X - 1)
    r = min(int(y / CELL_H), GRID_Y - 1)
    return r, c

def build_grid(match, target='GS'):
    grid = {}
    for r in range(GRID_Y):
        for c in range(GRID_X):
            cx, cy = (c+0.5)*CELL_W, (r+0.5)*CELL_H
            grid[(r,c)] = {
                'row': r, 'col': c, 'cx': round(cx,1), 'cy': round(cy,1),
                'prior': prior_xt(cx, cy), 'events': 0, 'goals': 0, 'shots': 0,
            }
    for ev in match.events:
        if ev.x is None or ev.y is None: continue
        if ev.x == 0 and ev.y == 0: continue
        x, y = flip(ev.x, ev.y, ev.team_code(), target)
        if not (0 <= x <= 105 and 0 <= y <= 68): continue
        r, c = cell_of(x, y)
        cell = grid[(r,c)]
        cell['events'] += 1
        if ev.kind == 'goal': cell['goals'] += 1
        if ev.kind in ('shot','goal'): cell['shots'] += 1
    max_ev = max(c['events'] for c in grid.values()) or 1
    out = []
    for cell in grid.values():
        local = (cell['goals']*10 + cell['shots']*3 + cell['events']) / (max_ev + 10)
        local = min(1.0, local)
        xt = cell['prior'] * 0.75 + cell['prior'] * 0.25 * local
        out.append({**cell, 'local': round(local,3), 'xT': round(xt, 3)})
    return out

def trace_goal(match, goal_ev, grid, window_s=15):
    team = goal_ev.team_code()
    t_end = goal_ev.t
    DEDUP_SKIP = {'Shots on target', 'Chances', 'Chances created',
                  'Key passes accurate', 'Assists',
                  'Involvement in positional attacks with shots'}
    seq = [e for e in match.events
           if e.team_code() == team and t_end - window_s <= e.t <= t_end
           and e.x is not None and e.y is not None]
    seq.sort(key=lambda e: e.t)
    seen, cells = set(), []
    for e in seq:
        if e.action in DEDUP_SKIP: continue
        key = (round(e.t, 1), e.action)
        if key in seen: continue
        seen.add(key)
        x, y = flip(e.x, e.y, team, team)
        r, c = cell_of(x, y)
        cell = next((cc for cc in grid if cc['row']==r and cc['col']==c), None)
        cells.append({'t': round(e.t, 2), 'action': e.action, 'kind': e.kind,
                      'row': r, 'col': c, 'xT': cell['xT'] if cell else 0})
    cells = cells[-8:]
    return {'minute': round(t_end/60, 1), 'team': team,
            'goal_x': goal_ev.x, 'goal_y': goal_ev.y,
            'cells': cells, 'peak_xT': max((c['xT'] for c in cells), default=0)}
