from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

ACTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT']

def get_next_state(r, c, action, n, obstacles):
    if action == 'UP':
        nr, nc = r - 1, c
    elif action == 'DOWN':
        nr, nc = r + 1, c
    elif action == 'LEFT':
        nr, nc = r, c - 1
    elif action == 'RIGHT':
        nr, nc = r, c + 1
    else:
        return r, c

    if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in obstacles:
        return nr, nc
    return r, c

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/evaluate_random', methods=['POST'])
def evaluate_random():
    data = request.json
    n = data['n']
    obstacles = set(tuple(o) for o in data['obstacles'])
    end_cell = tuple(data['end'])
    
    # 1. 隨機生成 policy
    policy = {}
    for r in range(n):
        for c in range(n):
            if (r, c) not in obstacles and (r, c) != end_cell:
                policy[(r, c)] = random.choice(ACTIONS)
                
    # 2. 策略評估 (Policy Evaluation)
    V = {(r, c): 0.0 for r in range(n) for c in range(n)}
    gamma = 0.99
    threshold = 1e-5
    max_iters = 10000
    
    iters = 0
    while iters < max_iters:
        delta = 0
        new_V = V.copy()
        for r in range(n):
            for c in range(n):
                state = (r, c)
                if state in obstacles or state == end_cell:
                    continue
                
                action = policy[state]
                next_state = get_next_state(r, c, action, n, obstacles)
                reward = -1  # 步數懲罰
                
                v = reward + gamma * V[next_state]
                new_V[state] = v
                delta = max(delta, abs(v - V[state]))
                
        V = new_V
        if delta < threshold:
            break
        iters += 1
            
    return jsonify({
        'values': [{'r': r, 'c': c, 'v': round(V[(r, c)], 2)} for r in range(n) for c in range(n)],
        'policy': [{'r': r, 'c': c, 'a': policy.get((r, c), None)} for r in range(n) for c in range(n)]
    })

@app.route('/api/value_iteration', methods=['POST'])
def value_iteration():
    data = request.json
    n = data['n']
    obstacles = set(tuple(o) for o in data['obstacles'])
    end_cell = tuple(data['end'])
    
    V = {(r, c): 0.0 for r in range(n) for c in range(n)}
    policy = {}
    gamma = 0.99
    threshold = 1e-5
    max_iters = 10000
    
    # Value Iteration
    iters = 0
    while iters < max_iters:
        delta = 0
        new_V = V.copy()
        for r in range(n):
            for c in range(n):
                state = (r, c)
                if state in obstacles or state == end_cell:
                    continue
                
                max_v = -float('inf')
                
                for action in ACTIONS:
                    next_state = get_next_state(r, c, action, n, obstacles)
                    reward = -1
                    v = reward + gamma * V[next_state]
                    if v > max_v:
                        max_v = v
                        
                new_V[state] = max_v
                delta = max(delta, abs(max_v - V[state]))
                
        V = new_V
        if delta < threshold:
            break
        iters += 1
            
    # Extract Policy
    for r in range(n):
        for c in range(n):
            state = (r, c)
            if state in obstacles or state == end_cell:
                continue
            
            max_v = -float('inf')
            best_action = None
            for action in ACTIONS:
                next_state = get_next_state(r, c, action, n, obstacles)
                reward = -1
                v = reward + gamma * V[next_state]
                if v > max_v + 1e-9:
                    max_v = v
                    best_action = action
            policy[state] = best_action

    return jsonify({
        'values': [{'r': r, 'c': c, 'v': round(V[(r, c)], 2)} for r in range(n) for c in range(n)],
        'policy': [{'r': r, 'c': c, 'a': policy.get((r, c), None)} for r in range(n) for c in range(n)]
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)
