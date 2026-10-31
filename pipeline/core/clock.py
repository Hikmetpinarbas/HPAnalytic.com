HALF2_RESET = 2848.12

def correct_clock(t_raw: float, half: int, reset: float = HALF2_RESET) -> float:
    if half == 2:
        return t_raw - reset
    return t_raw
